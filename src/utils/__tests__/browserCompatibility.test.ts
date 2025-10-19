/**
 * Tests for browser compatibility utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrowserCompatibility, GracefulDegradation } from '../browserCompatibility';

// Mock browser APIs
const mockBrowserAPIs = () => {
    // Mock File API
    (global as any).File = vi.fn();
    (global as any).FileReader = vi.fn();
    (global as any).FileList = vi.fn();
    (global as any).Blob = vi.fn();

    // Mock Worker
    (global as any).Worker = vi.fn();

    // Mock localStorage
    const localStorageMock = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
    });

    // Mock sessionStorage
    const sessionStorageMock = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    };
    Object.defineProperty(window, 'sessionStorage', {
        value: sessionStorageMock,
        writable: true
    });

    // Mock navigator
    Object.defineProperty(window, 'navigator', {
        value: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            platform: 'Win32'
        },
        writable: true
    });

    // Mock document.createElement
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName) => {
        const element = originalCreateElement.call(document, tagName);

        if (tagName === 'canvas') {
            element.getContext = vi.fn().mockReturnValue({});
        }

        if (tagName === 'div') {
            element.style = {
                flexbox: '',
                flex: '',
                grid: '',
                gridTemplateColumns: ''
            };
        }

        if (tagName === 'a') {
            (element as any).download = '';
        }

        return element;
    });
};

describe('BrowserCompatibility', () => {
    beforeEach(() => {
        mockBrowserAPIs();
        // Reset capabilities cache
        (BrowserCompatibility as any).capabilities = null;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getCapabilities', () => {
        it('should detect all capabilities correctly', () => {
            const capabilities = BrowserCompatibility.getCapabilities();

            expect(capabilities).toHaveProperty('fileAPI');
            expect(capabilities).toHaveProperty('dragAndDrop');
            expect(capabilities).toHaveProperty('canvas');
            expect(capabilities).toHaveProperty('webWorkers');
            expect(capabilities).toHaveProperty('localStorage');
            expect(capabilities).toHaveProperty('sessionStorage');
            expect(capabilities).toHaveProperty('downloadAttribute');
            expect(capabilities).toHaveProperty('modernCSS');
            expect(capabilities).toHaveProperty('es6');
            expect(capabilities).toHaveProperty('promises');
        });

        it('should cache capabilities', () => {
            const capabilities1 = BrowserCompatibility.getCapabilities();
            const capabilities2 = BrowserCompatibility.getCapabilities();

            expect(capabilities1).toBe(capabilities2);
        });
    });

    describe('checkFeatureSupport', () => {
        it('should return supported for available features', () => {
            const support = BrowserCompatibility.checkFeatureSupport('fileAPI');

            expect(support.supported).toBe(true);
            expect(support.fallback).toBeUndefined();
            expect(support.error).toBeUndefined();
        });

        it('should return fallback info for unsupported features', () => {
            // Mock unsupported feature
            delete (global as any).File;
            (BrowserCompatibility as any).capabilities = null;

            const support = BrowserCompatibility.checkFeatureSupport('fileAPI');

            expect(support.supported).toBe(false);
            expect(support.fallback).toBeDefined();
            expect(support.error).toBeDefined();
            expect(support.error?.userMessage).toContain('File upload is not supported');
        });
    });

    describe('checkMinimumRequirements', () => {
        it('should pass when all requirements are met', () => {
            const requirements = BrowserCompatibility.checkMinimumRequirements();

            expect(requirements.meets).toBe(true);
            expect(requirements.missing).toHaveLength(0);
            expect(requirements.errors).toHaveLength(0);
        });

        it('should fail when requirements are not met', () => {
            // Mock missing required feature
            delete (global as any).File;
            (BrowserCompatibility as any).capabilities = null;

            const requirements = BrowserCompatibility.checkMinimumRequirements();

            expect(requirements.meets).toBe(false);
            expect(requirements.missing).toContain('fileAPI');
            expect(requirements.errors.length).toBeGreaterThan(0);
        });
    });

    describe('getBrowserInfo', () => {
        it('should detect Chrome browser', () => {
            const info = BrowserCompatibility.getBrowserInfo();

            expect(info.name).toBe('Chrome');
            expect(info.version).toBe('91');
            expect(info.engine).toBe('WebKit');
            expect(info.platform).toBe('Win32');
            expect(info.mobile).toBe(false);
        });

        it('should detect mobile browsers', () => {
            Object.defineProperty(window, 'navigator', {
                value: {
                    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                    platform: 'iPhone'
                },
                writable: true
            });

            const info = BrowserCompatibility.getBrowserInfo();

            expect(info.mobile).toBe(true);
        });
    });

    describe('localStorage detection', () => {
        it('should detect localStorage support', () => {
            const capabilities = BrowserCompatibility.getCapabilities();
            expect(capabilities.localStorage).toBe(true);
        });

        it('should handle localStorage exceptions', () => {
            // Mock localStorage that throws
            Object.defineProperty(window, 'localStorage', {
                value: {
                    setItem: vi.fn().mockImplementation(() => {
                        throw new Error('QuotaExceededError');
                    }),
                    removeItem: vi.fn()
                },
                writable: true
            });
            (BrowserCompatibility as any).capabilities = null;

            const capabilities = BrowserCompatibility.getCapabilities();
            expect(capabilities.localStorage).toBe(false);
        });
    });

    describe('ES6 detection', () => {
        it('should detect ES6 support', () => {
            const capabilities = BrowserCompatibility.getCapabilities();
            expect(capabilities.es6).toBe(true);
        });

        it('should handle ES6 detection errors', () => {
            // Mock eval to throw
            const originalEval = global.eval;
            global.eval = vi.fn().mockImplementation(() => {
                throw new Error('SyntaxError');
            });
            (BrowserCompatibility as any).capabilities = null;

            const capabilities = BrowserCompatibility.getCapabilities();
            expect(capabilities.es6).toBe(false);

            global.eval = originalEval;
        });
    });
});

describe('GracefulDegradation', () => {
    beforeEach(() => {
        mockBrowserAPIs();
        (BrowserCompatibility as any).capabilities = null;
    });

    describe('handleFileUpload', () => {
        it('should return drag-drop when fully supported', () => {
            const result = GracefulDegradation.handleFileUpload();

            expect(result.method).toBe('drag-drop');
            expect(result.message).toBeUndefined();
        });

        it('should return file-input when drag-drop not supported', () => {
            // Mock no drag and drop support
            document.createElement = vi.fn().mockImplementation((tagName) => {
                const element = document.createElement(tagName);
                if (tagName === 'div') {
                    // Remove draggable and drag event properties
                    delete (element as any).draggable;
                    delete (element as any).ondragstart;
                    delete (element as any).ondrop;
                }
                return element;
            });
            (BrowserCompatibility as any).capabilities = null;

            const result = GracefulDegradation.handleFileUpload();

            expect(result.method).toBe('file-input');
            expect(result.message).toContain('Drag and drop is not supported');
        });

        it('should return text-only when File API not supported', () => {
            // Mock no File API support
            delete (global as any).File;
            (BrowserCompatibility as any).capabilities = null;

            const result = GracefulDegradation.handleFileUpload();

            expect(result.method).toBe('text-only');
            expect(result.message).toContain('File upload is not supported');
        });
    });

    describe('handlePDFGeneration', () => {
        it('should return full when fully supported', () => {
            const result = GracefulDegradation.handlePDFGeneration();

            expect(result.method).toBe('full');
            expect(result.message).toBeUndefined();
        });

        it('should return basic when download attribute not supported', () => {
            // Mock no download attribute support
            document.createElement = vi.fn().mockImplementation((tagName) => {
                const element = document.createElement(tagName);
                if (tagName === 'a') {
                    delete (element as any).download;
                }
                return element;
            });
            (BrowserCompatibility as any).capabilities = null;

            const result = GracefulDegradation.handlePDFGeneration();

            expect(result.method).toBe('basic');
            expect(result.message).toContain('PDF download may require manual saving');
        });

        it('should return unavailable when canvas not supported', () => {
            // Mock no canvas support
            document.createElement = vi.fn().mockImplementation((tagName) => {
                const element = document.createElement(tagName);
                if (tagName === 'canvas') {
                    element.getContext = vi.fn().mockReturnValue(null);
                }
                return element;
            });
            (BrowserCompatibility as any).capabilities = null;

            const result = GracefulDegradation.handlePDFGeneration();

            expect(result.method).toBe('unavailable');
            expect(result.message).toContain('PDF generation is not supported');
        });
    });

    describe('handleStorage', () => {
        it('should return local when localStorage supported', () => {
            const result = GracefulDegradation.handleStorage();

            expect(result.method).toBe('local');
            expect(result.message).toBeUndefined();
        });

        it('should return session when only sessionStorage supported', () => {
            // Mock localStorage not supported
            Object.defineProperty(window, 'localStorage', {
                value: {
                    setItem: vi.fn().mockImplementation(() => {
                        throw new Error('Not supported');
                    }),
                    removeItem: vi.fn()
                },
                writable: true
            });
            (BrowserCompatibility as any).capabilities = null;

            const result = GracefulDegradation.handleStorage();

            expect(result.method).toBe('session');
            expect(result.message).toContain('Settings will not be saved between browser sessions');
        });

        it('should return memory when no storage supported', () => {
            // Mock no storage support
            Object.defineProperty(window, 'localStorage', {
                value: {
                    setItem: vi.fn().mockImplementation(() => {
                        throw new Error('Not supported');
                    }),
                    removeItem: vi.fn()
                },
                writable: true
            });
            Object.defineProperty(window, 'sessionStorage', {
                value: {
                    setItem: vi.fn().mockImplementation(() => {
                        throw new Error('Not supported');
                    }),
                    removeItem: vi.fn()
                },
                writable: true
            });
            (BrowserCompatibility as any).capabilities = null;

            const result = GracefulDegradation.handleStorage();

            expect(result.method).toBe('memory');
            expect(result.message).toContain('Settings will be lost when you refresh the page');
        });
    });

    describe('canRunApplication', () => {
        it('should allow app to run when requirements are met', () => {
            const result = GracefulDegradation.canRunApplication();

            expect(result.canRun).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should prevent app from running when critical requirements not met', () => {
            // Mock missing critical requirement
            delete (global as any).File;
            (BrowserCompatibility as any).capabilities = null;

            const result = GracefulDegradation.canRunApplication();

            expect(result.canRun).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should provide warnings for degraded functionality', () => {
            // Mock missing non-critical feature
            delete (global as any).Worker;
            (BrowserCompatibility as any).capabilities = null;

            const result = GracefulDegradation.canRunApplication();

            expect(result.canRun).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings[0].userMessage).toContain('Processing may be slower');
        });
    });
});