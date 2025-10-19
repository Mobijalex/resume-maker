/**
 * Tests for ErrorNotification component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ErrorNotification, useErrorNotification } from "../ErrorNotification";
import type { AppError } from "../../types/errors";

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock error handler
const mockOnErrorsChanged = vi.fn();
const mockLogError = vi.fn();
const mockHandleFileError = vi.fn();
const mockHandleValidationError = vi.fn();
const mockHandlePDFError = vi.fn();
const mockClearErrors = vi.fn();

vi.mock("../../utils/errorHandler", () => ({
  errorHandler: {
    onErrorsChanged: mockOnErrorsChanged,
    logError: mockLogError,
    handleFileError: mockHandleFileError,
    handleValidationError: mockHandleValidationError,
    handlePDFError: mockHandlePDFError,
    clearErrors: mockClearErrors,
  },
}));

// Test component that uses the hook
const TestHookComponent: React.FC = () => {
  const {
    showError,
    showFileError,
    showValidationError,
    showPDFError,
    clearErrors,
  } = useErrorNotification();

  return (
    <div>
      <button onClick={() => showFileError("File error", "File error message")}>
        Show File Error
      </button>
      <button
        onClick={() =>
          showValidationError("Validation error", "Validation error message")
        }
      >
        Show Validation Error
      </button>
      <button onClick={() => showPDFError("PDF error", "PDF error message")}>
        Show PDF Error
      </button>
      <button onClick={clearErrors}>Clear Errors</button>
    </div>
  );
};

describe("ErrorNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not render when there are no errors", () => {
    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([]);
      return vi.fn(); // unsubscribe function
    });

    render(<ErrorNotification />);

    expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
  });

  it("should render high priority errors", () => {
    const highPriorityError: AppError = {
      id: "error-1",
      type: "FILE_UPLOAD",
      severity: "HIGH",
      message: "File upload failed",
      userMessage: "Failed to upload file. Please try again.",
      timestamp: new Date(),
    };

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([highPriorityError]);
      return vi.fn();
    });

    render(<ErrorNotification />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to upload file. Please try again.")
    ).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });

  it("should render critical errors", () => {
    const criticalError: AppError = {
      id: "error-1",
      type: "PDF_GENERATION",
      severity: "CRITICAL",
      message: "PDF generation failed",
      userMessage: "Critical error occurred during PDF generation.",
      timestamp: new Date(),
    };

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([criticalError]);
      return jest.fn();
    });

    render(<ErrorNotification />);

    expect(screen.getByText("Critical Error")).toBeInTheDocument();
    expect(
      screen.getByText("Critical error occurred during PDF generation.")
    ).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
  });

  it("should not render low priority errors", () => {
    const lowPriorityError: AppError = {
      id: "error-1",
      type: "VALIDATION",
      severity: "LOW",
      message: "Minor validation issue",
      userMessage: "Minor issue detected.",
      timestamp: new Date(),
    };

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([lowPriorityError]);
      return jest.fn();
    });

    render(<ErrorNotification />);

    expect(screen.queryByText("Minor issue detected.")).not.toBeInTheDocument();
  });

  it("should limit the number of visible notifications", () => {
    const errors: AppError[] = Array.from({ length: 5 }, (_, i) => ({
      id: `error-${i}`,
      type: "FILE_UPLOAD",
      severity: "HIGH",
      message: `Error ${i}`,
      userMessage: `Error message ${i}`,
      timestamp: new Date(),
    }));

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback(errors);
      return jest.fn();
    });

    render(<ErrorNotification maxVisible={2} />);

    // Should only show the last 2 errors
    expect(screen.getByText("Error message 3")).toBeInTheDocument();
    expect(screen.getByText("Error message 4")).toBeInTheDocument();
    expect(screen.queryByText("Error message 0")).not.toBeInTheDocument();
    expect(screen.queryByText("Error message 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Error message 2")).not.toBeInTheDocument();
  });

  it("should show dismiss all button for multiple notifications", () => {
    const errors: AppError[] = Array.from({ length: 2 }, (_, i) => ({
      id: `error-${i}`,
      type: "FILE_UPLOAD",
      severity: "HIGH",
      message: `Error ${i}`,
      userMessage: `Error message ${i}`,
      timestamp: new Date(),
    }));

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback(errors);
      return jest.fn();
    });

    render(<ErrorNotification />);

    expect(screen.getByText("Dismiss all")).toBeInTheDocument();
  });

  it("should dismiss individual notifications", () => {
    const error: AppError = {
      id: "error-1",
      type: "FILE_UPLOAD",
      severity: "HIGH",
      message: "File upload failed",
      userMessage: "Failed to upload file.",
      timestamp: new Date(),
    };

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([error]);
      return jest.fn();
    });

    render(<ErrorNotification />);

    expect(screen.getByText("Failed to upload file.")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dismiss"));

    expect(
      screen.queryByText("Failed to upload file.")
    ).not.toBeInTheDocument();
  });

  it("should dismiss all notifications", () => {
    const errors: AppError[] = Array.from({ length: 2 }, (_, i) => ({
      id: `error-${i}`,
      type: "FILE_UPLOAD",
      severity: "HIGH",
      message: `Error ${i}`,
      userMessage: `Error message ${i}`,
      timestamp: new Date(),
    }));

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback(errors);
      return jest.fn();
    });

    render(<ErrorNotification />);

    expect(screen.getByText("Error message 0")).toBeInTheDocument();
    expect(screen.getByText("Error message 1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dismiss all"));

    expect(screen.queryByText("Error message 0")).not.toBeInTheDocument();
    expect(screen.queryByText("Error message 1")).not.toBeInTheDocument();
  });

  it("should auto-hide non-critical notifications", async () => {
    const error: AppError = {
      id: "error-1",
      type: "FILE_UPLOAD",
      severity: "HIGH",
      message: "File upload failed",
      userMessage: "Failed to upload file.",
      timestamp: new Date(),
    };

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([error]);
      return jest.fn();
    });

    render(<ErrorNotification autoHideDuration={1000} />);

    expect(screen.getByText("Failed to upload file.")).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(
        screen.queryByText("Failed to upload file.")
      ).not.toBeInTheDocument();
    });
  });

  it("should not auto-hide critical notifications", async () => {
    const criticalError: AppError = {
      id: "error-1",
      type: "PDF_GENERATION",
      severity: "CRITICAL",
      message: "Critical error",
      userMessage: "Critical error occurred.",
      timestamp: new Date(),
    };

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([criticalError]);
      return jest.fn();
    });

    render(<ErrorNotification autoHideDuration={1000} />);

    expect(screen.getByText("Critical error occurred.")).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(screen.getByText("Critical error occurred.")).toBeInTheDocument();
    });
  });

  it("should show technical details in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const error: AppError = {
      id: "error-1",
      type: "FILE_UPLOAD",
      severity: "HIGH",
      message: "File upload failed",
      userMessage: "Failed to upload file.",
      timestamp: new Date(),
      context: { debug: "test context" },
    };

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([error]);
      return jest.fn();
    });

    render(<ErrorNotification />);

    expect(screen.getByText("Technical Details")).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("should position notifications correctly", () => {
    const error: AppError = {
      id: "error-1",
      type: "FILE_UPLOAD",
      severity: "HIGH",
      message: "File upload failed",
      userMessage: "Failed to upload file.",
      timestamp: new Date(),
    };

    mockOnErrorsChanged.mockImplementation((callback) => {
      callback([error]);
      return jest.fn();
    });

    const { container } = render(<ErrorNotification position="bottom-left" />);

    const notificationContainer = container.querySelector(".fixed");
    expect(notificationContainer).toHaveClass("bottom-4", "left-4");
  });
});

describe("useErrorNotification hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide error notification functions", () => {
    render(<TestHookComponent />);

    expect(screen.getByText("Show File Error")).toBeInTheDocument();
    expect(screen.getByText("Show Validation Error")).toBeInTheDocument();
    expect(screen.getByText("Show PDF Error")).toBeInTheDocument();
    expect(screen.getByText("Clear Errors")).toBeInTheDocument();
  });

  it("should handle file errors", () => {
    render(<TestHookComponent />);

    fireEvent.click(screen.getByText("Show File Error"));

    expect(mockHandleFileError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "FILE_UPLOAD",
        severity: "HIGH",
        message: "File error",
        userMessage: "File error message",
      })
    );
  });

  it("should handle validation errors", () => {
    render(<TestHookComponent />);

    fireEvent.click(screen.getByText("Show Validation Error"));

    expect(mockHandleValidationError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "VALIDATION",
        severity: "MEDIUM",
        message: "Validation error",
        userMessage: "Validation error message",
      })
    );
  });

  it("should handle PDF errors", () => {
    render(<TestHookComponent />);

    fireEvent.click(screen.getByText("Show PDF Error"));

    expect(mockHandlePDFError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "PDF_GENERATION",
        severity: "HIGH",
        message: "PDF error",
        userMessage: "PDF error message",
      })
    );
  });

  it("should clear errors", () => {
    render(<TestHookComponent />);

    fireEvent.click(screen.getByText("Clear Errors"));

    expect(mockClearErrors).toHaveBeenCalled();
  });
});
