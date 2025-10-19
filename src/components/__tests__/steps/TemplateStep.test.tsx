import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TemplateStep from "../../steps/TemplateStep";

// Mock the lazy-loaded TemplateSelector
vi.mock("../../TemplateSelector", () => ({
  default: () => <div data-testid="template-selector">Template Selector</div>,
}));

describe("TemplateStep", () => {
  it("should render the step title and description", () => {
    render(<TemplateStep />);

    expect(screen.getByText("Choose a Template")).toBeInTheDocument();
    expect(
      screen.getByText("Select a professional template for your resume.")
    ).toBeInTheDocument();
  });

  it("should render placeholder content", () => {
    render(<TemplateStep />);

    expect(
      screen.getByText("Template selector will be implemented in task 8")
    ).toBeInTheDocument();
  });

  it("should have proper structure and styling", () => {
    render(<TemplateStep />);

    const container = screen.getByText("Choose a Template").closest("div");
    expect(container).toHaveClass("p-8", "text-center");

    const placeholderContainer = screen
      .getByText("Template selector will be implemented in task 8")
      .closest("div");
    expect(placeholderContainer).toHaveClass(
      "bg-gray-100",
      "rounded-lg",
      "p-12"
    );
  });
});
