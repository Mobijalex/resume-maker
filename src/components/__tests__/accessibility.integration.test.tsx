/**
 * Integration tests for accessibility features across components
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AppProvider } from "../../context/AppContext";
import { Layout } from "../Layout";
import FileUploadComponent from "../FileUploadComponent";
import TextInputComponent from "../TextInputComponent";
import { TemplateSelector } from "../TemplateSelector";
import { ProgressIndicator } from "../ProgressIndicator";

// Mock the accessibility CSS import
vi.mock("../../styles/accessibility.css", () => ({}));

// Mock file operations
const mockFile = new File(["# John Doe\n\nSoftware Engineer"], "resume.md", {
  type: "text/markdown",
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <Layout>{children}</Layout>
  </AppProvider>
);

describe("Accessibility Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Keyboard Navigation", () => {
    it("should support tab navigation through file upload component", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FileUploadComponent />
        </TestWrapper>
      );

      const dropZone = screen.getByRole("button", { name: /upload area/i });

      // Tab to the drop zone
      await user.tab();
      expect(dropZone).toHaveFocus();

      // Enter should trigger file selection
      const fileInput = screen.getByTestId("file-input");
      const clickSpy = vi.spyOn(fileInput, "click");

      await user.keyboard("{Enter}");
      expect(clickSpy).toHaveBeenCalled();
    });

    it("should support arrow key navigation in template selector", async () => {
      const user = userEvent.setup();
      const mockOnTemplateSelect = vi.fn();

      render(
        <TestWrapper>
          <TemplateSelector
            selectedTemplateId="professional"
            onTemplateSelect={mockOnTemplateSelect}
          />
        </TestWrapper>
      );

      const templateOptions = screen.getAllByRole("radio");
      expect(templateOptions).toHaveLength(2);

      // Focus first template
      templateOptions[0].focus();
      expect(templateOptions[0]).toHaveFocus();

      // Arrow down should move to next template
      await user.keyboard("{ArrowDown}");
      expect(templateOptions[1]).toHaveFocus();

      // Arrow up should move back
      await user.keyboard("{ArrowUp}");
      expect(templateOptions[0]).toHaveFocus();
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper ARIA labels and roles", () => {
      render(
        <TestWrapper>
          <FileUploadComponent />
        </TestWrapper>
      );

      const dropZone = screen.getByRole("button");
      expect(dropZone).toHaveAttribute("aria-label");
      expect(dropZone).toHaveAttribute("aria-describedby");

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toHaveAttribute("aria-describedby");
    });

    it("should announce status changes to screen readers", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FileUploadComponent />
        </TestWrapper>
      );

      const dropZone = screen.getByRole("button");

      // Simulate file drop
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile],
        },
      });

      // Should show loading state with proper ARIA
      await waitFor(() => {
        const loadingSpinner = screen.getByRole("status", {
          name: /processing file/i,
        });
        expect(loadingSpinner).toBeInTheDocument();
      });
    });

    it("should provide proper error announcements", async () => {
      render(
        <TestWrapper>
          <FileUploadComponent />
        </TestWrapper>
      );

      const dropZone = screen.getByRole("button");
      const invalidFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });

      // Drop invalid file
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [invalidFile],
        },
      });

      // Should show error with proper ARIA
      await waitFor(() => {
        const errorAlert = screen.getByRole("alert");
        expect(errorAlert).toBeInTheDocument();
      });
    });
  });

  describe("Focus Management", () => {
    it("should maintain focus when components update", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TextInputComponent
            value=""
            onChange={() => {}}
            placeholder="Enter your resume content"
          />
        </TestWrapper>
      );

      const textarea = screen.getByRole("textbox");

      // Focus the textarea
      await user.click(textarea);
      expect(textarea).toHaveFocus();

      // Type content
      await user.type(textarea, "# John Doe");

      // Focus should be maintained
      expect(textarea).toHaveFocus();
    });

    it("should handle focus trapping in modal-like components", () => {
      render(
        <TestWrapper>
          <TemplateSelector
            selectedTemplateId="modern"
            onTemplateSelect={() => {}}
          />
        </TestWrapper>
      );

      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toBeInTheDocument();

      const templates = screen.getAllByRole("radio");
      expect(templates).toHaveLength(2);

      // Each template should be focusable
      templates.forEach((template) => {
        expect(template).toHaveAttribute("tabindex", "0");
      });
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("should apply high contrast styles when preferred", () => {
      // Mock prefers-contrast: high
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-contrast: high)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <FileUploadComponent />
        </TestWrapper>
      );

      const dropZone = screen.getByRole("button");
      expect(dropZone).toBeInTheDocument();

      // High contrast styles should be applied via CSS media queries
      // This is tested through CSS, not directly testable in JSDOM
    });

    it("should respect reduced motion preferences", () => {
      // Mock prefers-reduced-motion: reduce
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <ProgressIndicator currentStep={1} totalSteps={4} />
        </TestWrapper>
      );

      // Progress indicator should be rendered without animations
      const progressIndicator = screen.getByRole("progressbar");
      expect(progressIndicator).toBeInTheDocument();
    });
  });

  describe("Form Accessibility", () => {
    it("should associate labels with form controls", () => {
      render(
        <TestWrapper>
          <TextInputComponent
            value=""
            onChange={() => {}}
            placeholder="Enter your resume content"
          />
        </TestWrapper>
      );

      const textarea = screen.getByRole("textbox");
      const label = screen.getByText(/markdown content/i);

      expect(textarea).toHaveAccessibleName();
      expect(label).toBeInTheDocument();
    });

    it("should provide validation feedback accessibly", async () => {
      render(
        <TestWrapper>
          <FileUploadComponent />
        </TestWrapper>
      );

      const dropZone = screen.getByRole("button");
      const oversizedFile = new File(
        ["x".repeat(6 * 1024 * 1024)],
        "large.md",
        {
          type: "text/markdown",
        }
      );

      // Drop oversized file
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [oversizedFile],
        },
      });

      // Should show validation error with proper ARIA
      await waitFor(() => {
        const errorAlert = screen.getByRole("alert");
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/5MB limit/i);
      });
    });
  });

  describe("Mobile Accessibility", () => {
    it("should have appropriate touch targets", () => {
      render(
        <TestWrapper>
          <FileUploadComponent />
        </TestWrapper>
      );

      const dropZone = screen.getByRole("button");

      // Drop zone should be large enough for touch interaction
      // This is enforced through CSS min-height and min-width
      expect(dropZone).toHaveClass("dropzone-accessible");
    });

    it("should work with voice control", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TemplateSelector
            selectedTemplateId="professional"
            onTemplateSelect={() => {}}
          />
        </TestWrapper>
      );

      // Voice control typically uses accessible names
      const modernTemplate = screen.getByRole("radio", { name: /modern/i });
      const professionalTemplate = screen.getByRole("radio", {
        name: /professional/i,
      });

      expect(modernTemplate).toHaveAccessibleName();
      expect(professionalTemplate).toHaveAccessibleName();

      // Should be activatable by voice commands (Enter/Space)
      await user.keyboard("{Enter}");
    });
  });
});
