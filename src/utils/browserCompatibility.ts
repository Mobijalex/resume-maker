/**
 * Browser compatibility and graceful degradation utilities
 */

import { errorFactory } from './errorFactory';
import type { AppError } from '../types/errors';

export interface BrowserCapabilities {
    fileAPI: boolean;
    dragAndDrop: boolean;
    canvas: boolean;
    webWorkers: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    downloadAttribute: boolean;
    modernCSS: boolean;
    es6: boolean;
    promises: boolean;
}

export interface FeatureSupport {
    supported: boolean;
    fallback?: string;
    error?: AppError;
}

/**
 * Browser compatibility checker
 */
export class BrowserCompatibility {
    private static capabilities: BrowserCapabilities | null = null;

    /**
     * Get browser capabilities
     */
    static getCapabilities(): BrowserCapabilities {
        if (this.capabilities) {
            return this.capabilities;
        }

        this.capabilities = {
            fileAPI: this.checkFileAPI(),
            dragAndDrop: this.checkDragAndDrop(),
            canvas: this.checkCanvas(),
            webWorkers: this.checkWebWorkers(),
            localStorage: this.checkLocalStorage(),
            sessionStorage: this.checkSessionStorage(),
            downloadAttribute: this.checkDownloadAttribute(),
            modernCSS: this.checkModernCSS(),
            es6: this.checkES6(),
            promises: this.checkPromises()
        };

        return this.capabilities;
    }

    /**
     * Check if a specific feature is supported
     */
    static checkFeatureSupport(feature: keyof BrowserCapabilities): FeatureSupport {
        const capabilities = this.getCapabilities();
        const supported = capabilities[feature];

        if (supported) {
            return { supported: true };
        }

        // Provide fallback suggestions and error information
        const fallbackInfo = this.getFallbackInfo(feature);
        const error = errorFactory.createBaseError(
            'UNKNOWN',
            'MEDIUM',
            `Browser does not support ${feature}`,
            fallbackInfo.userMessage,
            { feature, capabilities }
        );

        return {
            supported: false,
            fallback: fallbackInfo.fallback,
            error
        };
    }

    /**
     * Check if the browser meets minimum requirements
     */
    static checkMinimumRequirements(): {
        meets: boolean;
        missing: string[];
        errors: AppError[];
    } {
        const capabilities = this.getCapabilities();
        const required: (keyof BrowserCapabilities)[] = [
            'fileAPI',
            'canvas',
            'localStorage',
            'es6',
            'promises'
        ];

        const missing: string[] = [];
        const errors: AppError[] = [];

        for (const requirement of required) {
            if (!capabilities[requirement]) {
                missing.push(requirement);

                const error = errorFactory.createBaseError(
                    'UNKNOWN',
                    'CRITICAL',
                    `Missing required browser feature: ${requirement}`,
                    `Your browser does not support ${requirement}, which is required for this application to work properly.`,
                    { requirement, capabilities }
                );

                errors.push(error);
            }
        }

        return {
            meets: missing.length === 0,
            missing,
            errors
        };
    }

    /**
     * Get browser information
     */
    static getBrowserInfo(): {
        name: string;
        version: string;
        engine: string;
        platform: string;
        mobile: boolean;
    } {
        const userAgent = navigator.userAgent;

        return {
            name: this.getBrowserName(userAgent),
            version: this.getBrowserVersion(userAgent),
            engine: this.getBrowserEngine(userAgent),
            platform: navigator.platform,
            mobile: /Mobi|Android/i.test(userAgent)
        };
    }

    /**
     * Check File API support
     */
    private static checkFileAPI(): boolean {
        return !!(window.File && window.FileReader && window.FileList && window.Blob);
    }

    /**
     * Check drag and drop support
     */
    private static checkDragAndDrop(): boolean {
        const div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    }

    /**
     * Check canvas support
     */
    private static checkCanvas(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch {
            return false;
        }
    }

    /**
     * Check Web Workers support
     */
    private static checkWebWorkers(): boolean {
        return typeof Worker !== 'undefined';
    }

