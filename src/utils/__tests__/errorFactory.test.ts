/**
 * Tests for error factory and error utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorFactory, ErrorUtils } from '../errorFactory';
import type { AppError, ValidationError, FileError } from '../../types/errors';

describe('ErrorFactory', () => {
    let errorFactory: ErrorFactory;

    beforeEach(() => {
        errorFactory = new ErrorFactory();
    });

    describe('Error Creation', () => {
        it('should create file errors with correct structure', () => {
            const error = errorFactory.createFileError(
                'File too large',
                'Please select a file smaller than 5MB',
                {
                    fileName: 'resume.md',
                    fileSize: 6000000,
                    fileType: 'text/markdown',
                    severity: 'HIGH'
                }
            );

            expect(error.type).toBe('FILE_UPLOAD');
            expect(error.severity).toBe('HIGH');
            expect(error.message).toBe('File too large');
            expect(error.userMessage).toBe('Please select a file smaller than 5MB');
            expect(error.fileName).toBe('resume.md');
            expect(error.fileSize).toBe(6000000);
            expect(error.fileType).toBe('text/markdown');
            expect(error.id).toBeDefined();
            expect(error.timestamp).toBeInstanceOf(Date);
        });

        it('should create parsing errors with correct structure', () => {
            const error = errorFactory.createParsingError(
                'Invalid markdown syntax',
                'Please check your markdown formatting',
                {
                    lineNumber: 15,
                    section: 'Work Experience',
                    markdownContent: '### Invalid Header',
                    severity: 'MEDIUM'
                }
            );

            expect(error.type).toBe('PARSING');
            expect(error.severity).toBe('MEDIUM');
            expect(error.lineNumber).toBe(15);
            expect(error.section).toBe('Work Experience');
            expect(error.markdownContent).toBe('### Invalid Header');
        });

        it('should create validation errors with correct structure', () => {
            const error = errorFactory.createValidationError(
                'Email is required',
                'Please provide a valid email address',
                {
                    field: 'email',
                    section: 'Personal Information',
                    expectedFormat: 'user@domain.com',
                    actualValue: '',
                    severity: 'HIGH'
                }
            );

            expect(error.type).toBe('VALIDATION');
            expect(error.severity).toBe('HIGH');
            expect(error.field).toBe('email');
            expect(error.section).toBe('Personal Information');
            expect(error.expectedFormat).toBe('user@domain.com');
            expect(error.actualValue).toBe('');
        });

        it('should create PDF errors with correct structure', () => {
            const error = errorFactory.createPDFError(
                'PDF generation failed',
                'Unable to generate PDF. Please try again.',
                {
                    templateId: 'modern',
                    stage: 'content_generation',
                    severity: 'CRITICAL'
                }
            );

            expect(error.type).toBe('PDF_GENERATION');
            expect(error.severity).toBe('CRITICAL');
            expect(error.templateId).toBe('modern');
            expect(error.stage).toBe('content_generation');
        });

        it('should create template errors with correct structure', () => {
            const error = errorFactory.createTemplateError(
                'Template not found',
                'The selected template is not available',
                {
                    templateId: 'custom',
                    configSection: 'layout',
                    severity: 'MEDIUM'
                }
            );

            expect(error.type).toBe('TEMPLATE');
            expect(error.severity).toBe('MEDIUM');
            expect(error.templateId).toBe('custom');
            expect(error.configSection).toBe('layout');
        });

        it('should create network errors with correct structure', () => {
            const error = errorFactory.createNetworkError(
                'Request failed',
                'Unable to connect to the server',
                {
                    url: 'https://api.example.com',
                    statusCode: 500,
                    method: 'POST',
                    severity: 'HIGH'
                }
            );

            expect(error.type).toBe('NETWORK');
            expect(error.severity).toBe('HIGH');
            expect(error.url).toBe('https://api.example.com');
            expect(error.statusCode).toBe(500);
            expect(error.method).toBe('POST');
        });

        it('should use default severity when not provided', () => {
            const fileError = errorFactory.createFileError('Test', 'Test message');
            expect(fileError.severity).toBe('MEDIUM');

            const pdfError = errorFactory.createPDFError('Test', 'Test message');
            expect(pdfError.severity).toBe('HIGH');

            const networkError = errorFactory.createNetworkError('Test', 'Test message');
            expect(networkError.severity).toBe('HIGH');
        });

        it('should generate unique error IDs', () => {
            const error1 = errorFactory.createValidationError('Test 1', 'Test message 1');
            const error2 = errorFactory.createValidationError('Test 2', 'Test message 2');

            expect(error1.id).not.toBe(error2.id);
            expect(error1.id).toMatch(/^error_\d+_[a-z0-9]+$/);
            expect(error2.id).toMatch(/^error_\d+_[a-z0-9]+$/);
        });
    });
});

describe('ErrorUtils', () => {
    let sampleErrors: AppError[];

    beforeEach(() => {
        const errorFactory = new ErrorFactory();
        sampleErrors = [
            errorFactory.createValidationError('Critical error', 'Critical message', { severity: 'CRITICAL' }),
            errorFactory.createValidationError('High error', 'High message', { severity: 'HIGH' }),
            errorFactory.createValidationError('Medium error', 'Medium message', { severity: 'MEDIUM' }),
            errorFactory.createValidationError('Low error', 'Low message', { severity: 'LOW' }),
            errorFactory.createFileError('File error', 'File message', { severity: 'MEDIUM' }),
            errorFactory.createParsingError('Parse error', 'Parse message', { severity: 'HIGH' })
        ];
    });

    describe('Error Classification', () => {
        it('should identify critical errors correctly', () => {
            const criticalError = sampleErrors.find(e => e.severity === 'CRITICAL')!;
            const nonCriticalError = sampleErrors.find(e => e.severity === 'MEDIUM')!;

            expect(ErrorUtils.isCritical(criticalError)).toBe(true);
            expect(ErrorUtils.isCritical(nonCriticalError)).toBe(false);
        });

        it('should identify high priority errors correctly', () => {
            const criticalError = sampleErrors.find(e => e.severity === 'CRITICAL')!;
            const highError = sampleErrors.find(e => e.severity === 'HIGH')!;
            const mediumError = sampleErrors.find(e => e.severity === 'MEDIUM')!;

            expect(ErrorUtils.isHighPriority(criticalError)).toBe(true);
            expect(ErrorUtils.isHighPriority(highError)).toBe(true);
            expect(ErrorUtils.isHighPriority(mediumError)).toBe(false);
        });

        it('should get user-friendly messages', () => {
            const error = sampleErrors[0];
            const userMessage = ErrorUtils.getUserMessage(error);
            expect(userMessage).toBe(error.userMessage);
        });

        it('should format errors for logging', () => {
            const error = sampleErrors[0];
            const logMessage = ErrorUtils.formatForLogging(error);
            expect(logMessage).toContain(error.type);
            expect(logMessage).toContain(error.severity);
            expect(logMessage).toContain(error.message);
            expect(logMessage).toContain(error.id);
        });
    });

    describe('Error Grouping', () => {
        it('should group errors by type', () => {
            const grouped = ErrorUtils.groupByType(sampleErrors);

            expect(grouped.VALIDATION).toHaveLength(4);
            expect(grouped.FILE_UPLOAD).toHaveLength(1);
            expect(grouped.PARSING).toHaveLength(1);
        });

        it('should group errors by severity', () => {
            const grouped = ErrorUtils.groupBySeverity(sampleErrors);

            expect(grouped.CRITICAL).toHaveLength(1);
            expect(grouped.HIGH).toHaveLength(2);
            expect(grouped.MEDIUM).toHaveLength(2);
            expect(grouped.LOW).toHaveLength(1);
        });

        it('should filter validation errors by section', () => {
            const errorFactory = new ErrorFactory();
            const validationErrors: ValidationError[] = [
                errorFactory.createValidationError('Error 1', 'Message 1', { section: 'Personal Information' }),
                errorFactory.createValidationError('Error 2', 'Message 2', { section: 'Work Experience' }),
                errorFactory.createValidationError('Error 3', 'Message 3', { section: 'Personal Information' })
            ];

            const personalInfoErrors = ErrorUtils.filterBySection(validationErrors, 'Personal Information');
            expect(personalInfoErrors).toHaveLength(2);
            expect(personalInfoErrors.every(e => e.section === 'Personal Information')).toBe(true);
        });
    });

    describe('Error Analysis', () => {
        it('should find the most severe error', () => {
            const mostSevere = ErrorUtils.getMostSevere(sampleErrors);
            expect(mostSevere?.severity).toBe('CRITICAL');
        });

        it('should return null for empty error array', () => {
            const mostSevere = ErrorUtils.getMostSevere([]);
            expect(mostSevere).toBeNull();
        });

        it('should create comprehensive error summary', () => {
            const summary = ErrorUtils.createSummary(sampleErrors);

            expect(summary.total).toBe(6);
            expect(summary.byType.VALIDATION).toBe(4);
            expect(summary.byType.FILE_UPLOAD).toBe(1);
            expect(summary.byType.PARSING).toBe(1);
            expect(summary.bySeverity.CRITICAL).toBe(1);
            expect(summary.bySeverity.HIGH).toBe(2);
            expect(summary.bySeverity.MEDIUM).toBe(2);
            expect(summary.bySeverity.LOW).toBe(1);
            expect(summary.critical).toHaveLength(1);
            expect(summary.high).toHaveLength(2);
        });

        it('should handle empty error arrays in summary', () => {
            const summary = ErrorUtils.createSummary([]);

            expect(summary.total).toBe(0);
            expect(summary.critical).toHaveLength(0);
            expect(summary.high).toHaveLength(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle errors without user messages', () => {
            const errorFactory = new ErrorFactory();
            const error = errorFactory.createValidationError('Technical message', '');
            error.userMessage = ''; // Clear user message

            const userMessage = ErrorUtils.getUserMessage(error);
            expect(userMessage).toBe('Technical message'); // Falls back to technical message
        });

        it('should handle malformed errors gracefully', () => {
            const malformedError = {
                id: 'test',
                type: 'VALIDATION' as const,
                severity: 'MEDIUM' as const,
                message: 'Test',
                userMessage: 'Test user message',
                timestamp: new Date()
            };

            expect(() => ErrorUtils.formatForLogging(malformedError)).not.toThrow();
            expect(() => ErrorUtils.isCritical(malformedError)).not.toThrow();
            expect(() => ErrorUtils.isHighPriority(malformedError)).not.toThrow();
        });
    });
});