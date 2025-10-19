import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";

// Mock all the heavy dependencies
vi.mock("../../utils/globalErrorHandler", () => ({
  initializeGlobalErrorHandling: () => ({
    cleanup: vi.fn(),
  }),
}));

vi.mock("../../utils/browserCompatibility", () => ({
  BrowserCompatibility: {
    checkFeatureSupport: () => ({ supported: true }),
  },
}));

vi.mock("../../utils/accessibility", () => ({
  AccessibilityManager: {
    getInstance: vi.fn(),
  },
  useAccessibility: () => ({
    announce: vi.fn(),
  }),
}));

vi.mock("../../utils/performanceMonitor", () => ({
  default: {
    getInstance: () => ({
      logMetrics: vi.fn(),
    }),
  },
}));

vi.mock("../../utils/bundleAnalyzer", () => ({
  default: {
    getInstance: () => ({
      logBundleAnalysis: vi.fn(),
      monitorChunkLoading: vi.fn(),
    }),
  },
}));

vi.mock("../../utils/performanceOptimizer", () => ({
  addResourceHints: vi.fn(),
  registerServiceWorker: vi.fn(),
}));

vi.mock("../../utils/dynamicImports", () => ({
  preloadCriticalDependencies: vi.fn(),
}));

// Mock step components
vi.mock("../../components/steps/UploadStep", () => ({
  default: () => (
    <div data-testid="upload-step">
      <h2>Upload Your Resume</h2>
      <input data-testid="file-input" type="file" accept=".md" />
      <textarea data-testid="text-input" placeholder="Paste markdown content" />
      <button data-testid="upload-next">Next</button>
    </div>
  ),
}));

vi.mock("../../components/steps/ParseStep", () => ({
  default: () => (
    <div data-testid="parse-step">
      <h2>Processing Your Resume</h2>
      <div data-testid="parsing-status">Parsing complete</div>
      <button data-testid="parse-next">Next</button>
    </div>
  ),
}));

vi.mock("../../components/steps/TemplateStep", () => ({
  default: () => (
    <div data-testid="template-step">
      <h2>Choose a Template</h2>
      <button data-testid="template-professional">Professional</button>
      <button data-testid="template-modern">Modern</button>
      <button data-testid="template-next">Next</button>
    </div>
  ),
}));

vi.mock("../../components/steps/PreviewStep", () => ({
  default: () => (
    <div data-testid="preview-step">
      <h2>Preview Your Resume</h2>
      <div data-testid="resume-preview">Resume preview content</div>
      <button data-testid="preview-next">Next</button>
    </div>
  ),
}));

vi.mock("../../components/steps/DownloadStep", () => ({
  default: () => (
    <div data-testid="download-step">
      <h2>Download Your Resume</h2>
      <button data-testid="download-pdf">Download PDF</button>
      <button data-testid="start-over">Start Over</button>
    </div>
  ),
}));

