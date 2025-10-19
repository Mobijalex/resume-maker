/**
 * Global error handler for unhandled errors and promise rejections
 */

import { ErrorBoundaryHelper, errorHandler } from './errorHandler';
import { BrowserCompatibility, GracefulDegradation } from './browserCompatibility';
import type { AppError } from '../types/errors';

export interface GlobalErrorHandlerOptions {
    enableConsoleLogging?: boolean;
    enableUserNotifications?: boolean;
    enableErrorReporting?: boolean;
    onError?: (error: AppError) => void;
}

/**
 * Global error handler class
 */
export class GlobalErrorHandler {
    private static instance: GlobalErrorHandler | null = null;
    private options: Required<GlobalErrorHandlerOptions>;
    private isInitialized = false;

    private constructor(options: GlobalErrorHandlerOptions = {}) {
        this.options = {
            enableConsoleLogging: true,
            enableUserNotifications: true,
            enableErrorReporting: false,
            onError: () => { },
            ...options
        };
    }

    /**
     * Get singleton instance
     */
    static getInstance(options?: GlobalErrorHandlerOptions): GlobalErrorHandler {
        if (!this.instance) {
            this.instance = new GlobalErrorHandler(options);
        }
        return this.instance;
    }

    /**
     * Initialize global error handling
     */
    initialize(): void {
        if (this.isInitialized) {
            return;
        }

        this.setupUnhandledErrorHandler();
        this.setupUnhandledRejectionHandler();
        this.setupBrowserCompatibilityCheck();
        this.setupConsoleErrorOverride();

        this.isInitialized = true;

        if (this.options.enableConsoleLogging) {
            console.log('Global error handler initialized');
        }
    }

    /**
     * Cleanup global error handlers
     */
    cleanup(): void {
        if (!this.isInitialized) {
            return;
        }

        window.removeEventListener('error', this.handleUnhandledError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);

        this.isInitialized = false;
    }

    /**
     * Update options
     */
    updateOptions(options: Partial<GlobalErrorHandlerOptions>): void {
        this.options = { ...this.options, ...options };
    }

    /**
     * Setup unhandled error handler
     */
    private setupUnhandledErrorHandler(): void {
        window.addEventListener('error', this.handleUnhandledError);
    }

    /**
     * Setup unhandled promise rejection handler
     */
    private setupUnhandledRejectionHandler(): void {
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }

    /**
     * Setup browser compatibility check
     */
    private setupBrowserCompatibilityCheck(): void {
        const compatibility = GracefulDegradation.canRunApplication();

        if (!compatibility.canRun) {
            // Critical compatibility issues
            for (const error of compatibility.errors) {
                this.handleAppError(error);
            }
        }

        if (compatibility.warnings.length > 0) {
            // Non-critical compatibility warnings
            for (const warning of compatibility.warnings) {
                this.handleAppError(warning);
            }
        }
    }

    /**
     * Setup console error override for development
     */
    private setupConsoleErrorOverride(): void {
        if (process.env.NODE_ENV === 'development') {
            const originalConsoleError = console.error;

            console.error = (...args: any[]) => {
                // Call original console.error
                originalConsoleError.apply(console, args);

                // Create error from console.error call
                const message = args.map(arg =>
                    typeof arg === 'string' ? arg : JSON.stringify(arg)
                ).join(' ');

                const appError = ErrorBoundaryHelper.handleReactError(
                    new Error(message),
                    { componentStack: 'Console Error' }
                );

                this.handleAppError(appError);
            };
        }
    }

    /**
     * Handle unhandled JavaScript errors
     */
    private handleUnhandledError = (event: ErrorEvent): void => {
        const appError: AppError = {
            id: `unhandled_error_${Date.now()}`,
            type: 'UNKNOWN',
            severity: 'HIGH',
            message: event.message || 'Unhandled JavaScript error',
            userMessage: 'An unexpected error occurred. The page may not work correctly.',
            timestamp: new Date(),
            context: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                unhandledError: true
            }
        };

