/**
 * Error handling and validation interfaces
 */

export const ErrorType = {
    FILE_UPLOAD: 'FILE_UPLOAD',
    PARSING: 'PARSING',
    VALIDATION: 'VALIDATION',
    PDF_GENERATION: 'PDF_GENERATION',
    TEMPLATE: 'TEMPLATE',
    NETWORK: 'NETWORK',
    UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export const ErrorSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

export interface BaseError {
    id: string;
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    userMessage: string;
    timestamp: Date;
    context?: Record<string, any>;
}

export interface FileError extends BaseError {
    type: 'FILE_UPLOAD';
    fileName?: string;
    fileSize?: number;
    fileType?: string;
}

export interface ParsingError extends BaseError {
    type: 'PARSING';
    lineNumber?: number;
    section?: string;
    markdownContent?: string;
}

export interface ValidationError extends BaseError {
    type: 'VALIDATION';
    field?: string;
    section?: string;
    expectedFormat?: string;
    actualValue?: any;
    details?: string;
}

export interface PDFError extends BaseError {
    type: 'PDF_GENERATION';
    templateId?: string;
    stage?: 'initialization' | 'content_generation' | 'formatting' | 'output';
}

export interface TemplateError extends BaseError {
    type: 'TEMPLATE';
    templateId?: string;
    configSection?: string;
}

export interface NetworkError extends BaseError {
    type: 'NETWORK';
    url?: string;
    statusCode?: number;
    method?: string;
}

export type AppError = FileError | ParsingError | ValidationError | PDFError | TemplateError | NetworkError | BaseError;

// Validation result interfaces
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

export interface FieldValidationResult {
    field: string;
    isValid: boolean;
    error?: ValidationError;
    warning?: ValidationError;
}

export interface SectionValidationResult {
    section: string;
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    fields: FieldValidationResult[];
}

// Validation rule interfaces
export interface ValidationRule {
    field: string;
    required: boolean;
    type: 'string' | 'email' | 'phone' | 'url' | 'date' | 'array';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: any) => ValidationResult;
}

export interface SectionValidationRules {
    section: string;
    required: boolean;
    rules: ValidationRule[];
}

// Error handler interface
export interface ErrorHandler {
    handleFileError(error: FileError): void;
    handleParsingError(error: ParsingError): void;
    handleValidationError(error: ValidationError): void;
    handlePDFError(error: PDFError): void;
    handleTemplateError(error: TemplateError): void;
    handleNetworkError(error: NetworkError): void;
    showUserFriendlyMessage(error: AppError): void;
    logError(error: AppError): void;
    clearErrors(): void;
    getErrorsByType(type: ErrorType): AppError[];
    getErrorsBySeverity(severity: ErrorSeverity): AppError[];
}

// Error factory functions
export interface ErrorFactory {
    createFileError(message: string, userMessage: string, context?: Partial<FileError>): FileError;
    createParsingError(message: string, userMessage: string, context?: Partial<ParsingError>): ParsingError;
    createValidationError(message: string, userMessage: string, context?: Partial<ValidationError>): ValidationError;
    createPDFError(message: string, userMessage: string, context?: Partial<PDFError>): PDFError;
    createTemplateError(message: string, userMessage: string, context?: Partial<TemplateError>): TemplateError;
    createNetworkError(message: string, userMessage: string, context?: Partial<NetworkError>): NetworkError;
}