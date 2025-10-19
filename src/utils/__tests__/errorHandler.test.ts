/**
 * Tests for error handler functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler } from '../errorHandler';
import { ErrorFactory } from '../errorFactory';
import type { AppError, ValidationError, FileError } from '../../types/errors';

describe('ErrorHandler', () => {
    let errorHandler: ErrorHandler;
    let errorFactory: ErrorFactory;

    beforeEach(() => {
        errorHandler = new ErrorHandler();
        errorFactory = new ErrorFactory();

        // Mock console methods to avoid noise in tests
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'info').mockImplementation(() => { });
    });

    describe('Error Handling', () => {
        it('should handle file errors correctly', () => {
            const fileError = errorFactory.createFileError(
                'File too large',
                'Please select a smaller file',
                { severity: 'HIGH' }
            );

            errorHandler.handleFileError(fileError);

            const errors = errorHandler.getAllErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]).toBe(fileError);
        });

        it('should handle parsing errors correctly', () => {
            const parsingError = errorFactory.createParsingError(
                'Invalid markdown',
                'Please check your markdown syntax',
                { severity: 'MEDIUM' }
            );

            errorHandler.handleParsingError(parsingError);

            const errors = errorHandler.getAllErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]).toBe(parsingError);
        });

        it('should handle validation errors correctly', () => {
            const validationError = errorFactory.createValidationError(
                'Email is required',
                'Please provide an email address',
                { severity: 'HIGH' }
            );

            errorHandler.handleValidationError(validationError);

            const errors = errorHandler.getAllErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]).toBe(validationError);
        });

        it('should handle PDF errors correctly', () => {
            const pdfError = errorFactory.createPDFError(
                'PDF generation failed',
                'Unable to create PDF',
                { severity: 'CRITICAL' }
            );

            errorHandler.handlePDFError(pdfError);

            const errors = errorHandler.getAllErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]).toBe(pdfError);
        });

        it('should handle template errors correctly', () => {
            const templateError = errorFactory.createTemplateError(
                'Template not found',
                'Selected template is unavailable',
                { severity: 'MEDIUM' }
            );

            errorHandler.handleTemplateError(templateError);

            const errors = errorHandler.getAllErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]).toBe(templateError);
        });

        it('should handle network errors correctly', () => {
            const networkError = errorFactory.createNetworkError(
                'Connection failed',
                'Unable to connect to server',
                { severity: 'HIGH' }
            );

            errorHandler.handleNetworkError(networkError);

            const errors = errorHandler.getAllErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]).toBe(networkError);
        });
    });

    describe('Error Retrieval', () => {
        beforeEach(() => {
            // Add sample errors
            const errors = [
                errorFactory.createValidationError('Validation 1', 'Message 1', { severity: 'CRITICAL' }),
                errorFactory.createValidationError('Validation 2', 'Message 2', { severity: 'HIGH' }),
                errorFactory.createFileError('File error', 'File message', { severity: 'MEDIUM' }),
                errorFactory.createParsingError('Parse error', 'Parse message', { severity: 'LOW' })
            ];

            errors.forEach(error => {
                if (error.type === 'VALIDATION') {
                    errorHandler.handleValidationError(error as ValidationError);
                } else if (error.type === 'FILE_UPLOAD') {
                    errorHandler.handleFileError(error as FileError);
                } else if (error.type === 'PARSING') {
                    errorHandler.handleParsingError(error);
                }
            });
        });

        it('should get errors by type', () => {
            const validationErrors = errorHandler.getErrorsByType('VALIDATION');
            const fileErrors = errorHandler.getErrorsByType('FILE_UPLOAD');
            const parsingErrors = errorHandler.getErrorsByType('PARSING');

            expect(validationErrors).toHaveLength(2);
            expect(fileErrors).toHaveLength(1);
            expect(parsingErrors).toHaveLength(1);
        });

        it('should get errors by severity', () => {
            const criticalErrors = errorHandler.getErrorsBySeverity('CRITICAL');
            const highErrors = errorHandler.getErrorsBySeverity('HIGH');
            const mediumErrors = errorHandler.getErrorsBySeverity('MEDIUM');
            const lowErrors = errorHandler.getErrorsBySeverity('LOW');

            expect(criticalErrors).toHaveLength(1);
            expect(highErrors).toHaveLength(1);
            expect(mediumErrors).toHaveLength(1);
            expect(lowErrors).toHaveLength(1);
        });

        it('should get validation errors by section', () => {
            const personalInfoError = errorFactory.createValidationError(
                'Personal info error',
                'Message',
                { section: 'Personal Information' }
            );
            const experienceError = errorFactory.createValidationError(
                'Experience error',
                'Message',
                { section: 'Work Experience' }
            );

            errorHandler.handleValidationError(personalInfoError);
            errorHandler.handleValidationError(experienceError);

            const personalInfoErrors = errorHandler.getValidationErrorsBySection('Personal Information');
            const experienceErrors = errorHandler.getValidationErrorsBySection('Work Experience');

            expect(personalInfoErrors).toHaveLength(1);
            expect(experienceErrors).toHaveLength(1);
            expect(personalInfoErrors[0].section).toBe('Personal Information');
            expect(experienceErrors[0].section).toBe('Work Experience');
        });

        it('should get all errors', () => {
            const allErrors = errorHandler.getAllErrors();
            expect(allErrors).toHaveLength(4);
        });
    });

    describe('Error Status Checks', () => {
        it('should detect critical errors', () => {
            expect(errorHandler.hasCriticalErrors()).toBe(false);

            const criticalError = errorFactory.createValidationError(
                'Critical error',
                'Message',
                { severity: 'CRITICAL' }
            );
            errorHandler.handleValidationError(criticalError);

            expect(errorHandler.hasCriticalErrors()).toBe(true);
        });

        it('should detect high priority errors', () => {
            expect(errorHandler.hasHighPriorityErrors()).toBe(false);

            const highError = errorFactory.createValidationError(
                'High error',
                'Message',
                { severity: 'HIGH' }
            );
            errorHandler.handleValidationError(highError);

            expect(errorHandler.hasHighPriorityErrors()).toBe(true);
        });

        it('should detect errors of specific type', () => {
            expect(errorHandler.hasErrorsOfType('FILE_UPLOAD')).toBe(false);

            const fileError = errorFactory.createFileError('File error', 'Message');
            errorHandler.handleFileError(fileError);

            expect(errorHandler.hasErrorsOfType('FILE_UPLOAD')).toBe(true);
            expect(errorHandler.hasErrorsOfType('PARSING')).toBe(false);
        });
    });

    describe('Error Clearing', () => {
        beforeEach(() => {
            // Add sample errors
            const validationError = errorFactory.createValidationError('Validation', 'Message');
            const fileError = errorFactory.createFileError('File', 'Message');
            const criticalError = errorFactory.createValidationError('Critical', 'Message', { severity: 'CRITICAL' });

            errorHandler.handleValidationError(validationError);
            errorHandler.handleFileError(fileError);
            errorHandler.handleValidationError(criticalError);
        });

        it('should clear all errors', () => {
            expect(errorHandler.getAllErrors()).toHaveLength(3);

            errorHandler.clearErrors();

            expect(errorHandler.getAllErrors()).toHaveLength(0);
        });

        it('should clear errors by type', () => {
            expect(errorHandler.getAllErrors()).toHaveLength(3);

            errorHandler.clearErrorsByType('VALIDATION');

            const remainingErrors = errorHandler.getAllErrors();
            expect(remainingErrors).toHaveLength(1);
            expect(remainingErrors[0].type).toBe('FILE_UPLOAD');
        });

        it('should clear errors by severity', () => {
            expect(errorHandler.getAllErrors()).toHaveLength(3);

            errorHandler.clearErrorsBySeverity('CRITICAL');

            const remainingErrors = errorHandler.getAllErrors();
            expect(remainingErrors).toHaveLength(2);
            expect(remainingErrors.every(e => e.severity !== 'CRITICAL')).toBe(true);
        });
    });

    describe('Error Summary', () => {
        it('should provide error summary', () => {
            const validationError = errorFactory.createValidationError('Validation', 'Message', { severity: 'HIGH' });
            const fileError = errorFactory.createFileError('File', 'Message', { severity: 'CRITICAL' });

            errorHandler.handleValidationError(validationError);
            errorHandler.handleFileError(fileError);

            const summary = errorHandler.getErrorSummary();

            expect(summary.total).toBe(2);
            expect(summary.byType.VALIDATION).toBe(1);
            expect(summary.byType.FILE_UPLOAD).toBe(1);
            expect(summary.bySeverity.HIGH).toBe(1);
            expect(summary.bySeverity.CRITICAL).toBe(1);
            expect(summary.critical).toHaveLength(1);
            expect(summary.high).toHaveLength(1);
        });
    });

    describe('Error Listeners', () => {
        it('should notify listeners when errors change', () => {
            const listener = vi.fn();
            const unsubscribe = errorHandler.onErrorsChanged(listener);

            const error = errorFactory.createValidationError('Test', 'Message');
            errorHandler.handleValidationError(error);

            expect(listener).toHaveBeenCalledWith([error]);

            errorHandler.clearErrors();
            expect(listener).toHaveBeenCalledWith([]);

            unsubscribe();
        });

        it('should handle listener errors gracefully', () => {
            const faultyListener = vi.fn().mockImplementation(() => {
                throw new Error('Listener error');
            });

            errorHandler.onErrorsChanged(faultyListener);

            // Should not throw when listener fails
            expect(() => {
                const error = errorFactory.createValidationError('Test', 'Message');
                errorHandler.handleValidationError(error);
            }).not.toThrow();
        });

        it('should allow unsubscribing listeners', () => {
            const listener = vi.fn();
            const unsubscribe = errorHandler.onErrorsChanged(listener);

            const error = errorFactory.createValidationError('Test', 'Message');
            errorHandler.handleValidationError(error);

            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();

            errorHandler.clearErrors();
            // Should not be called after unsubscribing
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });

    describe('User-Friendly Messages', () => {
        it('should create user-friendly messages for different error types', () => {
            const errors: AppError[] = [
                errorFactory.createFileError('File error', 'File message'),
                errorFactory.createParsingError('Parse error', 'Parse message'),
                errorFactory.createValidationError('Validation error', 'Validation message'),
                errorFactory.createPDFError('PDF error', 'PDF message'),
                errorFactory.createTemplateError('Template error', 'Template message')
            ];

            const messages = ErrorHandler.createUserFriendlyMessages(errors);

            expect(messages.summary).toMatch(/\d+ (issue\(s\)|important issue\(s\)|critical issue\(s\))/);
            expect(messages.details).toContain('1 file upload issue(s)');
            expect(messages.details).toContain('1 parsing issue(s)');
            expect(messages.details).toContain('1 validation issue(s)');
            expect(messages.details).toContain('1 PDF generation issue(s)');
            expect(messages.details).toContain('1 template issue(s)');
            expect(messages.suggestions.length).toBeGreaterThan(0);
        });

        it('should prioritize critical errors in summary', () => {
            const errors: AppError[] = [
                errorFactory.createValidationError('Critical error', 'Message', { severity: 'CRITICAL' }),
                errorFactory.createValidationError('High error', 'Message', { severity: 'HIGH' }),
                errorFactory.createValidationError('Medium error', 'Message', { severity: 'MEDIUM' })
            ];

            const messages = ErrorHandler.createUserFriendlyMessages(errors);

            expect(messages.summary).toContain('1 critical issue(s) need immediate attention');
        });

        it('should handle empty error arrays', () => {
            const messages = ErrorHandler.createUserFriendlyMessages([]);

            expect(messages.summary).toBe('No issues found');
            expect(messages.details).toHaveLength(0);
            expect(messages.suggestions).toHaveLength(0);
        });
    });

    describe('Error Handler Validation', () => {
        it('should validate error handler functionality', () => {
            const isValid = ErrorHandler.validateErrorHandler(errorHandler);
            expect(isValid).toBe(true);
        });

        it('should handle validation errors gracefully', () => {
            // Create a mock error handler that throws
            const faultyHandler = {
                handleValidationError: vi.fn().mockImplementation(() => {
                    throw new Error('Handler error');
                }),
                getAllErrors: vi.fn().mockReturnValue([]),
                clearErrors: vi.fn()
            } as any;

            const isValid = ErrorHandler.validateErrorHandler(faultyHandler);
            expect(isValid).toBe(false);
        });
    });
});