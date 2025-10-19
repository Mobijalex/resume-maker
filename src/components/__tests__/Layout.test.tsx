import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Layout } from "../Layout";
import { AppProvider } from "../../context/AppContext";

// Mock the useAccessibility hook
vi.mock("../../utils/accessibility", () => ({
  useAccessibility: () => ({
    announce: vi.fn(),
  }),
}));

// Mock ProgressIndicator
vi.mock("../ProgressIndicator", () => ({
  ProgressIndicator: ({ currentStep }: { currentStep: string }) => (
    <div data-testid="progress-indicator">Progress: {currentStep}</div>
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render header with application title", () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByText("MD Resume Converter")).toBeInTheDocument();
    expect(screen.getByText("ATS-Friendly")).toBeInTheDocument();
  });

  it("should render help button with accessibility attributes", () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );

    const helpButton = screen.getByRole("button", {
      name: /get help information/i,
    });
    expect(helpButton).toBeInTheDocument();
    expect(helpButton).toHaveAttribute(
      "aria-label",
      "Get help information about using this application"
    );
    expect(helpButton).toHaveAttribute("title", "Help");
  });

  it("should render progress indicator", () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByTestId("progress-indicator")).toBeInTheDocument();
  });

  it("should render main content with proper accessibility attributes", () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="test-content">Test content</div>
        </Layout>
      </TestWrapper>
    );

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("aria-label", "Resume converter main content");
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("should render footer with privacy information", () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(
      screen.getByText(
        /Transform your Markdown resume into an ATS-friendly PDF/
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Privacy-focused")).toBeInTheDocument();
    expect(screen.getByText("Client-side processing")).toBeInTheDocument();
  });

  it("should handle help button click", () => {
    const mockAnnounce = vi.fn();
    vi.mocked(
      require("../../utils/accessibility").useAccessibility
    ).mockReturnValue({
      announce: mockAnnounce,
    });

    render(
      <TestWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestWrapper>
    );

    const helpButton = screen.getByRole("button", {
      name: /get help information/i,
    });
    fireEvent.click(helpButton);

    expect(mockAnnounce).toHaveBeenCalledWith(
      "Help information: This application converts Markdown resumes to ATS-friendly PDFs. Use the step-by-step process to upload your resume, choose a template, and download your formatted PDF."
    );
  });
});
