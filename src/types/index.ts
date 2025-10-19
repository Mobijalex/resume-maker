/**
 * Central export file for all TypeScript interfaces and types
 */

// Resume data types
export type {
    PersonalInfo,
    WorkExperience,
    Education,
    Skills,
    Certification,
    Project,
    ResumeData
} from './resume';

// Template and styling types
export type {
    LayoutConfig,
    StyleConfig,
    Template
} from './template';

// Application state types
export type {
    AppStep,
    AppState,
    AppAction,
    AppContextType
} from './app';

// Error and validation types
export {
    ErrorType,
    ErrorSeverity
} from './errors';

export type {
    BaseError,
    FileError,
    ParsingError,
    ValidationError,
    PDFError,
    TemplateError,
    NetworkError,
    AppError,
    ValidationResult,
    FieldValidationResult,
    SectionValidationResult,
    ValidationRule,
    SectionValidationRules,
    ErrorHandler,
    ErrorFactory
} from './errors';