    /**
     * Check localStorage support
     */
    private static checkLocalStorage(): boolean {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check sessionStorage support
     */
    private static checkSessionStorage(): boolean {
        try {
            const test = 'test';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check download attribute support
     */
    private static checkDownloadAttribute(): boolean {
        return 'download' in document.createElement('a');
    }

    /**
     * Check modern CSS support
     */
    private static checkModernCSS(): boolean {
        const div = document.createElement('div');
        const style = div.style;

        return !!(
            'flexbox' in style ||
            'flex' in style ||
            'grid' in style ||
            'gridTemplateColumns' in style
        );
    }

    /**
     * Check ES6 support
     */
    private static checkES6(): boolean {
        try {
            // Test arrow functions
            eval('() => {}');
            // Test const/let
            eval('const test = 1; let test2 = 2;');
            // Test template literals
            eval('`template ${1} literal`');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check Promises support
     */
    private static checkPromises(): boolean {
        return typeof Promise !== 'undefined' && typeof Promise.resolve === 'function';
    }

    /**
     * Get fallback information for unsupported features
     */
    private static getFallbackInfo(feature: keyof BrowserCapabilities): {
        fallback: string;
        userMessage: string;
    } {
        const fallbacks = {
            fileAPI: {
                fallback: 'Use text input instead of file upload',
                userMessage: 'File upload is not supported. Please use the text input option instead.'
            },
            dragAndDrop: {
                fallback: 'Use file input button',
                userMessage: 'Drag and drop is not supported. Please use the file selection button.'
            },
            canvas: {
                fallback: 'Limited PDF generation capabilities',
                userMessage: 'Advanced PDF features may not work properly in your browser.'
            },
            webWorkers: {
                fallback: 'Process on main thread',
                userMessage: 'Processing may be slower as background processing is not available.'
            },
            localStorage: {
                fallback: 'Session-only storage',
                userMessage: 'Settings will not be saved between sessions.'
            },
            sessionStorage: {
                fallback: 'Memory-only storage',
                userMessage: 'Temporary data storage is limited.'
            },
            downloadAttribute: {
                fallback: 'Manual save required',
                userMessage: 'You may need to manually save the downloaded file.'
            },
            modernCSS: {
                fallback: 'Basic styling',
                userMessage: 'The interface may appear differently in your browser.'
            },
            es6: {
                fallback: 'Limited functionality',
                userMessage: 'Some features may not work properly. Please update your browser.'
            },
            promises: {
                fallback: 'Synchronous operations',
                userMessage: 'The application may be less responsive. Please update your browser.'
            }
        };

        return fallbacks[feature] || {
            fallback: 'Feature not available',
            userMessage: 'This feature is not supported in your browser.'
        };
    }

    /**
     * Get browser name from user agent
     */
    private static getBrowserName(userAgent: string): string {
        if (userAgent.includes('Edg/')) return 'Edge'; // Modern Edge
        if (userAgent.includes('Edge/')) return 'Edge'; // Legacy Edge
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Opera')) return 'Opera';
        return 'Unknown';
    }

    /**
     * Get browser version from user agent
     */
    private static getBrowserVersion(userAgent: string): string {
        const patterns = [
            /Chrome\/(\d+)/,
            /Firefox\/(\d+)/,
            /Safari\/(\d+)/,
            /Edge\/(\d+)/,
            /Opera\/(\d+)/
        ];

        for (const pattern of patterns) {
            const match = userAgent.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return 'Unknown';
    }

    /**
     * Get browser engine from user agent
     */
    private static getBrowserEngine(userAgent: string): string {
        if (userAgent.includes('WebKit')) return 'WebKit';
        if (userAgent.includes('Gecko')) return 'Gecko';
        if (userAgent.includes('Trident')) return 'Trident';
        return 'Unknown';
    }
}

/**
 * Graceful degradation utilities
 */
export class GracefulDegradation {
    /**
     * Provide graceful degradation for file upload
     */
    static handleFileUpload(): {
        method: 'drag-drop' | 'file-input' | 'text-only';
        message?: string;
    } {
        const capabilities = BrowserCompatibility.getCapabilities();

        if (capabilities.fileAPI && capabilities.dragAndDrop) {
            return { method: 'drag-drop' };
        }

        if (capabilities.fileAPI) {
            return {
                method: 'file-input',
                message: 'Drag and drop is not supported. Please use the file selection button.'
            };
        }

        return {
            method: 'text-only',
            message: 'File upload is not supported. Please paste your resume content directly.'
        };
    }

    /**
     * Provide graceful degradation for PDF generation
     */
    static handlePDFGeneration(): {
        method: 'full' | 'basic' | 'unavailable';
        message?: string;
    } {
        const capabilities = BrowserCompatibility.getCapabilities();

        if (capabilities.canvas && capabilities.downloadAttribute) {
            return { method: 'full' };
        }

        if (capabilities.canvas) {
            return {
                method: 'basic',
                message: 'PDF download may require manual saving.'
            };
        }

        return {
            method: 'unavailable',
            message: 'PDF generation is not supported in your browser. Please try a different browser.'
        };
    }

    /**
     * Provide graceful degradation for storage
     */
    static handleStorage(): {
        method: 'local' | 'session' | 'memory';
        message?: string;
    } {
        const capabilities = BrowserCompatibility.getCapabilities();

        if (capabilities.localStorage) {
            return { method: 'local' };
        }

        if (capabilities.sessionStorage) {
            return {
                method: 'session',
                message: 'Settings will not be saved between browser sessions.'
            };
        }

        return {
            method: 'memory',
            message: 'Settings will be lost when you refresh the page.'
        };
    }

    /**
     * Check if the application can run
     */
    static canRunApplication(): {
        canRun: boolean;
        errors: AppError[];
        warnings: AppError[];
    } {
        const requirements = BrowserCompatibility.checkMinimumRequirements();
        const errors: AppError[] = [];
        const warnings: AppError[] = [];

        // Critical errors that prevent the app from running
        if (!requirements.meets) {
            errors.push(...requirements.errors);
        }

        // Warnings for degraded functionality
        const capabilities = BrowserCompatibility.getCapabilities();

        if (!capabilities.dragAndDrop) {
            warnings.push(errorFactory.createBaseError(
                'UNKNOWN',
                'LOW',
                'Drag and drop not supported',
                'You will need to use the file selection button instead of drag and drop.',
                { feature: 'dragAndDrop' }
            ));
        }

        if (!capabilities.webWorkers) {
            warnings.push(errorFactory.createBaseError(
                'UNKNOWN',
                'LOW',
                'Web Workers not supported',
                'Processing may be slower as it will run on the main thread.',
                { feature: 'webWorkers' }
            ));
        }

        return {
            canRun: errors.length === 0,
            errors,
            warnings
        };
    }
}