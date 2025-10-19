/**
 * Comprehensive validation utilities for resume data
 */

import type {
    ResumeData,
    PersonalInfo,
    WorkExperience,
    Education,
    Skills,
    Certification,
    Project
} from '../types/resume';
import type {
    ValidationError,
    ValidationResult,
    FieldValidationResult,
    SectionValidationResult,
    ValidationRule,
    SectionValidationRules
} from '../types/errors';
import { ErrorFactory } from './errorFactory';

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Phone validation regex pattern (supports various formats)
 */
const PHONE_REGEX = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

/**
 * URL validation regex pattern
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Date validation regex patterns
 */
const DATE_PATTERNS = {
    MONTH_YEAR: /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i,
    YEAR_ONLY: /^\d{4}$/,
    MM_YYYY: /^(0[1-9]|1[0-2])\/\d{4}$/,
    YYYY_MM: /^\d{4}-(0[1-9]|1[0-2])$/,
    PRESENT: /^(present|current|ongoing)$/i
};

/**
 * Validation rules for each section
 */
export const VALIDATION_RULES: Record<string, SectionValidationRules> = {
    personalInfo: {
        section: 'Personal Information',
        required: true,
        rules: [
            {
                field: 'fullName',
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100
            },
            {
                field: 'email',
                required: true,
                type: 'email',
                pattern: EMAIL_REGEX
            },
            {
                field: 'phone',
                required: true,
                type: 'phone',
                pattern: PHONE_REGEX
            },
            {
                field: 'location',
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100
            },
            {
                field: 'linkedin',
                required: false,
                type: 'url',
                pattern: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
            },
            {
                field: 'website',
                required: false,
                type: 'url',
                pattern: URL_REGEX
            }
        ]
    },
    experience: {
        section: 'Work Experience',
        required: true,
        rules: [
            {
                field: 'jobTitle',
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100
            },
            {
                field: 'company',
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100
            },
            {
                field: 'duration',
                required: true,
                type: 'string',
                minLength: 4,
                customValidator: validateDateRange
            },
            {
                field: 'accomplishments',
                required: true,
                type: 'array',
                minLength: 1
            }
        ]
    },
    education: {
        section: 'Education',
        required: true,
        rules: [
            {
                field: 'degree',
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100
            },
            {
                field: 'institution',
                required: true,
                type: 'string',
                minLength: 2,
                maxLength: 100
            },
            {
                field: 'graduationDate',
                required: true,
                type: 'date',
                customValidator: validateDate
            }
        ]
    },
    skills: {
        section: 'Skills',
        required: true,
        rules: [
            {
                field: 'technical',
                required: true,
                type: 'array',
                minLength: 1
            }
        ]
    }
};

/**
 * Main validation class
 */
export class ResumeValidator {
    private errorFactory: ErrorFactory;

    constructor() {
        this.errorFactory = new ErrorFactory();
    }

    /**
     * Validate complete resume data
     */
    public validateResumeData(resumeData: ResumeData): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        // Validate required sections
        const personalInfoResult = this.validatePersonalInfo(resumeData.personalInfo);
        errors.push(...personalInfoResult.errors);
        warnings.push(...personalInfoResult.warnings);

        const experienceResult = this.validateWorkExperience(resumeData.experience);
        errors.push(...experienceResult.errors);
        warnings.push(...experienceResult.warnings);

        const educationResult = this.validateEducation(resumeData.education);
        errors.push(...educationResult.errors);
        warnings.push(...educationResult.warnings);

        const skillsResult = this.validateSkills(resumeData.skills);
        errors.push(...skillsResult.errors);
        warnings.push(...skillsResult.warnings);

        // Validate optional sections if present
        if (resumeData.certifications) {
            const certResult = this.validateCertifications(resumeData.certifications);
            errors.push(...certResult.errors);
            warnings.push(...certResult.warnings);
        }

        if (resumeData.projects) {
            const projectResult = this.validateProjects(resumeData.projects);
            errors.push(...projectResult.errors);
            warnings.push(...projectResult.warnings);
        }

