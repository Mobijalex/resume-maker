import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AppProvider } from "../../../context/AppContext";
import ParseStep from "../../steps/ParseStep";

// Mock the MarkdownParser
vi.mock("../../../utils/MarkdownParser", () => ({
  MarkdownParser: vi.fn().mockImplementation(() => ({
    validateStructure: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
    parseMarkdown: vi.fn().mockResolvedValue({
      personalInfo: { fullName: "Test User", email: "test@example.com" },
      summary: "Test summary",
      experience: [],
      education: [],
      skills: { technical: [] },
    }),
  })),
}));

const renderWithProvider = (ui: React.ReactElement, initialState = {}) => {
  return render(<AppProvider>{ui}</AppProvider>);
};

describe("ParseStep", () => {
  it("should render the step title and description", () => {
    renderWithProvider(<ParseStep />);

    expect(screen.getByText("Processing Your Resume")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're parsing your Markdown content and extracting the resume data."
      )
    ).toBeInTheDocument();
  });

  it("should show no content message when no markdown content is available", () => {
    renderWithProvider(<ParseStep />);

    expect(screen.getByText("No Content to Parse")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Please upload a file or enter markdown content before proceeding."
      )
    ).toBeInTheDocument();
  });

  it("should have proper structure and styling", () => {
    renderWithProvider(<ParseStep />);

    const container = screen.getByText("Processing Your Resume").closest("div");
    expect(container).toHaveClass("p-8", "text-center");
  });

  it("should show back to upload button when no content", () => {
    renderWithProvider(<ParseStep />);

    const backButton = screen.getByTestId("go-back-to-upload");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent("Back to Upload");
  });
});