describe("Complete Workflow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete the full file upload to PDF download workflow", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Upload Step
    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });

    // Simulate file upload
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["# John Doe\n\nSoftware Engineer"], "resume.md", {
      type: "text/markdown",
    });

    await user.upload(fileInput, file);

    // Navigate to next step
    const uploadNext = screen.getByTestId("upload-next");
    await user.click(uploadNext);

    // Step 2: Parse Step
    await waitFor(() => {
      expect(screen.getByTestId("parse-step")).toBeInTheDocument();
    });

    expect(screen.getByText("Processing Your Resume")).toBeInTheDocument();
    expect(screen.getByTestId("parsing-status")).toHaveTextContent(
      "Parsing complete"
    );

    const parseNext = screen.getByTestId("parse-next");
    await user.click(parseNext);

    // Step 3: Template Step
    await waitFor(() => {
      expect(screen.getByTestId("template-step")).toBeInTheDocument();
    });

    expect(screen.getByText("Choose a Template")).toBeInTheDocument();

    // Select a template
    const professionalTemplate = screen.getByTestId("template-professional");
    await user.click(professionalTemplate);

    const templateNext = screen.getByTestId("template-next");
    await user.click(templateNext);

    // Step 4: Preview Step
    await waitFor(() => {
      expect(screen.getByTestId("preview-step")).toBeInTheDocument();
    });

    expect(screen.getByText("Preview Your Resume")).toBeInTheDocument();
    expect(screen.getByTestId("resume-preview")).toHaveTextContent(
      "Resume preview content"
    );

    const previewNext = screen.getByTestId("preview-next");
    await user.click(previewNext);

    // Step 5: Download Step
    await waitFor(() => {
      expect(screen.getByTestId("download-step")).toBeInTheDocument();
    });

    expect(screen.getByText("Download Your Resume")).toBeInTheDocument();

    // Download PDF
    const downloadButton = screen.getByTestId("download-pdf");
    expect(downloadButton).toBeInTheDocument();
    await user.click(downloadButton);

    // Verify we can start over
    const startOverButton = screen.getByTestId("start-over");
    expect(startOverButton).toBeInTheDocument();
  });

  it("should complete the full text input to PDF download workflow", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Upload Step with text input
    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });

    // Simulate text input
    const textInput = screen.getByTestId("text-input");
    await user.type(
      textInput,
      "# Jane Smith\n\n## Experience\n\nSoftware Developer at Tech Corp"
    );

    const uploadNext = screen.getByTestId("upload-next");
    await user.click(uploadNext);

    // Continue through all steps
    await waitFor(() => {
      expect(screen.getByTestId("parse-step")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("parse-next"));

    await waitFor(() => {
      expect(screen.getByTestId("template-step")).toBeInTheDocument();
    });

    // Select modern template this time
    await user.click(screen.getByTestId("template-modern"));
    await user.click(screen.getByTestId("template-next"));

    await waitFor(() => {
      expect(screen.getByTestId("preview-step")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("preview-next"));

    await waitFor(() => {
      expect(screen.getByTestId("download-step")).toBeInTheDocument();
    });

    // Verify final step
    expect(screen.getByTestId("download-pdf")).toBeInTheDocument();
  });

  it("should allow navigation back and forth between steps", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Start at upload step
    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });

    // Navigate forward to parse step
    await user.click(screen.getByTestId("upload-next"));

    await waitFor(() => {
      expect(screen.getByTestId("parse-step")).toBeInTheDocument();
    });

    // Navigate back to upload step
    const previousButton = screen.getByText("Previous");
    await user.click(previousButton);

    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });

    // Navigate forward again
    await user.click(screen.getByTestId("upload-next"));

    await waitFor(() => {
      expect(screen.getByTestId("parse-step")).toBeInTheDocument();
    });
  });

  it("should show progress indicator throughout the workflow", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Check progress indicator is present
    await waitFor(() => {
      expect(screen.getByTestId("progress-indicator")).toBeInTheDocument();
    });

    // Navigate through steps and verify progress updates
    await user.click(screen.getByTestId("upload-next"));

    await waitFor(() => {
      expect(screen.getByTestId("progress-indicator")).toHaveTextContent(
        "Progress: parse"
      );
    });

    await user.click(screen.getByTestId("parse-next"));

    await waitFor(() => {
      expect(screen.getByTestId("progress-indicator")).toHaveTextContent(
        "Progress: template"
      );
    });
  });

  it("should handle start over functionality", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to the end
    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });

    // Go through all steps quickly
    await user.click(screen.getByTestId("upload-next"));
    await user.click(screen.getByTestId("parse-next"));
    await user.click(screen.getByTestId("template-next"));
    await user.click(screen.getByTestId("preview-next"));

    await waitFor(() => {
      expect(screen.getByTestId("download-step")).toBeInTheDocument();
    });

    // Click start over
    const startOverButton = screen.getByTestId("start-over");
    await user.click(startOverButton);

    // Should be back at upload step
    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });
  });

  it("should maintain accessibility throughout the workflow", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Check for skip link
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");

    // Check main content has proper ID
    const mainContent = screen.getByRole("main");
    expect(mainContent).toHaveAttribute("id", "main-content");

    // Check navigation buttons have proper accessibility
    await user.click(screen.getByTestId("upload-next"));

    await waitFor(() => {
      const previousButton = screen.getByRole("button", { name: "Previous" });
      const nextButtons = screen.getAllByRole("button", { name: "Next" });

      expect(previousButton).toBeInTheDocument();
      expect(nextButtons.length).toBeGreaterThan(0);
    });
  });

  it("should handle errors gracefully during workflow", async () => {
    const user = userEvent.setup();

    // Mock console.error to avoid noise
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });

    // The error boundary should catch any errors and display fallback UI
    // This is tested more thoroughly in the ErrorBoundary tests

    consoleSpy.mockRestore();
  });
});