        // Validate summary
        const summaryResult = this.validateSummary(resumeData.summary);
        errors.push(...summaryResult.errors);
        warnings.push(...summaryResult.warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate personal information section
     */
    public validatePersonalInfo(personalInfo: PersonalInfo): ValidationResult {
        return this.validateSection(personalInfo, VALIDATION_RULES.personalInfo);
    }

    /**
     * Validate work experience section
     */
    public validateWorkExperience(experience: WorkExperience[]): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        if (!experience || experience.length === 0) {
            errors.push(this.errorFactory.createValidationError(
                'Work experience is required',
                'Please add at least one work experience entry to your resume.',
                {
                    field: 'experience',
                    section: 'Work Experience',
                    severity: 'HIGH'
                }
            ));
            return { isValid: false, errors, warnings };
        }

        experience.forEach((exp, index) => {
            const result = this.validateSection(exp, VALIDATION_RULES.experience, `experience[${index}]`);
            errors.push(...result.errors);
            warnings.push(...result.warnings);

            // Additional validation for accomplishments
            if (exp.accomplishments && exp.accomplishments.length === 0) {
                warnings.push(this.errorFactory.createValidationError(
                    'No accomplishments listed',
                    'Consider adding specific accomplishments and achievements for this role to strengthen your resume.',
                    {
                        field: 'accomplishments',
                        section: 'Work Experience',
                        severity: 'MEDIUM'
                    }
                ));
            }
        });

        return { isValid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate education section
     */
    public validateEducation(education: Education[]): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        if (!education || education.length === 0) {
            errors.push(this.errorFactory.createValidationError(
                'Education is required',
                'Please add at least one education entry to your resume.',
                {
                    field: 'education',
                    section: 'Education',
                    severity: 'HIGH'
                }
            ));
            return { isValid: false, errors, warnings };
        }

        education.forEach((edu, index) => {
            const result = this.validateSection(edu, VALIDATION_RULES.education, `education[${index}]`);
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        });

        return { isValid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate skills section
     */
    public validateSkills(skills: Skills): ValidationResult {
        const result = this.validateSection(skills, VALIDATION_RULES.skills);

        // Additional validation for skills content
        if (skills.technical && skills.technical.length > 0) {
            const emptySkills = skills.technical.filter(skill => !skill || skill.trim().length === 0);
            if (emptySkills.length > 0) {
                result.warnings.push(this.errorFactory.createValidationError(
                    'Empty skill entries found',
                    'Remove empty skill entries to keep your resume clean.',
                    {
                        field: 'technical',
                        section: 'Skills',
                        severity: 'LOW'
                    }
                ));
            }
        }

        return result;
    }

    /**
     * Validate certifications section (optional)
     */
    public validateCertifications(certifications: Certification[]): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        certifications.forEach((cert, index) => {
            // Validate required fields
            if (!cert.name || cert.name.trim().length === 0) {
                errors.push(this.errorFactory.createValidationError(
                    'Certification name is required',
                    'Please provide a name for this certification.',
                    {
                        field: `certifications[${index}].name`,
                        section: 'Certifications',
                        severity: 'MEDIUM'
                    }
                ));
            }

            if (!cert.issuer || cert.issuer.trim().length === 0) {
                errors.push(this.errorFactory.createValidationError(
                    'Certification issuer is required',
                    'Please provide the issuing organization for this certification.',
                    {
                        field: `certifications[${index}].issuer`,
                        section: 'Certifications',
                        severity: 'MEDIUM'
                    }
                ));
            }

            // Validate date format
            if (cert.dateObtained && !this.isValidDate(cert.dateObtained)) {
                errors.push(this.errorFactory.createValidationError(
                    'Invalid certification date format',
                    'Please use a valid date format (e.g., "January 2023", "2023", "01/2023").',
                    {
                        field: `certifications[${index}].dateObtained`,
                        section: 'Certifications',
                        expectedFormat: 'Month Year, YYYY, or MM/YYYY',
                        actualValue: cert.dateObtained,
                        severity: 'MEDIUM'
                    }
                ));
            }
        });

        return { isValid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate projects section (optional)
     */
    public validateProjects(projects: Project[]): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        projects.forEach((project, index) => {
            // Validate required fields
            if (!project.name || project.name.trim().length === 0) {
                errors.push(this.errorFactory.createValidationError(
                    'Project name is required',
                    'Please provide a name for this project.',
                    {
                        field: `projects[${index}].name`,
                        section: 'Projects',
                        severity: 'MEDIUM'
                    }
                ));
            }

            if (!project.technologies || project.technologies.length === 0) {
                warnings.push(this.errorFactory.createValidationError(
                    'No technologies listed for project',
                    'Consider adding the technologies used in this project.',
                    {
                        field: `projects[${index}].technologies`,
                        section: 'Projects',
                        severity: 'LOW'
                    }
                ));
            }

            if (!project.accomplishments || project.accomplishments.length === 0) {
                warnings.push(this.errorFactory.createValidationError(
                    'No accomplishments listed for project',
                    'Consider adding specific accomplishments or outcomes for this project.',
                    {
                        field: `projects[${index}].accomplishments`,
                        section: 'Projects',
                        severity: 'LOW'
                    }
                ));
            }

            // Validate URL if provided
            if (project.url && !URL_REGEX.test(project.url)) {
                errors.push(this.errorFactory.createValidationError(
                    'Invalid project URL format',
                    'Please provide a valid URL for the project.',
                    {
                        field: `projects[${index}].url`,
                        section: 'Projects',
                        expectedFormat: 'https://example.com',
                        actualValue: project.url,
                        severity: 'MEDIUM'
                    }
                ));
            }
        });

        return { isValid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate summary section
     */
    public validateSummary(summary: string): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        if (!summary || summary.trim().length === 0) {
            warnings.push(this.errorFactory.createValidationError(
                'Professional summary is missing',
                'Consider adding a professional summary to highlight your key qualifications.',
                {
                    field: 'summary',
                    section: 'Professional Summary',
                    severity: 'LOW'
                }
            ));
        } else if (summary.trim().length < 50) {
            warnings.push(this.errorFactory.createValidationError(
                'Professional summary is too short',
                'Consider expanding your professional summary to 50-150 words for better impact.',
                {
                    field: 'summary',
                    section: 'Professional Summary',
                    severity: 'LOW'
                }
            ));
        } else if (summary.trim().length > 300) {
            warnings.push(this.errorFactory.createValidationError(
                'Professional summary is too long',
                'Consider shortening your professional summary to 50-150 words for better readability.',
                {
                    field: 'summary',
                    section: 'Professional Summary',
                    severity: 'LOW'
                }
            ));
        }

        return { isValid: errors.length === 0, errors, warnings };
    }

    /**
     * Generic section validation using rules
     */
    private validateSection(
        data: any,
        rules: SectionValidationRules,
        fieldPrefix: string = ''
    ): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        for (const rule of rules.rules) {
            const fieldName = fieldPrefix ? `${fieldPrefix}.${rule.field}` : rule.field;
            const value = data[rule.field];
            const fieldResult = this.validateField(value, rule, fieldName, rules.section);

            if (fieldResult.error) {
                errors.push(fieldResult.error);
            }
            if (fieldResult.warning) {
                warnings.push(fieldResult.warning);
            }
        }

        return { isValid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate individual field
     */
    private validateField(
        value: any,
        rule: ValidationRule,
        fieldName: string,
        section: string
    ): FieldValidationResult {
        const result: FieldValidationResult = {
            field: fieldName,
            isValid: true
        };

        // Check if required field is missing
        if (rule.required && (value === undefined || value === null || value === '')) {
            result.isValid = false;
            result.error = this.errorFactory.createValidationError(
                `${rule.field} is required`,
                `Please provide a ${rule.field.toLowerCase()} in the ${section} section.`,
                {
                    field: fieldName,
                    section,
                    severity: 'HIGH'
                }
            );
            return result;
        }

        // Skip validation if field is not required and empty
        if (!rule.required && (value === undefined || value === null || value === '')) {
            return result;
        }

        // Type-specific validation
        switch (rule.type) {
            case 'string':
                if (typeof value !== 'string') {
                    result.isValid = false;
                    result.error = this.errorFactory.createValidationError(
                        `${rule.field} must be a string`,
                        `Please provide a valid text value for ${rule.field.toLowerCase()}.`,
                        {
                            field: fieldName,
                            section,
                            severity: 'MEDIUM'
                        }
                    );
                    return result;
                }
                break;

            case 'email':
                if (!EMAIL_REGEX.test(value)) {
                    result.isValid = false;
                    result.error = this.errorFactory.createValidationError(
                        'Invalid email format',
                        'Please provide a valid email address (e.g., john.doe@example.com).',
                        {
                            field: fieldName,
                            section,
                            expectedFormat: 'user@domain.com',
                            actualValue: value,
                            severity: 'HIGH'
                        }
                    );
                    return result;
                }
                break;

            case 'phone':
                if (!PHONE_REGEX.test(value)) {
                    result.isValid = false;
                    result.error = this.errorFactory.createValidationError(
                        'Invalid phone format',
                        'Please provide a valid phone number (e.g., (555) 123-4567 or 555-123-4567).',
                        {
                            field: fieldName,
                            section,
                            expectedFormat: '(555) 123-4567',
                            actualValue: value,
                            severity: 'HIGH'
                        }
                    );
                    return result;
                }
                break;

            case 'url':
                if (rule.pattern && !rule.pattern.test(value)) {
                    result.isValid = false;
                    result.error = this.errorFactory.createValidationError(
                        'Invalid URL format',
                        'Please provide a valid URL (e.g., https://example.com).',
                        {
                            field: fieldName,
                            section,
                            expectedFormat: 'https://example.com',
                            actualValue: value,
                            severity: 'MEDIUM'
                        }
                    );
                    return result;
                }
                break;

            case 'array':
                if (!Array.isArray(value)) {
                    result.isValid = false;
                    result.error = this.errorFactory.createValidationError(
                        `${rule.field} must be an array`,
                        `Please provide a list of items for ${rule.field.toLowerCase()}.`,
                        {
                            field: fieldName,
                            section,
                            severity: 'MEDIUM'
                        }
                    );
                    return result;
                }
                break;

            case 'date':
                if (!this.isValidDate(value)) {
                    result.isValid = false;
                    result.error = this.errorFactory.createValidationError(
                        'Invalid date format',
                        'Please use a valid date format (e.g., "January 2023", "2023", "01/2023").',
                        {
                            field: fieldName,
                            section,
                            expectedFormat: 'Month Year, YYYY, or MM/YYYY',
                            actualValue: value,
                            severity: 'MEDIUM'
                        }
                    );
                    return result;
                }
                break;
        }

        // Length validation
        if (rule.minLength !== undefined) {
            const length = Array.isArray(value) ? value.length : value.toString().length;
            if (length < rule.minLength) {
                result.isValid = false;
                result.error = this.errorFactory.createValidationError(
                    `${rule.field} is too short`,
                    `${rule.field} must be at least ${rule.minLength} characters long.`,
                    {
                        field: fieldName,
                        section,
                        severity: 'MEDIUM'
                    }
                );
                return result;
            }
        }

        if (rule.maxLength !== undefined) {
            const length = Array.isArray(value) ? value.length : value.toString().length;
            if (length > rule.maxLength) {
                result.isValid = false;
                result.error = this.errorFactory.createValidationError(
                    `${rule.field} is too long`,
                    `${rule.field} must be no more than ${rule.maxLength} characters long.`,
                    {
                        field: fieldName,
                        section,
                        severity: 'MEDIUM'
                    }
                );
                return result;
            }
        }

        // Pattern validation
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
            result.isValid = false;
            result.error = this.errorFactory.createValidationError(
                `${rule.field} format is invalid`,
                `Please check the format of ${rule.field.toLowerCase()}.`,
                {
                    field: fieldName,
                    section,
                    severity: 'MEDIUM'
                }
            );
            return result;
        }

        // Custom validation
        if (rule.customValidator) {
            const customResult = rule.customValidator(value);
            if (!customResult.isValid) {
                result.isValid = false;
                result.error = customResult.errors[0];
                return result;
            }
        }

        return result;
    }

    /**
     * Validate date format
     */
    private isValidDate(dateString: string): boolean {
        if (!dateString || typeof dateString !== 'string') {
            return false;
        }

        const trimmedDate = dateString.trim();

        return Object.values(DATE_PATTERNS).some(pattern => pattern.test(trimmedDate));
    }
}

/**
 * Custom validator for date ranges (e.g., "January 2020 - Present")
 */
function validateDateRange(value: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof value !== 'string') {
        errors.push(new ErrorFactory().createValidationError(
            'Date range must be a string',
            'Please provide the date range as text.',
            { severity: 'MEDIUM' }
        ));
        return { isValid: false, errors, warnings: [] };
    }

    const dateRange = value.trim();

    // Check for common date range patterns
    const rangePatterns = [
        /^.+\s*-\s*(present|current|ongoing)$/i,
        /^.+\s*-\s*.+$/,
        /^(present|current|ongoing)$/i,
        /^\d{4}$/,
        /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i
    ];

    const isValid = rangePatterns.some(pattern => pattern.test(dateRange));

    if (!isValid) {
        errors.push(new ErrorFactory().createValidationError(
            'Invalid date range format',
            'Please use formats like "January 2020 - Present", "2020 - 2023", or "Present".',
            {
                expectedFormat: 'January 2020 - Present',
                actualValue: value,
                severity: 'MEDIUM'
            }
        ));
    }

    return { isValid, errors, warnings: [] };
}

/**
 * Custom validator for single dates
 */
function validateDate(value: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof value !== 'string') {
        errors.push(new ErrorFactory().createValidationError(
            'Date must be a string',
            'Please provide the date as text.',
            { severity: 'MEDIUM' }
        ));
        return { isValid: false, errors, warnings: [] };
    }

    const validator = new ResumeValidator();
    const isValid = (validator as any).isValidDate(value);

    if (!isValid) {
        errors.push(new ErrorFactory().createValidationError(
            'Invalid date format',
            'Please use a valid date format (e.g., "January 2023", "2023", "01/2023").',
            {
                expectedFormat: 'Month Year, YYYY, or MM/YYYY',
                actualValue: value,
                severity: 'MEDIUM'
            }
        ));
    }

    return { isValid, errors, warnings: [] };
}

/**
 * Export default validator instance
 */
export const resumeValidator = new ResumeValidator();