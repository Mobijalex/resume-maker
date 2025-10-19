/**
 * Error factory for creating standardized error objects
 */

import type {
    AppError,
    BaseError,
    FileError,
    ParsingError,
    ValidationError,
    PDFError,
    TemplateError,
    NetworkError,
    ErrorType,
    ErrorSeverity,
    ErrorFactory as IErrorFactory
} from '../types/errors';

/**
 * Generates unique error IDs
 */
function generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Error factory implementation
 */
export class ErrorFactory implements IErrorFactory {
    /**
     * Create a file upload error
     */
    createFileError(
        message: string,
        userMessage: string,
        context?: Partial<FileError>
    ): FileError {
        return {
            id: generateErrorId(),
            type: 'FILE_UPLOAD',
            severity: context?.severity || 'MEDIUM',
            message,
            userMessage,
            timestamp: new Date(),
            fileName: context?.fileName,
            fileSize: context?.fileSize,
            fileType: context?.fileType,
            context: context?.context
        };
    }

    /**
     * Create a parsing error
     */
    createParsingError(
        message: string,
        userMessage: string,
        context?: Partial<ParsingError>
    ): ParsingError {
        return {
            id: generateErrorId(),
            type: 'PARSING',
            severity: context?.severity || 'MEDIUM',
            message,
            userMessage,
            timestamp: new Date(),
            lineNumber: context?.lineNumber,
            section: context?.section,
            markdownContent: context?.markdownContent,
            context: context?.context
        };
    }

    /**
     * Create a validation error
     */
    createValidationError(
        message: string,
        userMessage: string,
        context?: Partial<ValidationError>
    ): ValidationError {
        return {
            id: generateErrorId(),
            type: 'VALIDATION',
            severity: context?.severity || 'MEDIUM',
            message,
            userMessage,
            timestamp: new Date(),
            field: context?.field,
            section: context?.section,
            expectedFormat: context?.expectedFormat,
            actualValue: context?.actualValue,
            details: context?.details,
            context: context?.context
        };
    }

    /**
     * Create a PDF generation error
     */
    createPDFError(
        message: string,
        userMessage: string,
        context?: Partial<PDFError>
    ): PDFError {
        return {
            id: generateErrorId(),
            type: 'PDF_GENERATION',
            severity: context?.severity || 'HIGH',
            message,
            userMessage,
            timestamp: new Date(),
            templateId: context?.templateId,
            stage: context?.stage,
            context: context?.context
        };
    }

    /**
     * Create a template error
     */
    createTemplateError(
        message: string,
        userMessage: string,
        context?: Partial<TemplateError>
    ): TemplateError {
        return {
            id: generateErrorId(),
            type: 'TEMPLATE',
            severity: context?.severity || 'MEDIUM',
            message,
            userMessage,
            timestamp: new Date(),
            templateId: context?.templateId,
            configSection: context?.configSection,
            context: context?.context
        };
    }

    /**
     * Create a network error
     */
    createNetworkError(
        message: string,
        userMessage: string,
        context?: Partial<NetworkError>
    ): NetworkError {
        return {
            id: generateErrorId(),
            type: 'NETWORK',
            severity: context?.severity || 'HIGH',
            message,
            userMessage,
            timestamp: new Date(),
            url: context?.url,
            statusCode: context?.statusCode,
            method: context?.method,
            context: context?.context
        };
    }

    /**
     * Create a generic base error
     */
    createBaseError(
        type: ErrorType,
        severity: ErrorSeverity,
        message: string,
        userMessage: string,
        context?: Record<string, any>
    ): BaseError {
        return {
            id: generateErrorId(),
            type,
            severity,
            message,
            userMessage,
            timestamp: new Date(),
            context
        };
    }
}

/**
 * Default error factory instance
 */
export const errorFactory = new ErrorFactory();

/**
 * Utility functions for error handling
 */
export class ErrorUtils {
    /**
     * Check if an error is critical
     */
    static isCritical(error: AppError): boolean {
        return error.severity === 'CRITICAL';
    }

    /**
     * Check if an error is high priority
     */
    static isHighPriority(error: AppError): boolean {
        return error.severity === 'HIGH' || error.severity === 'CRITICAL';
    }

    /**
     * Get user-friendly error message
     */
    static getUserMessage(error: AppError): string {
        return error.userMessage || error.message;
    }

    /**
     * Format error for logging
     */
    static formatForLogging(error: AppError): string {
        return `[${error.type}:${error.severity}] ${error.message} (ID: ${error.id})`;
    }

    /**
     * Group errors by type
     */
    static groupByType(errors: AppError[]): Record<ErrorType, AppError[]> {
        const grouped: Record<string, AppError[]> = {};

        for (const error of errors) {
            if (!grouped[error.type]) {
                grouped[error.type] = [];
            }
            grouped[error.type].push(error);
        }

        return grouped as Record<ErrorType, AppError[]>;
    }

    /**
     * Group errors by severity
     */
    static groupBySeverity(errors: AppError[]): Record<ErrorSeverity, AppError[]> {
        const grouped: Record<string, AppError[]> = {};

        for (const error of errors) {
            if (!grouped[error.severity]) {
                grouped[error.severity] = [];
            }
            grouped[error.severity].push(error);
        }

        return grouped as Record<ErrorSeverity, AppError[]>;
    }

    /**
     * Filter errors by section
     */
    static filterBySection(errors: ValidationError[], section: string): ValidationError[] {
        return errors.filter(error => error.section === section);
    }

    /**
     * Get the most severe error from a list
     */
    static getMostSevere(errors: AppError[]): AppError | null {
        if (errors.length === 0) return null;

        const severityOrder: Record<ErrorSeverity, number> = {
            'CRITICAL': 4,
            'HIGH': 3,
            'MEDIUM': 2,
            'LOW': 1
        };

        return errors.reduce((mostSevere, current) => {
            return severityOrder[current.severity] > severityOrder[mostSevere.severity]
                ? current
                : mostSevere;
        });
    }

    /**
     * Create a summary of errors
     */
    static createSummary(errors: AppError[]): {
        total: number;
        byType: Record<ErrorType, number>;
        bySeverity: Record<ErrorSeverity, number>;
        critical: AppError[];
        high: AppError[];
    } {
        const byType: Record<string, number> = {};
        const bySeverity: Record<string, number> = {};
        const critical: AppError[] = [];
        const high: AppError[] = [];

        for (const error of errors) {
            // Count by type
            byType[error.type] = (byType[error.type] || 0) + 1;

            // Count by severity
            bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;

            // Collect critical and high priority errors
            if (error.severity === 'CRITICAL') {
                critical.push(error);
            } else if (error.severity === 'HIGH') {
                high.push(error);
            }
        }

        return {
            total: errors.length,
            byType: byType as Record<ErrorType, number>,
            bySeverity: bySeverity as Record<ErrorSeverity, number>,
            critical,
            high
        };
    }
}