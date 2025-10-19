import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UploadStep from "../../steps/UploadStep";
import { AppProvider } from "../../../context/AppContext";

// Mock the child components
vi.mock("../../FileUploadComponent", () => ({
  default: () => (
    <div data-testid="file-upload-component">File Upload Component</div>
  ),
}));

vi.mock("../../TextInputComponent", () => ({
  default: () => (
    <div data-testid="text-input-component">Text Input Component</div>
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe("UploadStep", () => {
  it("should render the step title and description", () => {
    render(
      <TestWrapper>
        <UploadStep />
      </TestWrapper>
    );

    expect(screen.getByText("Upload Your Resume")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Upload your Markdown resume file or paste the content directly below."
      )
    ).toBeInTheDocument();
  });

  it("should render file upload section", () => {
    render(
      <TestWrapper>
        <UploadStep />
      </TestWrapper>
    );

    expect(screen.getByText("Option 1: Upload File")).toBeInTheDocument();
    expect(screen.getByTestId("file-upload-component")).toBeInTheDocument();
  });

  it("should render text input section", () => {
    render(
      <TestWrapper>
        <UploadStep />
      </TestWrapper>
    );

    expect(screen.getByText("Option 2: Direct Input")).toBeInTheDocument();
    expect(screen.getByTestId("text-input-component")).toBeInTheDocument();
  });

  it("should render OR divider between options", () => {
    render(
      <TestWrapper>
        <UploadStep />
      </TestWrapper>
    );

    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("should not show status indicator when no file or content is present", () => {
    render(
      <TestWrapper>
        <UploadStep />
      </TestWrapper>
    );

    expect(screen.queryByText(/File uploaded:/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Direct input content ready")
    ).not.toBeInTheDocument();
  });

  // Note: Testing the status indicator with file/content would require mocking the context state
  // This would be covered in integration tests
});
