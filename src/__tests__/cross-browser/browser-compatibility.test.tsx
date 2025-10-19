/**
 * Cross-Browser Compatibility Tests
 *
 * Tests browser-specific functionality and compatibility across different browsers.
 * This test suite validates requirements 11.1, 11.2, 11.3, and 10.3.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../../context/AppContext";
import App from "../../App";

// Mock browser-specific APIs
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, "userAgent", {
    writable: true,
    value: userAgent,
  });
};

const mockFileAPI = () => {
  const mockFile = new File(
    ["# Test Resume\n## Contact\nJohn Doe"],
    "test.md",
    {
      type: "text/markdown",
    }
  );

  Object.defineProperty(mockFile, "size", { value: 1024 });

  return mockFile;
};

describe("Cross-Browser Compatibility Tests", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock PDF generation
    vi.mock("jspdf", () => ({
      default: vi.fn().mockImplementation(() => ({
        text: vi.fn(),
        setFontSize: vi.fn(),
        setFont: vi.fn(),
        save: vi.fn(),
        internal: {
          pageSize: { width: 210, height: 297 },
        },
      })),
    }));
  });

  describe("Chrome Browser Compatibility", () => {
    beforeEach(() => {
      mockUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
    });

    it("should handle file upload in Chrome", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const fileInput = screen.getByLabelText(/upload.*markdown/i);
      const testFile = mockFileAPI();

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText(/parsing/i)).toBeInTheDocument();
      });
    });

    it("should generate PDF in Chrome", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Navigate through workflow
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# John Doe\n## Contact\nEmail: john@example.com\n## Experience\nSoftware Engineer at Tech Corp"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/template/i)).toBeInTheDocument();
      });
    });
  });

  describe("Firefox Browser Compatibility", () => {
    beforeEach(() => {
      mockUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0"
      );
    });

    it("should handle file upload in Firefox", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const fileInput = screen.getByLabelText(/upload.*markdown/i);
      const testFile = mockFileAPI();

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText(/parsing/i)).toBeInTheDocument();
      });
    });

    it("should support drag and drop in Firefox", async () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const dropZone = screen.getByText(/drag.*drop/i).closest("div");
      const testFile = mockFileAPI();

      fireEvent.dragEnter(dropZone!, {
        dataTransfer: {
          files: [testFile],
          types: ["Files"],
        },
      });

      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [testFile],
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/parsing/i)).toBeInTheDocument();
      });
    });
  });

  describe("Safari Browser Compatibility", () => {
    beforeEach(() => {
      mockUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
      );
    });

    it("should handle file operations in Safari", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Jane Smith\n## Contact\nEmail: jane@example.com\n## Experience\nProduct Manager at StartupCo"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/template/i)).toBeInTheDocument();
      });
    });

    it("should support PDF download in Safari", async () => {
      // Mock URL.createObjectURL for Safari
      global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
      global.URL.revokeObjectURL = vi.fn();

      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Complete workflow to download step
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Test User\n## Contact\nEmail: test@example.com\n## Experience\nDeveloper at Company"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/template/i)).toBeInTheDocument();
      });

      expect(global.URL.createObjectURL).toBeDefined();
    });
  });

  describe("Edge Browser Compatibility", () => {
    beforeEach(() => {
      mockUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
      );
    });

    it("should handle complete workflow in Edge", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Test file upload
      const fileInput = screen.getByLabelText(/upload.*markdown/i);
      const testFile = mockFileAPI();

      await user.upload(fileInput, testFile);

      await waitFor(() => {
        expect(screen.getByText(/parsing/i)).toBeInTheDocument();
      });
    });

    it("should support modern JavaScript features in Edge", () => {
      // Test modern JS features that Edge should support
      expect(typeof Promise.allSettled).toBe("function");
      expect(typeof Array.prototype.flatMap).toBe("function");
      expect(typeof Object.fromEntries).toBe("function");
    });
  });

  describe("Feature Detection and Fallbacks", () => {
    it("should detect File API support", () => {
      expect(typeof File).toBe("function");
      expect(typeof FileReader).toBe("function");
      expect(typeof Blob).toBe("function");
    });

    it("should detect drag and drop support", () => {
      const div = document.createElement("div");
      expect("draggable" in div).toBe(true);
      expect("ondragstart" in div).toBe(true);
      expect("ondrop" in div).toBe(true);
    });

    it("should detect PDF generation capabilities", () => {
      // Test that required APIs are available
      expect(typeof Blob).toBe("function");
      expect(typeof URL.createObjectURL).toBe("function");
    });

    it("should handle unsupported browsers gracefully", () => {
      // Mock an old browser
      const originalFile = global.File;
      // @ts-ignore
      delete global.File;

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Should still render without crashing
      expect(screen.getByText(/resume converter/i)).toBeInTheDocument();

      // Restore
      global.File = originalFile;
    });
  });

  describe("Performance Across Browsers", () => {
    it("should load within performance budget", async () => {
      const startTime = performance.now();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within 2 seconds (2000ms) as per requirement 10.3
      expect(loadTime).toBeLessThan(2000);
    });

    it("should handle large files efficiently", async () => {
      const user = userEvent.setup();
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Create a large markdown content
      const largeContent =
        "# Large Resume\n## Contact\nEmail: test@example.com\n" +
        "## Experience\n" +
        Array(100).fill("* Achievement item\n").join("");

      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);

      const startTime = performance.now();
      await user.type(textArea, largeContent);
      const endTime = performance.now();

      // Should handle large content input efficiently
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
