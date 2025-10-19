import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Suspense } from "react";
import {
  LoadingFallback,
  withLazyLoading,
  preloadComponent,
  usePreloadOnHover,
} from "../lazyLoading";

// Mock component for testing
const MockComponent = ({ message }: { message: string }) => (
  <div data-testid="mock-component">{message}</div>
);

describe("LazyLoading Utils", () => {
  describe("LoadingFallback", () => {
    it("should render default loading message", () => {
      render(<LoadingFallback />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render custom loading message", () => {
      render(<LoadingFallback message="Custom loading..." />);
      expect(screen.getByText("Custom loading...")).toBeInTheDocument();
    });

    it("should have loading spinner", () => {
      render(<LoadingFallback />);
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("withLazyLoading", () => {
    it("should render loading fallback initially", async () => {
      const mockImport = vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ default: MockComponent }), 100)
          )
      );

      const LazyComponent = withLazyLoading(mockImport, "Loading component...");

      render(<LazyComponent message="test" />);

      expect(screen.getByText("Loading component...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId("mock-component")).toBeInTheDocument();
      });

      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("should handle import errors gracefully", async () => {
      const mockImport = vi.fn(() =>
        Promise.reject(new Error("Import failed"))
      );

      const LazyComponent = withLazyLoading(mockImport);

      // Wrap in error boundary to catch the error
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>;
        } catch (error) {
          return <div data-testid="error">Error occurred</div>;
        }
      };

      render(
        <ErrorBoundary>
          <LazyComponent message="test" />
        </ErrorBoundary>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("preloadComponent", () => {
    it("should trigger component import", () => {
      const mockImport = vi.fn(() =>
        Promise.resolve({ default: MockComponent })
      );

      preloadComponent(mockImport);

      expect(mockImport).toHaveBeenCalledTimes(1);
    });

    it("should handle preload failures silently", () => {
      const mockImport = vi.fn(() =>
        Promise.reject(new Error("Preload failed"))
      );
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => preloadComponent(mockImport)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("usePreloadOnHover", () => {
    it("should return onMouseEnter handler", () => {
      const mockImport = vi.fn(() =>
        Promise.resolve({ default: MockComponent })
      );

      const TestComponent = () => {
        const { onMouseEnter } = usePreloadOnHover(mockImport);
        return (
          <div onMouseEnter={onMouseEnter} data-testid="hover-target">
            Hover me
          </div>
        );
      };

      render(<TestComponent />);

      const target = screen.getByTestId("hover-target");
      expect(target).toBeInTheDocument();
    });

    it("should preload component on hover", () => {
      const mockImport = vi.fn(() =>
        Promise.resolve({ default: MockComponent })
      );

      const TestComponent = () => {
        const { onMouseEnter } = usePreloadOnHover(mockImport);
        return (
          <div onMouseEnter={onMouseEnter} data-testid="hover-target">
            Hover me
          </div>
        );
      };

      render(<TestComponent />);

      const target = screen.getByTestId("hover-target");
      fireEvent.mouseEnter(target);

      expect(mockImport).toHaveBeenCalledTimes(1);
    });

    it("should only preload once per component", () => {
      const mockImport = vi.fn(() =>
        Promise.resolve({ default: MockComponent })
      );

      const TestComponent = () => {
        const { onMouseEnter } = usePreloadOnHover(mockImport);
        return (
          <div onMouseEnter={onMouseEnter} data-testid="hover-target">
            Hover me
          </div>
        );
      };

      render(<TestComponent />);

      const target = screen.getByTestId("hover-target");

      // Hover multiple times
      fireEvent.mouseEnter(target);
      fireEvent.mouseEnter(target);
      fireEvent.mouseEnter(target);

      // Should only import once
      expect(mockImport).toHaveBeenCalledTimes(1);
    });
  });
});
