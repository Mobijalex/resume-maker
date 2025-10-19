/**
 * Tests for retry mechanism utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RetryMechanism, RetryUtils, RetryConfigs } from '../retryMechanism';

describe('RetryMechanism', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('retry', () => {
        it('should succeed on first attempt', async () => {
            const operation = vi.fn().mockResolvedValue('success');

            const result = await RetryMechanism.retry(operation);

            expect(result.success).toBe(true);
            expect(result.result).toBe('success');
            expect(result.attempts).toBe(1);
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and eventually succeed', async () => {
            const operation = vi.fn()
                .mockRejectedValueOnce(new Error('First failure'))
                .mockResolvedValue('success');

            const result = await RetryMechanism.retry(operation, { maxAttempts: 3 });

            expect(result.success).toBe(true);
            expect(result.result).toBe('success');
            expect(result.attempts).toBe(2);
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it('should fail after max attempts', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'));

            const result = await RetryMechanism.retry(operation, { maxAttempts: 2 });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.attempts).toBe(2);
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it('should respect retry condition', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('Non-retryable error'));
            const retryCondition = vi.fn().mockReturnValue(false);

            const result = await RetryMechanism.retry(operation, {
                maxAttempts: 3,
                retryCondition
            });

            expect(result.success).toBe(false);
            expect(result.attempts).toBe(1);
            expect(operation).toHaveBeenCalledTimes(1);
            expect(retryCondition).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should call onRetry callback', async () => {
            const operation = vi.fn()
                .mockRejectedValueOnce(new Error('First failure'))
                .mockResolvedValue('success');
            const onRetry = vi.fn();

            await RetryMechanism.retry(operation, {
                maxAttempts: 3,
                onRetry
            });

            expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
        });

        it('should implement exponential backoff', async () => {
            const operation = vi.fn()
                .mockRejectedValueOnce(new Error('First failure'))
                .mockRejectedValueOnce(new Error('Second failure'))
                .mockResolvedValue('success');

            const startTime = Date.now();
            await RetryMechanism.retry(operation, {
                maxAttempts: 3,
                baseDelay: 100,
                backoffFactor: 2
            });
            const endTime = Date.now();

            // Should have waited at least 100ms + 200ms = 300ms
            expect(endTime - startTime).toBeGreaterThan(250);
        });
    });

    describe('retrySync', () => {
        it('should succeed on first attempt', () => {
            const operation = vi.fn().mockReturnValue('success');

            const result = RetryMechanism.retrySync(operation);

            expect(result.success).toBe(true);
            expect(result.result).toBe('success');
            expect(result.attempts).toBe(1);
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and eventually succeed', () => {
            const operation = vi.fn()
                .mockImplementationOnce(() => { throw new Error('First failure'); })
                .mockReturnValue('success');

            const result = RetryMechanism.retrySync(operation, { maxAttempts: 3 });

            expect(result.success).toBe(true);
            expect(result.result).toBe('success');
            expect(result.attempts).toBe(2);
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it('should fail after max attempts', () => {
            const operation = vi.fn().mockImplementation(() => {
                throw new Error('Persistent failure');
            });

            const result = RetryMechanism.retrySync(operation, { maxAttempts: 2 });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.attempts).toBe(2);
            expect(operation).toHaveBeenCalledTimes(2);
        });
    });

    describe('createRetryWrapper', () => {
        it('should create a wrapper that retries', async () => {
            const originalFn = vi.fn()
                .mockRejectedValueOnce(new Error('First failure'))
                .mockResolvedValue('success');

            const wrappedFn = RetryMechanism.createRetryWrapper(originalFn, { maxAttempts: 3 });

            const result = await wrappedFn('arg1', 'arg2');

            expect(result).toBe('success');
            expect(originalFn).toHaveBeenCalledTimes(2);
            expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
        });

        it('should throw error if all retries fail', async () => {
            const originalFn = vi.fn().mockRejectedValue(new Error('Persistent failure'));

            const wrappedFn = RetryMechanism.createRetryWrapper(originalFn, { maxAttempts: 2 });

            await expect(wrappedFn()).rejects.toThrow();
            expect(originalFn).toHaveBeenCalledTimes(2);
        });
    });
});

describe('RetryUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('retryFileOperation', () => {
        it('should use file upload retry config', async () => {
            const operation = vi.fn().mockResolvedValue('success');

            const result = await RetryUtils.retryFileOperation(operation);

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should not retry validation errors', async () => {
            const validationError = { type: 'VALIDATION', message: 'Invalid data' };
            const operation = vi.fn().mockRejectedValue(validationError);

            await expect(RetryUtils.retryFileOperation(operation)).rejects.toThrow();
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry non-validation errors', async () => {
            const networkError = new Error('Network error');
            const operation = vi.fn()
                .mockRejectedValueOnce(networkError)
                .mockResolvedValue('success');

            const result = await RetryUtils.retryFileOperation(operation);

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });
    });

    describe('retryPDFGeneration', () => {
        it('should use PDF generation retry config', async () => {
            const operation = vi.fn().mockResolvedValue('pdf-data');

            const result = await RetryUtils.retryPDFGeneration(operation);

            expect(result).toBe('pdf-data');
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should not retry data errors', async () => {
            const dataError = new Error('Invalid data provided');
            const operation = vi.fn().mockRejectedValue(dataError);

            await expect(RetryUtils.retryPDFGeneration(operation)).rejects.toThrow();
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry memory errors', async () => {
            const memoryError = new Error('Out of memory');
            const operation = vi.fn()
                .mockRejectedValueOnce(memoryError)
                .mockResolvedValue('pdf-data');

            const result = await RetryUtils.retryPDFGeneration(operation);

            expect(result).toBe('pdf-data');
            expect(operation).toHaveBeenCalledTimes(2);
        });
    });

    describe('retryNetworkOperation', () => {
        it('should retry 5xx errors', async () => {
            const serverError = { status: 500, message: 'Internal server error' };
            const operation = vi.fn()
                .mockRejectedValueOnce(serverError)
                .mockResolvedValue('success');

            const result = await RetryUtils.retryNetworkOperation(operation);

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it('should not retry 4xx errors', async () => {
            const clientError = { status: 404, message: 'Not found' };
            const operation = vi.fn().mockRejectedValue(clientError);

            await expect(RetryUtils.retryNetworkOperation(operation)).rejects.toThrow();
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry timeout errors', async () => {
            const timeoutError = { status: 408, message: 'Request timeout' };
            const operation = vi.fn()
                .mockRejectedValueOnce(timeoutError)
                .mockResolvedValue('success');

            const result = await RetryUtils.retryNetworkOperation(operation);

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });
    });
});

describe('RetryConfigs', () => {
    it('should have appropriate file upload config', () => {
        expect(RetryConfigs.fileUpload.maxAttempts).toBe(2);
        expect(RetryConfigs.fileUpload.baseDelay).toBe(500);
        expect(RetryConfigs.fileUpload.retryCondition).toBeDefined();
    });

    it('should have appropriate PDF generation config', () => {
        expect(RetryConfigs.pdfGeneration.maxAttempts).toBe(3);
        expect(RetryConfigs.pdfGeneration.baseDelay).toBe(1000);
        expect(RetryConfigs.pdfGeneration.retryCondition).toBeDefined();
    });

    it('should have appropriate network config', () => {
        expect(RetryConfigs.network.maxAttempts).toBe(3);
        expect(RetryConfigs.network.baseDelay).toBe(1000);
        expect(RetryConfigs.network.maxDelay).toBe(5000);
        expect(RetryConfigs.network.retryCondition).toBeDefined();
    });

    it('should have appropriate template processing config', () => {
        expect(RetryConfigs.templateProcessing.maxAttempts).toBe(2);
        expect(RetryConfigs.templateProcessing.baseDelay).toBe(500);
        expect(RetryConfigs.templateProcessing.retryCondition).toBeDefined();
    });
});