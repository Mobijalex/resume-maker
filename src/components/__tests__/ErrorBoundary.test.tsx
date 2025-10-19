/**
 * Tests for ErrorBoundary component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ErrorBoundary, withErrorBoundary } from "../ErrorBoundary";
import type { AppError } from "../../types/errors";

// Mock error handler
vi.mock("../../utils/errorHandler", () => ({
  ErrorBoundaryHelper: {
    handleReactError: vi.fn().mockReturnValue({
      id: "test-error",
      type: "UNKNOWN",
      severity: "CRITICAL",
      message: "Test error",
      userMessage: "A test error occurred",
      timestamp: new Date(),
      context: { stack: "test stack" },
    }),
  },
  errorHandler: {
    logError: vi.fn(),
  },
}));

// Component that throws an error
const ThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = true,
}) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Working component</div>;
};

// Component that works normally
const WorkingComponent: React.FC = () => {
  return <div>Working component</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for these tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("App level error boundary", () => {
    it("should render children when no error occurs", () => {
      render(
        <ErrorBoundary level="app">
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("Working component")).toBeInTheDocument();
    });

    it("should render app-level error UI when error occurs", () => {
      render(
        <ErrorBoundary level="app">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("Application Error")).toBeInTheDocument();
      expect(screen.getByText("A test error occurred")).toBeInTheDocument();
      expect(screen.getByText(/Try Again/)).toBeInTheDocument();
      expect(screen.getByText("Refresh Page")).toBeInTheDocument();
    });

    it("should show technical details in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      render(
        <ErrorBoundary level="app">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("Technical Details")).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle retry functionality", () => {
      const { rerender } = render(
        <ErrorBoundary level="app">
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Application Error")).toBeInTheDocument();

      // Click retry button
      fireEvent.click(screen.getByText(/Try Again/));

      // Rerender with working component
      rerender(
        <ErrorBoundary level="app">
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Working component")).toBeInTheDocument();
    });

    it("should limit retry attempts", () => {
      render(
        <ErrorBoundary level="app">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Click retry multiple times
      const retryButton = screen.getByText(/Try Again/);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      // Should not show retry button after max attempts
      expect(screen.queryByText(/Try Again/)).not.toBeInTheDocument();
    });
  });

  describe("Feature level error boundary", () => {
    it("should render feature-level error UI", () => {
      render(
        <ErrorBoundary level="feature">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("Feature Unavailable")).toBeInTheDocument();
      expect(screen.getByText("A test error occurred")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });

  describe("Component level error boundary", () => {
    it("should render component-level error UI", () => {
      render(
        <ErrorBoundary level="component">
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("A test error occurred")).toBeInTheDocument();
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });
  });

  describe("Custom fallback", () => {
    it("should use custom fallback when provided", () => {
      const customFallback = (error: AppError, retry: () => void) => (
        <div>
          <p>Custom error: {error.userMessage}</p>
          <button onClick={retry}>Custom Retry</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(
        screen.getByText("Custom error: A test error occurred")
      ).toBeInTheDocument();
      expect(screen.getByText("Custom Retry")).toBeInTheDocument();
    });
  });

  describe("Error callback", () => {
    it("should call onError callback when error occurs", () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "UNKNOWN",
          severity: "CRITICAL",
          userMessage: "A test error occurred",
        })
      );
    });
  });
});

describe("withErrorBoundary HOC", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should wrap component with error boundary", () => {
    const WrappedComponent = withErrorBoundary(WorkingComponent);

    render(<WrappedComponent />);

    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("should catch errors in wrapped component", () => {
    const WrappedComponent = withErrorBoundary(ThrowingComponent);

    render(<WrappedComponent />);

    expect(screen.getByText("A test error occurred")).toBeInTheDocument();
  });

  it("should pass through props to wrapped component", () => {
    const ComponentWithProps: React.FC<{ message: string }> = ({ message }) => (
      <div>{message}</div>
    );
    const WrappedComponent = withErrorBoundary(ComponentWithProps);

    render(<WrappedComponent message="Test message" />);

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should use provided error boundary props", () => {
    const onError = vi.fn();
    const WrappedComponent = withErrorBoundary(ThrowingComponent, {
      level: "feature",
      onError,
    });

    render(<WrappedComponent />);

    expect(screen.getByText("Feature Unavailable")).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it("should set correct display name", () => {
    const TestComponent: React.FC = () => <div>Test</div>;
    TestComponent.displayName = "TestComponent";

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      "withErrorBoundary(TestComponent)"
    );
  });

  it("should handle components without display name", () => {
    const WrappedComponent = withErrorBoundary(WorkingComponent);

    expect(WrappedComponent.displayName).toBe(
      "withErrorBoundary(WorkingComponent)"
    );
  });
});
