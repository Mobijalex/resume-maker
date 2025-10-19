import React, { useState, useEffect } from "react";
import type { AppError } from "../types/errors";
import { errorHandler } from "../utils/errorHandler";

interface ErrorNotificationProps {
  maxVisible?: number;
  autoHideDuration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

interface NotificationItem {
  error: AppError;
  id: string;
  timestamp: number;
}

/**
 * Error notification component for displaying user-friendly error messages
 */
export function ErrorNotification({
  maxVisible = 3,
  autoHideDuration = 5000,
  position = "top-right",
}: ErrorNotificationProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Subscribe to error changes
    const unsubscribe = errorHandler.onErrorsChanged((errors) => {
      // Only show high priority errors as notifications
      const highPriorityErrors = errors.filter(
        (error) => error.severity === "HIGH" || error.severity === "CRITICAL"
      );

      // Convert to notification items
      const newNotifications = highPriorityErrors
        .slice(-maxVisible) // Only show the most recent errors
        .map((error) => ({
          error,
          id: `notification_${error.id}_${Date.now()}`,
          timestamp: Date.now(),
        }));

      setNotifications(newNotifications);
    });

    return unsubscribe;
  }, [maxVisible]);

  useEffect(() => {
    // Auto-hide notifications
    if (autoHideDuration > 0) {
      const timer = setInterval(() => {
        const now = Date.now();
        setNotifications((prev) =>
          prev.filter((notification) => {
            // Don't auto-hide critical errors
            if (notification.error.severity === "CRITICAL") {
              return true;
            }
            return now - notification.timestamp < autoHideDuration;
          })
        );
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoHideDuration]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  const getPositionClasses = () => {
    const baseClasses = "fixed z-50 space-y-2";

    switch (position) {
      case "top-right":
        return `${baseClasses} top-4 right-4`;
      case "top-left":
        return `${baseClasses} top-4 left-4`;
      case "bottom-right":
        return `${baseClasses} bottom-4 right-4`;
      case "bottom-left":
        return `${baseClasses} bottom-4 left-4`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return {
          container: "bg-red-50 border-red-200",
          icon: "text-red-500",
          title: "text-red-800",
          message: "text-red-700",
          button: "bg-red-100 text-red-800 hover:bg-red-200",
        };
      case "HIGH":
        return {
          container: "bg-orange-50 border-orange-200",
          icon: "text-orange-500",
          title: "text-orange-800",
          message: "text-orange-700",
          button: "bg-orange-100 text-orange-800 hover:bg-orange-200",
        };
      default:
        return {
          container: "bg-yellow-50 border-yellow-200",
          icon: "text-yellow-500",
          title: "text-yellow-800",
          message: "text-yellow-700",
          button: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        };
    }
  };

  const getIcon = (severity: string) => {
    if (severity === "CRITICAL") {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      );
    }

    return (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={getPositionClasses()}>
      {notifications.length > 1 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={dismissAll}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Dismiss all
          </button>
        </div>
      )}

      {notifications.map((notification) => {
        const styles = getSeverityStyles(notification.error.severity);

        return (
          <div
            key={notification.id}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out ${styles.container}`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <div className={styles.icon}>
                  {getIcon(notification.error.severity)}
                </div>
              </div>

              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${styles.title}`}>
                  {notification.error.severity === "CRITICAL"
                    ? "Critical Error"
                    : "Error"}
                </h3>

                <div className={`mt-1 text-sm ${styles.message}`}>
                  <p>{notification.error.userMessage}</p>
                </div>

                {/* Show additional context for development */}
                {process.env.NODE_ENV === "development" &&
                  notification.error.context && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        Technical Details
                      </summary>
                      <pre className="mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-20">
                        {JSON.stringify(notification.error.context, null, 2)}
                      </pre>
                    </details>
                  )}

                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${styles.button}`}
                  >
                    Dismiss
                  </button>

                  {notification.error.severity === "CRITICAL" && (
                    <button
                      onClick={() => window.location.reload()}
                      className="px-2 py-1 rounded text-xs font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                    >
                      Refresh Page
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Hook to manually trigger error notifications
 */
export function useErrorNotification() {
  const showError = (error: AppError) => {
    errorHandler.logError(error);
  };

  const showFileError = (
    message: string,
    userMessage: string,
    context?: any
  ) => {
    const error = {
      id: `manual_error_${Date.now()}`,
      type: "FILE_UPLOAD" as const,
      severity: "HIGH" as const,
      message,
      userMessage,
      timestamp: new Date(),
      context,
    };
    errorHandler.handleFileError(error);
  };

  const showValidationError = (
    message: string,
    userMessage: string,
    context?: any
  ) => {
    const error = {
      id: `manual_error_${Date.now()}`,
      type: "VALIDATION" as const,
      severity: "MEDIUM" as const,
      message,
      userMessage,
      timestamp: new Date(),
      context,
    };
    errorHandler.handleValidationError(error);
  };

  const showPDFError = (
    message: string,
    userMessage: string,
    context?: any
  ) => {
    const error = {
      id: `manual_error_${Date.now()}`,
      type: "PDF_GENERATION" as const,
      severity: "HIGH" as const,
      message,
      userMessage,
      timestamp: new Date(),
      context,
    };
    errorHandler.handlePDFError(error);
  };

  const clearErrors = () => {
    errorHandler.clearErrors();
  };

  return {
    showError,
    showFileError,
    showValidationError,
    showPDFError,
    clearErrors,
  };
}
