/**
 * Comprehensive error handler for the resume converter application
 */

import type {
    AppError,
    FileError,
    ParsingError,
    ValidationError,
    PDFError,
    TemplateError,
    NetworkError,
    ErrorType,
    ErrorSeverity,
    ErrorHandler as IErrorHandler
} from '../types/errors';
import { ErrorUtils } from './errorFactory';

/**
 * Error handler implementation
 */
export class ErrorHandler implements IErrorHandler {
    private errors: AppError[] = [];
    private errorListeners: ((errors: AppError[]) => void)[] = [];

    /**
     * Handle file upload errors
     */
    handleFileError(error: FileError): void {
        this.addError(error);
        this.logError(error);

        // Show immediate user feedback for file errors
        this.showUserFriendlyMessage(error);
    }

    /**
     * Handle parsing errors
     */
    handleParsingError(error: ParsingError): void {
        this.addError(error);
        this.logError(error);

        // Parsing errors should be shown to user immediately
        this.showUserFriendlyMessage(error);
    }

    /**
     * Handle validation errors
     */
    handleValidationError(error: ValidationError): void {
        this.addError(error);
        this.logError(error);

        // Validation errors are typically shown in bulk
        // Individual errors may not need immediate display
        if (error.severity === 'CRITICAL' || error.severity === 'HIGH') {
            this.showUserFriendlyMessage(error);
        }
    }

    /**
     * Handle PDF generation errors
     */
    handlePDFError(error: PDFError): void {
        this.addError(error);
        this.logError(error);

        // PDF errors are critical and should be shown immediately
        this.showUserFriendlyMessage(error);
    }

    /**
     * Handle template errors
     */
    handleTemplateError(error: TemplateError): void {
        this.addError(error);
        this.logError(error);

        // Template errors should be shown to user
        this.showUserFriendlyMessage(error);
    }

    /**
     * Handle network errors
     */
    handleNetworkError(error: NetworkError): void {
        this.addError(error);
        this.logError(error);

        // Network errors are typically critical
        this.showUserFriendlyMessage(error);
    }

    /**
     * Show user-friendly error message
     */
    showUserFriendlyMessage(error: AppError): void {
        // In a real application, this would integrate with a toast/notification system
        // For now, we'll use console.warn to show user messages
        console.warn(`User Message: ${error.userMessage}`);

        // You could also dispatch to a notification system here
        this.notifyErrorListeners();
    }

    /**
     * Log error for debugging
     */
    logError(error: AppError): void {
        const logMessage = ErrorUtils.formatForLogging(error);

        if (ErrorUtils.isCritical(error)) {
            console.error(logMessage, error);
        } else if (ErrorUtils.isHighPriority(error)) {
            console.warn(logMessage, error);
        } else {
            console.info(logMessage, error);
        }
    }

    /**
     * Clear all errors
     */
    clearErrors(): void {
        this.errors = [];
        this.notifyErrorListeners();
    }

    /**
     * Clear errors by type
     */
    clearErrorsByType(type: ErrorType): void {
        this.errors = this.errors.filter(error => error.type !== type);
        this.notifyErrorListeners();
    }

    /**
     * Clear errors by severity
     */
    clearErrorsBySeverity(severity: ErrorSeverity): void {
        this.errors = this.errors.filter(error => error.severity !== severity);
        this.notifyErrorListeners();
    }

    /**
     * Get errors by type
     */
    getErrorsByType(type: ErrorType): AppError[] {
        return this.errors.filter(error => error.type === type);
    }

