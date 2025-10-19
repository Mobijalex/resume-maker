import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TextInputComponent from "../TextInputComponent";
import { AppProvider } from "../../context/AppContext";

// Simple test setup
const renderWithProvider = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>);
};

describe("TextInputComponent", () => {
  it("renders with default placeholder text", () => {
    renderWithProvider(<TextInputComponent />);

    expect(
      screen.getByPlaceholderText("Paste your Markdown resume content here...")
    ).toBeInTheDocument();
    expect(screen.getByText("Direct Markdown Input")).toBeInTheDocument();
  });

  it("renders with custom placeholder text", () => {
    const customPlaceholder = "Enter your custom text here...";
    renderWithProvider(<TextInputComponent placeholder={customPlaceholder} />);

    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it("updates content when user types", () => {
    const mockOnTextChange = vi.fn();
    renderWithProvider(<TextInputComponent onTextChange={mockOnTextChange} />);

    const textarea = screen.getByTestId("markdown-textarea");
    const testContent = "# John Doe\n\n**Email:** john@example.com";

    fireEvent.change(textarea, { target: { value: testContent } });

    expect(textarea).toHaveValue(testContent);
    expect(mockOnTextChange).toHaveBeenCalledWith(testContent);
  });

  it("shows character count", () => {
    renderWithProvider(<TextInputComponent />);

    const textarea = screen.getByTestId("markdown-textarea");
    const testContent = "Test content";

    fireEvent.change(textarea, { target: { value: testContent } });

    expect(screen.getByText("12 characters")).toBeInTheDocument();
  });

  it("shows format hints when toggle is clicked", () => {
    renderWithProvider(<TextInputComponent />);

    const showHintsButton = screen.getByText("Show Format Hints");
    fireEvent.click(showHintsButton);

    expect(screen.getByText("Markdown Format Guidelines:")).toBeInTheDocument();
    expect(screen.getByText("Hide Format Hints")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "custom-text-input";
    renderWithProvider(<TextInputComponent className={customClass} />);

    const component = screen
      .getByTestId("markdown-textarea")
      .closest(".text-input-component");
    expect(component).toHaveClass(customClass);
  });

  it("handles empty content gracefully", () => {
    renderWithProvider(<TextInputComponent />);

    const textarea = screen.getByTestId("markdown-textarea");

    fireEvent.change(textarea, { target: { value: "" } });

    expect(screen.getByText("0 characters")).toBeInTheDocument();
    expect(textarea).toHaveValue("");
  });
});
