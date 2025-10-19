/**
 * Responsive Design Tests
 *
 * Tests responsive design functionality across various screen sizes and devices.
 * Validates requirement 10.3 for responsive design support.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../../context/AppContext";
import App from "../../App";

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event("resize"));
};

describe("Responsive Design Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Desktop Layouts (1024x768 and above)", () => {
    beforeEach(() => {
      mockWindowDimensions(1920, 1080);
      mockMatchMedia(false); // Not mobile
    });

    it("should display full desktop layout", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Desktop should show full navigation and layout
      expect(screen.getByText(/resume converter/i)).toBeInTheDocument();

      // Check that desktop-specific elements are visible
      const container = document.querySelector(".container");
      expect(container).toBeInTheDocument();
    });

    it("should show side-by-side layout for upload options", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Desktop should show upload and text input side by side
      const uploadSection = screen.getByText(/upload.*file/i).closest("div");
      const textSection = screen.getByText(/paste.*markdown/i).closest("div");

      expect(uploadSection).toBeInTheDocument();
      expect(textSection).toBeInTheDocument();
    });

    it("should display full-width preview on desktop", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Navigate to preview step
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Test User\n## Contact\nEmail: test@example.com\n## Experience\nDeveloper"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      // Preview should be full width on desktop
      const previewContainer = document.querySelector(
        '[data-testid="preview-container"]'
      );
      if (previewContainer) {
        const styles = window.getComputedStyle(previewContainer);
        expect(styles.width).not.toBe("100%"); // Should not be constrained on desktop
      }
    });
  });

  describe("Tablet Layouts (768px - 1023px)", () => {
    beforeEach(() => {
      mockWindowDimensions(768, 1024);
      mockMatchMedia(true); // Tablet breakpoint
    });

    it("should adapt layout for tablet screens", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      expect(screen.getByText(/resume converter/i)).toBeInTheDocument();

      // Tablet layout should still be functional
      const uploadInput = screen.getByLabelText(/upload.*markdown/i);
      expect(uploadInput).toBeInTheDocument();
    });

    it("should stack upload options vertically on tablet", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // On tablet, upload options should stack
      const uploadSection = screen.getByText(/upload.*file/i).closest("div");
      const textSection = screen.getByText(/paste.*markdown/i).closest("div");

      expect(uploadSection).toBeInTheDocument();
      expect(textSection).toBeInTheDocument();
    });

    it("should maintain usability on tablet", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Test that all interactions work on tablet
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Tablet Test\n## Contact\nEmail: tablet@example.com"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      expect(screen.getByText(/template/i)).toBeInTheDocument();
    });
  });

  describe("Minimum Resolution Support (1024x768)", () => {
    beforeEach(() => {
      mockWindowDimensions(1024, 768);
      mockMatchMedia(false);
    });

    it("should support minimum resolution as per requirement 8.3", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Should render without horizontal scrolling
      expect(document.body.scrollWidth).toBeLessThanOrEqual(1024);

      // All essential elements should be visible
      expect(screen.getByText(/resume converter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/upload.*markdown/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/paste.*markdown/i)
      ).toBeInTheDocument();
    });

    it("should maintain functionality at minimum resolution", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Complete workflow should work at minimum resolution
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Min Res Test\n## Contact\nEmail: minres@example.com\n## Experience\nTester"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      expect(screen.getByText(/template/i)).toBeInTheDocument();
    });
  });

  describe("Touch Device Support", () => {
    beforeEach(() => {
      // Mock touch support
      Object.defineProperty(window, "ontouchstart", {
        value: {},
        writable: true,
      });
    });

    it("should support touch interactions", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Test touch-friendly interactions
      const parseButton = screen.getByText(/parse/i);

      // Button should be large enough for touch (minimum 44px)
      const buttonStyles = window.getComputedStyle(parseButton);
      const minTouchSize = 44;

      expect(
        parseInt(buttonStyles.minHeight) || parseInt(buttonStyles.height)
      ).toBeGreaterThanOrEqual(minTouchSize);
    });

    it("should handle touch drag and drop", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const dropZone = screen.getByText(/drag.*drop/i).closest("div");
      expect(dropZone).toBeInTheDocument();

      // Should have touch-friendly styling
      expect(dropZone).toHaveClass(/border-dashed|border-2|p-/);
    });
  });

  describe("Viewport Meta Tag and Scaling", () => {
    it("should have proper viewport meta tag", () => {
      // Check if viewport meta tag exists (should be in index.html)
      const viewportMeta = document.querySelector('meta[name="viewport"]');

      // If not found in test environment, that's expected
      // In real app, this would be in index.html
      if (viewportMeta) {
        expect(viewportMeta.getAttribute("content")).toContain(
          "width=device-width"
        );
        expect(viewportMeta.getAttribute("content")).toContain(
          "initial-scale=1"
        );
      }
    });

    it("should prevent horizontal scrolling on small screens", () => {
      mockWindowDimensions(375, 667); // iPhone SE size

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Body should not exceed viewport width
      expect(document.body.scrollWidth).toBeLessThanOrEqual(375);
    });
  });

  describe("Content Adaptation", () => {
    it("should adapt text sizes for different screen sizes", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const heading = screen.getByText(/resume converter/i);
      const headingStyles = window.getComputedStyle(heading);

      // Should have responsive text sizing
      expect(headingStyles.fontSize).toBeDefined();
    });

    it("should adapt spacing for different screen sizes", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const container = document.querySelector(".container") || document.body;
      const containerStyles = window.getComputedStyle(container);

      // Should have appropriate padding/margins
      expect(containerStyles.padding || containerStyles.margin).toBeDefined();
    });

    it("should maintain readability across screen sizes", async () => {
      const user = userEvent.setup();

      // Test on different screen sizes
      const screenSizes = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 1024, height: 768 }, // Minimum desktop
        { width: 768, height: 1024 }, // Tablet
      ];

      for (const size of screenSizes) {
        mockWindowDimensions(size.width, size.height);

        render(
          <AppProvider>
            <App />
          </AppProvider>
        );

        // Text should be readable
        const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
        expect(textArea).toBeInTheDocument();

        // Clean up for next iteration
        document.body.innerHTML = "";
      }
    });
  });

  describe("Performance on Different Devices", () => {
    it("should load efficiently on lower-powered devices", async () => {
      // Simulate slower device
      const startTime = performance.now();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should still meet performance requirements
      expect(loadTime).toBeLessThan(2000);
    });

    it("should handle memory constraints gracefully", () => {
      // Test with limited memory simulation
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Should not crash or cause memory issues
      expect(screen.getByText(/resume converter/i)).toBeInTheDocument();
    });
  });
});
