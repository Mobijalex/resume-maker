import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    debounce,
    throttle,
    prefersReducedMotion,
    measurePerformance,
    measureAsyncPerformance,
    createIntersectionObserver,
} from '../performanceOptimizer';

// Mock performance API
const mockPerformance = {
    now: vi.fn(() => 1000),
};

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

beforeEach(() => {
    vi.stubGlobal('performance', mockPerformance);
    vi.stubGlobal('matchMedia', mockMatchMedia);
    vi.clearAllMocks();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('performanceOptimizer', () => {
    describe('debounce', () => {
        it('should delay function execution', async () => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, 100);

            debouncedFn('test');
            expect(mockFn).not.toHaveBeenCalled();

            await new Promise(resolve => setTimeout(resolve, 150));
            expect(mockFn).toHaveBeenCalledWith('test');
        });

        it('should cancel previous calls', async () => {
            const mockFn = vi.fn();
            const debouncedFn = debounce(mockFn, 100);

            debouncedFn('first');
            debouncedFn('second');

            await new Promise(resolve => setTimeout(resolve, 150));
            expect(mockFn).toHaveBeenCalledTimes(1);
            expect(mockFn).toHaveBeenCalledWith('second');
        });
    });

    describe('throttle', () => {
        it('should limit function execution', async () => {
            const mockFn = vi.fn();
            const throttledFn = throttle(mockFn, 100);

            throttledFn('first');
            throttledFn('second');
            throttledFn('third');

            expect(mockFn).toHaveBeenCalledTimes(1);
            expect(mockFn).toHaveBeenCalledWith('first');

            await new Promise(resolve => setTimeout(resolve, 150));

            throttledFn('fourth');
            expect(mockFn).toHaveBeenCalledTimes(2);
            expect(mockFn).toHaveBeenCalledWith('fourth');
        });
    });

    describe('prefersReducedMotion', () => {
        it('should return true when user prefers reduced motion', () => {
            mockMatchMedia.mockReturnValue({ matches: true });
            expect(prefersReducedMotion()).toBe(true);
        });

        it('should return false when user does not prefer reduced motion', () => {
            mockMatchMedia.mockReturnValue({ matches: false });
            expect(prefersReducedMotion()).toBe(false);
        });

        it('should return false when window is undefined', () => {
            vi.stubGlobal('window', undefined);
            expect(prefersReducedMotion()).toBe(false);
        });
    });

    describe('measurePerformance', () => {
        it('should measure function execution time', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const mockFn = vi.fn();

            mockPerformance.now
                .mockReturnValueOnce(1000)
                .mockReturnValueOnce(1100);

            measurePerformance('test operation', mockFn);

            expect(mockFn).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('test operation took 100.00ms');

            consoleSpy.mockRestore();
        });

        it('should work without performance API', () => {
            vi.stubGlobal('performance', undefined);
            const mockFn = vi.fn();

            expect(() => measurePerformance('test', mockFn)).not.toThrow();
            expect(mockFn).toHaveBeenCalled();
        });
    });

    describe('measureAsyncPerformance', () => {
        it('should measure async function execution time', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const mockAsyncFn = vi.fn().mockResolvedValue('result');

            mockPerformance.now
                .mockReturnValueOnce(1000)
                .mockReturnValueOnce(1200);

            const result = await measureAsyncPerformance('async test', mockAsyncFn);

            expect(result).toBe('result');
            expect(mockAsyncFn).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('async test took 200.00ms');

            consoleSpy.mockRestore();
        });

        it('should work without performance API', async () => {
            vi.stubGlobal('performance', undefined);
            const mockAsyncFn = vi.fn().mockResolvedValue('result');

            const result = await measureAsyncPerformance('test', mockAsyncFn);

            expect(result).toBe('result');
            expect(mockAsyncFn).toHaveBeenCalled();
        });
    });

    describe('createIntersectionObserver', () => {
        it('should create IntersectionObserver when supported', () => {
            const mockObserver = { observe: vi.fn(), disconnect: vi.fn() };
            const MockIntersectionObserver = vi.fn(() => mockObserver);

            vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
            vi.stubGlobal('window', {});

            const callback = vi.fn();
            const observer = createIntersectionObserver(callback);

            expect(observer).toBe(mockObserver);
            expect(MockIntersectionObserver).toHaveBeenCalledWith(callback, {
                rootMargin: '50px',
                threshold: 0.1,
            });
        });

        it('should return null when IntersectionObserver is not supported', () => {
            vi.stubGlobal('IntersectionObserver', undefined);
            vi.stubGlobal('window', {});

            const callback = vi.fn();
            const observer = createIntersectionObserver(callback);

            expect(observer).toBeNull();
        });

        it('should return null when window is undefined', () => {
            vi.stubGlobal('window', undefined);

            const callback = vi.fn();
            const observer = createIntersectionObserver(callback);

            expect(observer).toBeNull();
        });
    });
});