    /**
     * Get errors by severity
     */
    getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
        return this.errors.filter(error => error.severity === severity);
    }

    /**
     * Get all errors
     */
    getAllErrors(): AppError[] {
        return [...this.errors];
    }

    /**
     * Get validation errors by section
     */
    getValidationErrorsBySection(section: string): ValidationError[] {
        return this.errors
            .filter((error): error is ValidationError => error.type === 'VALIDATION')
            .filter(error => error.section === section);
    }

    /**
     * Check if there are any critical errors
     */
    hasCriticalErrors(): boolean {
        return this.errors.some(error => error.severity === 'CRITICAL');
    }

    /**
     * Check if there are any high priority errors
     */
    hasHighPriorityErrors(): boolean {
        return this.errors.some(error => ErrorUtils.isHighPriority(error));
    }

    /**
     * Check if there are any errors of a specific type
     */
    hasErrorsOfType(type: ErrorType): boolean {
        return this.errors.some(error => error.type === type);
    }

    /**
     * Get error summary
     */
    getErrorSummary() {
        return ErrorUtils.createSummary(this.errors);
    }

    /**
     * Add error to the collection
     */
    private addError(error: AppError): void {
        this.errors.push(error);
        this.notifyErrorListeners();
    }

    /**
     * Subscribe to error changes
     */
    onErrorsChanged(listener: (errors: AppError[]) => void): () => void {
        this.errorListeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.errorListeners.indexOf(listener);
            if (index > -1) {
                this.errorListeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify all error listeners
     */
    private notifyErrorListeners(): void {
        for (const listener of this.errorListeners) {
            try {
                listener([...this.errors]);
            } catch (error) {
                console.error('Error in error listener:', error);
            }
        }
    }

    /**
     * Create user-friendly error messages for common scenarios
     */
    static createUserFriendlyMessages(errors: AppError[]): {
        summary: string;
        details: string[];
        suggestions: string[];
    } {
        const summary = ErrorUtils.createSummary(errors);
        const details: string[] = [];
        const suggestions: string[] = [];

        // Group errors by type for better messaging
        const grouped = ErrorUtils.groupByType(errors);

        // File upload errors
        if (grouped.FILE_UPLOAD?.length > 0) {
            details.push(`${grouped.FILE_UPLOAD.length} file upload issue(s)`);
            suggestions.push('Check that your file is a valid .md file under 5MB');
        }

        // Parsing errors
        if (grouped.PARSING?.length > 0) {
            details.push(`${grouped.PARSING.length} parsing issue(s)`);
            suggestions.push('Review your Markdown formatting and section headers');
        }

        // Validation errors
        if (grouped.VALIDATION?.length > 0) {
            details.push(`${grouped.VALIDATION.length} validation issue(s)`);
            suggestions.push('Complete all required fields and check formatting');
        }

        // PDF generation errors
        if (grouped.PDF_GENERATION?.length > 0) {
            details.push(`${grouped.PDF_GENERATION.length} PDF generation issue(s)`);
            suggestions.push('Try refreshing the page or using a different browser');
        }

        // Template errors
        if (grouped.TEMPLATE?.length > 0) {
            details.push(`${grouped.TEMPLATE.length} template issue(s)`);
            suggestions.push('Try selecting a different template');
        }

        // Create overall summary message
        let summaryMessage = '';
        if (summary.critical.length > 0) {
            summaryMessage = `${summary.critical.length} critical issue(s) need immediate attention`;
        } else if (summary.high.length > 0) {
            summaryMessage = `${summary.high.length} important issue(s) should be resolved`;
        } else if (summary.total > 0) {
            summaryMessage = `${summary.total} issue(s) found that may affect your resume`;
        } else {
            summaryMessage = 'No issues found';
        }

        return {
            summary: summaryMessage,
            details,
            suggestions
        };
    }

    /**
     * Validate that the error handler is working correctly
     */
    static validateErrorHandler(handler: ErrorHandler): boolean {
        try {
            // Test basic functionality
            const testError = {
                id: 'test',
                type: 'VALIDATION' as ErrorType,
                severity: 'LOW' as ErrorSeverity,
                message: 'Test error',
                userMessage: 'Test user message',
                timestamp: new Date()
            };

            handler.handleValidationError(testError as ValidationError);
            const errors = handler.getAllErrors();
            const hasTestError = errors.some(e => e.id === 'test');

            handler.clearErrors();
            const clearedErrors = handler.getAllErrors();

            return hasTestError && clearedErrors.length === 0;
        } catch (error) {
            console.error('Error handler validation failed:', error);
            return false;
        }
    }
}

/**
 * Default error handler instance
 */
export const errorHandler = new ErrorHandler();

/**
 * Error boundary helper for React components
 */
export class ErrorBoundaryHelper {
    /**
     * Handle React error boundary errors
     */
    static handleReactError(error: Error, errorInfo: any): AppError {
        const appError: AppError = {
            id: `react_error_${Date.now()}`,
            type: 'UNKNOWN',
            severity: 'CRITICAL',
            message: error.message,
            userMessage: 'An unexpected error occurred. Please refresh the page and try again.',
            timestamp: new Date(),
            context: {
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                errorBoundary: true
            }
        };

        errorHandler.logError(appError);
        return appError;
    }

    /**
     * Handle promise rejections
     */
    static handleUnhandledRejection(event: PromiseRejectionEvent): AppError {
        const appError: AppError = {
            id: `promise_rejection_${Date.now()}`,
            type: 'UNKNOWN',
            severity: 'HIGH',
            message: event.reason?.message || 'Unhandled promise rejection',
            userMessage: 'An error occurred while processing your request. Please try again.',
            timestamp: new Date(),
            context: {
                reason: event.reason,
                promise: event.promise,
                unhandledRejection: true
            }
        };

        errorHandler.logError(appError);
        return appError;
    }
}