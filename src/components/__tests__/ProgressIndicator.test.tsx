import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressIndicator } from "../ProgressIndicator";
import type { AppStep } from "../../types";

describe("ProgressIndicator", () => {
  const steps: AppStep[] = [
    "upload",
    "parse",
    "template",
    "preview",
    "download",
  ];

  it("should render all steps", () => {
    render(<ProgressIndicator currentStep="upload" />);

    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Parse")).toBeInTheDocument();
    expect(screen.getByText("Template")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("should mark current step correctly", () => {
    render(<ProgressIndicator currentStep="template" />);

    const currentStepElement = screen.getByLabelText(
      /Step 3: Template - Current step/
    );
    expect(currentStepElement).toBeInTheDocument();
    expect(currentStepElement).toHaveAttribute("aria-current", "step");
  });

  it("should mark completed steps correctly", () => {
    render(<ProgressIndicator currentStep="preview" />);

    // Upload, Parse, and Template should be completed
    expect(
      screen.getByLabelText(/Step 1: Upload - Completed/)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Step 2: Parse - Completed/)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Step 3: Template - Completed/)
    ).toBeInTheDocument();

    // Preview should be current
    expect(
      screen.getByLabelText(/Step 4: Preview - Current step/)
    ).toBeInTheDocument();

    // Download should be upcoming
    expect(
      screen.getByLabelText(/Step 5: Download - Upcoming/)
    ).toBeInTheDocument();
  });

  it("should show checkmarks for completed steps", () => {
    render(<ProgressIndicator currentStep="download" />);

    // All previous steps should have checkmarks (SVG icons)
    const checkmarks = screen.getAllByRole("img", { name: /Completed/ });
    expect(checkmarks).toHaveLength(4); // upload, parse, template, preview
  });

  it("should show step numbers for upcoming steps", () => {
    render(<ProgressIndicator currentStep="upload" />);

    // Steps 2-5 should show numbers
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<ProgressIndicator currentStep="parse" />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute(
      "aria-label",
      "Resume creation progress"
    );

    const stepsList = screen.getByRole("list", { name: "Progress steps" });
    expect(stepsList).toBeInTheDocument();
  });

  it("should announce current step for screen readers", () => {
    render(<ProgressIndicator currentStep="template" />);

    const announcement = screen.getByText(
      /Step 3 of 5: Template - Choose a template/
    );
    expect(announcement).toBeInTheDocument();
    expect(announcement).toHaveClass("sr-only");
    expect(announcement).toHaveAttribute("aria-live", "polite");
    expect(announcement).toHaveAttribute("aria-atomic", "true");
  });

  it("should apply correct styling for different step states", () => {
    render(<ProgressIndicator currentStep="preview" />);

    // Completed step styling
    const completedStep = screen.getByLabelText(/Step 1: Upload - Completed/);
    expect(completedStep).toHaveClass("bg-primary-600", "text-white");

    // Current step styling
    const currentStep = screen.getByLabelText(/Step 4: Preview - Current step/);
    expect(currentStep).toHaveClass(
      "bg-primary-100",
      "text-primary-600",
      "border-2",
      "border-primary-600"
    );

    // Upcoming step styling
    const upcomingStep = screen.getByLabelText(/Step 5: Download - Upcoming/);
    expect(upcomingStep).toHaveClass("bg-gray-200", "text-gray-500");
  });

  it("should render step descriptions", () => {
    render(<ProgressIndicator currentStep="upload" />);

    expect(screen.getByText("Upload or input your resume")).toBeInTheDocument();
    expect(screen.getByText("Process your content")).toBeInTheDocument();
    expect(screen.getByText("Choose a template")).toBeInTheDocument();
    expect(screen.getByText("Review your resume")).toBeInTheDocument();
    expect(screen.getByText("Get your PDF")).toBeInTheDocument();
  });

  it("should handle edge case with first step", () => {
    render(<ProgressIndicator currentStep="upload" />);

    const currentStep = screen.getByLabelText(/Step 1: Upload - Current step/);
    expect(currentStep).toBeInTheDocument();
    expect(currentStep).toHaveAttribute("aria-current", "step");

    // No completed steps
    const checkmarks = screen.queryAllByRole("img", { name: /Completed/ });
    expect(checkmarks).toHaveLength(0);
  });

  it("should handle edge case with last step", () => {
    render(<ProgressIndicator currentStep="download" />);

    const currentStep = screen.getByLabelText(
      /Step 5: Download - Current step/
    );
    expect(currentStep).toBeInTheDocument();
    expect(currentStep).toHaveAttribute("aria-current", "step");

    // All previous steps completed
    const checkmarks = screen.getAllByRole("img", { name: /Completed/ });
    expect(checkmarks).toHaveLength(4);
  });
});