        this.handleAppError(appError);
    };

    /**
     * Handle unhandled promise rejections
     */
    private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
        const appError = ErrorBoundaryHelper.handleUnhandledRejection(event);
        this.handleAppError(appError);

        // Prevent the default browser behavior (logging to console)
        event.preventDefault();
    };

    /**
     * Handle application errors
     */
    private handleAppError(error: AppError): void {
        // Log to error handler
        errorHandler.logError(error);

        // Add to error collection
        if (error.type === 'FILE_UPLOAD') {
            errorHandler.handleFileError(error as any);
        } else if (error.type === 'PARSING') {
            errorHandler.handleParsingError(error as any);
        } else if (error.type === 'VALIDATION') {
            errorHandler.handleValidationError(error as any);
        } else if (error.type === 'PDF_GENERATION') {
            errorHandler.handlePDFError(error as any);
        } else if (error.type === 'TEMPLATE') {
            errorHandler.handleTemplateError(error as any);
        } else if (error.type === 'NETWORK') {
            errorHandler.handleNetworkError(error as any);
        }

        // Console logging
        if (this.options.enableConsoleLogging) {
            if (error.severity === 'CRITICAL' || error.severity === 'HIGH') {
                console.error('Global Error:', error);
            } else {
                console.warn('Global Warning:', error);
            }
        }

        // User notifications
        if (this.options.enableUserNotifications) {
            this.showUserNotification(error);
        }

        // Error reporting
        if (this.options.enableErrorReporting) {
            this.reportError(error);
        }

        // Custom error handler
        this.options.onError(error);
    }

    /**
     * Show user notification for errors
     */
    private showUserNotification(error: AppError): void {
        // Only show notifications for high priority errors
        if (error.severity !== 'HIGH' && error.severity !== 'CRITICAL') {
            return;
        }

        // In a real application, this would integrate with a toast/notification system
        // For now, we'll create a simple notification
        this.createNotificationElement(error);
    }

    /**
     * Create a simple notification element
     */
    private createNotificationElement(error: AppError): void {
        // Check if notification already exists
        const existingNotification = document.getElementById('global-error-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'global-error-notification';
        notification.className = `
      fixed top-4 right-4 z-50 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg
      transform transition-transform duration-300 ease-in-out
    `;

        notification.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">
            ${error.severity === 'CRITICAL' ? 'Critical Error' : 'Error'}
          </h3>
          <div class="mt-1 text-sm text-red-700">
            <p>${error.userMessage}</p>
          </div>
          <div class="mt-3">
            <button 
              onclick="this.parentElement.parentElement.parentElement.parentElement.remove()"
              class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium hover:bg-red-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds for non-critical errors
        if (error.severity !== 'CRITICAL') {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 10000);
        }
    }

    /**
     * Report error to external service (placeholder)
     */
    private reportError(error: AppError): void {
        // In a real application, this would send errors to a service like Sentry
        if (process.env.NODE_ENV === 'development') {
            console.log('Would report error to external service:', error);
        }

        // Example implementation:
        // try {
        //   fetch('/api/errors', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(error)
        //   });
        // } catch (reportingError) {
        //   console.error('Failed to report error:', reportingError);
        // }
    }

    /**
     * Get error statistics
     */
    getErrorStatistics(): {
        total: number;
        byType: Record<string, number>;
        bySeverity: Record<string, number>;
        recent: AppError[];
    } {
        const allErrors = errorHandler.getAllErrors();
        const recent = allErrors.slice(-10); // Last 10 errors

        const byType: Record<string, number> = {};
        const bySeverity: Record<string, number> = {};

        for (const error of allErrors) {
            byType[error.type] = (byType[error.type] || 0) + 1;
            bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
        }

        return {
            total: allErrors.length,
            byType,
            bySeverity,
            recent
        };
    }

    /**
     * Clear all errors
     */
    clearErrors(): void {
        errorHandler.clearErrors();
    }
}

/**
 * Initialize global error handling
 */
export function initializeGlobalErrorHandling(options?: GlobalErrorHandlerOptions): GlobalErrorHandler {
    const handler = GlobalErrorHandler.getInstance(options);
    handler.initialize();
    return handler;
}

/**
 * Cleanup global error handling
 */
export function cleanupGlobalErrorHandling(): void {
    const handler = GlobalErrorHandler.getInstance();
    handler.cleanup();
}