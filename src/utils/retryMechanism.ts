/**
 * Retry mechanism utilities for error recovery
 */

import { errorFactory } from './errorFactory';
import type { AppError } from '../types/errors';

export interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryCondition?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
}

export interface RetryResult<T> {
    success: boolean;
    result?: T;
    error?: AppError;
    attempts: number;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: () => true,
    onRetry: () => { }
};

/**
 * Retry mechanism for async operations
 */
export class RetryMechanism {
    /**
     * Retry an async operation with exponential backoff
     */
    static async retry<T>(
        operation: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<RetryResult<T>> {
        const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
        let lastError: any;
        let attempts = 0;

        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            attempts = attempt;

            try {
                const result = await operation();
                return {
                    success: true,
                    result,
                    attempts
                };
            } catch (error) {
                lastError = error;

                // Check if we should retry this error
                if (!config.retryCondition(error)) {
                    break;
                }

                // Don't wait after the last attempt
                if (attempt < config.maxAttempts) {
                    const delay = Math.min(
                        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
                        config.maxDelay
                    );

                    if (config.onRetry) {
                        config.onRetry(attempt, error);
                    }
                    await this.delay(delay);
                }
            }
        }

        // Convert to AppError if needed
        const appError = this.convertToAppError(lastError);

        return {
            success: false,
            error: appError,
            attempts
        };
    }

    /**
     * Retry a synchronous operation
     */
    static retrySync<T>(
        operation: () => T,
        options: Omit<RetryOptions, 'onRetry'> & { onRetry?: (attempt: number, error: any) => void } = {}
    ): RetryResult<T> {
        const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
        let lastError: any;
        let attempts = 0;

        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            attempts = attempt;

            try {
                const result = operation();
                return {
                    success: true,
                    result,
                    attempts
                };
            } catch (error) {
                lastError = error;

                // Check if we should retry this error
                if (!config.retryCondition(error)) {
                    break;
                }

                if (attempt < config.maxAttempts) {
                    config.onRetry?.(attempt, error);
                }
            }
        }

        const appError = this.convertToAppError(lastError);

        return {
            success: false,
            error: appError,
            attempts
        };
    }

    /**
     * Create a retry wrapper for a function
     */
    static createRetryWrapper<T extends any[], R>(
        fn: (...args: T) => Promise<R>,
        options: RetryOptions = {}
    ): (...args: T) => Promise<R> {
        return async (...args: T): Promise<R> => {
            const result = await this.retry(() => fn(...args), options);

            if (result.success) {
                return result.result!;
            } else {
                throw result.error;
            }
        };
    }

    /**
     * Delay utility
     */
    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Convert any error to AppError
     */
    private static convertToAppError(error: any): AppError {
        if (error && typeof error === 'object' && 'type' in error && 'severity' in error) {
            return error as AppError;
        }

        return errorFactory.createBaseError(
            'UNKNOWN',
            'MEDIUM',
            error?.message || 'Unknown error occurred',
            'An unexpected error occurred. Please try again.',
            { originalError: error }
        );
    }
}

/**
 * Specific retry configurations for different operations
 */
export const RetryConfigs = {
    /**
     * File upload retry configuration
     */
    fileUpload: {
        maxAttempts: 2,
        baseDelay: 500,
        retryCondition: (error: any) => {
            // Don't retry validation errors
            return !error?.type || error.type !== 'VALIDATION';
        }
    } as RetryOptions,

    /**
     * PDF generation retry configuration
     */
    pdfGeneration: {
        maxAttempts: 3,
        baseDelay: 1000,
        retryCondition: (error: any) => {
            // Retry on memory or temporary errors, not on data errors
            return !error?.message?.includes('Invalid data') &&
                !error?.message?.includes('Missing required');
        }
    } as RetryOptions,

    /**
     * Network operation retry configuration
     */
    network: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
        retryCondition: (error: any) => {
            // Retry on network errors, timeouts, and 5xx status codes
            const status = error?.status || error?.statusCode;
            return !status || status >= 500 || status === 408 || status === 429;
        }
    } as RetryOptions,

    /**
     * Template processing retry configuration
     */
    templateProcessing: {
        maxAttempts: 2,
        baseDelay: 500,
        retryCondition: (error: any) => {
            // Don't retry template configuration errors
            return !error?.message?.includes('Template configuration');
        }
    } as RetryOptions
};

/**
 * Utility functions for common retry scenarios
 */
export class RetryUtils {
    /**
     * Retry file operations
     */
    static async retryFileOperation<T>(
        operation: () => Promise<T>,
        onRetry?: (attempt: number, error: any) => void
    ): Promise<T> {
        const result = await RetryMechanism.retry(operation, {
            ...RetryConfigs.fileUpload,
            onRetry
        });

        if (result.success) {
            return result.result!;
        } else {
            throw result.error;
        }
    }

    /**
     * Retry PDF generation
     */
    static async retryPDFGeneration<T>(
        operation: () => Promise<T>,
        onRetry?: (attempt: number, error: any) => void
    ): Promise<T> {
        const result = await RetryMechanism.retry(operation, {
            ...RetryConfigs.pdfGeneration,
            onRetry
        });

        if (result.success) {
            return result.result!;
        } else {
            throw result.error;
        }
    }

    /**
     * Retry network operations
     */
    static async retryNetworkOperation<T>(
        operation: () => Promise<T>,
        onRetry?: (attempt: number, error: any) => void
    ): Promise<T> {
        const result = await RetryMechanism.retry(operation, {
            ...RetryConfigs.network,
            onRetry
        });

        if (result.success) {
            return result.result!;
        } else {
            throw result.error;
        }
    }

    /**
     * Retry template processing
     */
    static async retryTemplateProcessing<T>(
        operation: () => Promise<T>,
        onRetry?: (attempt: number, error: any) => void
    ): Promise<T> {
        const result = await RetryMechanism.retry(operation, {
            ...RetryConfigs.templateProcessing,
            onRetry
        });

        if (result.success) {
            return result.result!;
        } else {
            throw result.error;
        }
    }
}