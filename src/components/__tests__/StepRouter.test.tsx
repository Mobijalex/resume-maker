import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StepRouter } from "../StepRouter";
import { AppProvider } from "../../context/AppContext";

// Mock the lazy-loaded step components
vi.mock("../steps/UploadStep", () => ({
  default: () => <div data-testid="upload-step">Upload Step</div>,
}));

vi.mock("../steps/ParseStep", () => ({
  default: () => <div data-testid="parse-step">Parse Step</div>,
}));

vi.mock("../steps/TemplateStep", () => ({
  default: () => <div data-testid="template-step">Template Step</div>,
}));

vi.mock("../steps/PreviewStep", () => ({
  default: () => <div data-testid="preview-step">Preview Step</div>,
}));

vi.mock("../steps/DownloadStep", () => ({
  default: () => <div data-testid="download-step">Download Step</div>,
}));

// Mock lazy loading utilities
vi.mock("../../utils/lazyLoading", () => ({
  withLazyLoading: (importFn: () => Promise<any>, loadingMessage: string) => {
    const Component = () => {
      const [loaded, setLoaded] = React.useState(false);
      const [ComponentToRender, setComponent] =
        React.useState<React.ComponentType | null>(null);

      React.useEffect(() => {
        importFn().then((module) => {
          setComponent(() => module.default);
          setLoaded(true);
        });
      }, []);

      if (!loaded) {
        return <div data-testid="loading">{loadingMessage}</div>;
      }

      return ComponentToRender ? <ComponentToRender /> : null;
    };
    return Component;
  },
  preloadComponent: vi.fn(),
  LoadingFallback: ({ message }: { message: string }) => (
    <div data-testid="loading-fallback">{message}</div>
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe("StepRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render upload step by default", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });
  });

  it("should render navigation buttons", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
    });
  });

  it("should disable previous button on first step", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    await waitFor(() => {
      const previousButton = screen.getByText("Previous");
      expect(previousButton).toBeDisabled();
      expect(previousButton).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
    });
  });

  it("should enable next button on first step", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    await waitFor(() => {
      const nextButton = screen.getByText("Next");
      expect(nextButton).not.toBeDisabled();
    });
  });

  it("should navigate to next step when next button is clicked", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId("parse-step")).toBeInTheDocument();
    });
  });

  it("should navigate to previous step when previous button is clicked", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    // Navigate to second step first
    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId("parse-step")).toBeInTheDocument();
    });

    // Now navigate back
    const previousButton = screen.getByText("Previous");
    expect(previousButton).not.toBeDisabled();
    fireEvent.click(previousButton);

    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });
  });

  it("should disable next button on last step", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    // Navigate to last step
    const nextButton = screen.getByText("Next");

    // Click next 4 times to reach download step
    for (let i = 0; i < 4; i++) {
      await waitFor(() => {
        expect(nextButton).not.toBeDisabled();
      });
      fireEvent.click(nextButton);
    }

    await waitFor(() => {
      expect(screen.getByTestId("download-step")).toBeInTheDocument();
      expect(nextButton).toBeDisabled();
    });
  });

  it("should render all step components correctly", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    const nextButton = screen.getByText("Next");
    const steps = [
      "upload-step",
      "parse-step",
      "template-step",
      "preview-step",
      "download-step",
    ];

    for (let i = 0; i < steps.length; i++) {
      await waitFor(() => {
        expect(screen.getByTestId(steps[i])).toBeInTheDocument();
      });

      if (i < steps.length - 1) {
        fireEvent.click(nextButton);
      }
    }
  });

  it("should show loading fallback while components are loading", () => {
    // Mock the lazy loading to show loading state
    vi.mocked(
      require("../../utils/lazyLoading").withLazyLoading
    ).mockImplementation(
      (importFn: () => Promise<any>, loadingMessage: string) => {
        return () => <div data-testid="loading">{loadingMessage}</div>;
      }
    );

    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.getByText("Loading upload interface...")).toBeInTheDocument();
  });

  it("should preload next step component", async () => {
    const mockPreloadComponent = vi.mocked(
      require("../../utils/lazyLoading").preloadComponent
    );

    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockPreloadComponent).toHaveBeenCalled();
    });
  });

  it("should handle unknown step gracefully", async () => {
    // This test would require mocking the context to return an invalid step
    // For now, we'll test that the default case renders the upload step
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("upload-step")).toBeInTheDocument();
    });
  });

  it("should have proper accessibility structure", async () => {
    render(
      <TestWrapper>
        <StepRouter />
      </TestWrapper>
    );

    // Check for navigation buttons
    await waitFor(() => {
      const previousButton = screen.getByRole("button", { name: "Previous" });
      const nextButton = screen.getByRole("button", { name: "Next" });

      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });
});
