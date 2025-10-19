/**
 * Tests for TemplateSelector component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TemplateSelector from "../TemplateSelector";
import type { ResumeData } from "../../types";

// Mock the templates module
vi.mock("../../templates", () => ({
  templates: [
    {
      id: "professional",
      name: "Professional",
      description:
        "Clean, traditional layout with clear sections and ATS-friendly formatting",
      atsOptimized: true,
      layout: {
        margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
        spacing: { sectionGap: 16, itemGap: 8, lineHeight: 1.4 },
        columns: { enabled: false },
      },
      styling: {
        fonts: { primary: "Arial", fallback: ["Helvetica", "sans-serif"] },
        colors: { primary: "#000000", secondary: "#333333", text: "#000000" },
        sizes: {
          headerFont: 16,
          subHeaderFont: 14,
          bodyFont: 11,
          smallFont: 10,
        },
        formatting: {
          boldHeaders: true,
          underlineHeaders: false,
          italicEmphasis: false,
        },
      },
    },
    {
      id: "modern",
      name: "Modern",
      description:
        "Contemporary design with subtle styling and optimized spacing for readability",
      atsOptimized: true,
      layout: {
        margins: { top: 0.8, bottom: 0.8, left: 0.8, right: 0.8 },
        spacing: { sectionGap: 18, itemGap: 10, lineHeight: 1.5 },
        columns: { enabled: false },
      },
      styling: {
        fonts: {
          primary: "Calibri",
          secondary: "Arial",
          fallback: ["Helvetica", "sans-serif"],
        },
        colors: {
          primary: "#2c3e50",
          secondary: "#34495e",
          text: "#2c3e50",
          accent: "#3498db",
        },
        sizes: {
          headerFont: 18,
          subHeaderFont: 15,
          bodyFont: 11,
          smallFont: 10,
        },
        formatting: {
          boldHeaders: true,
          underlineHeaders: false,
          italicEmphasis: true,
        },
      },
    },
  ],
}));

// Mock the template renderer
vi.mock("../../templates/templateRenderer", () => ({
  templateRenderer: {
    renderPreview: vi.fn(() => '<div class="mock-preview">Mock Preview</div>'),
  },
}));

describe("TemplateSelector", () => {
  const mockOnTemplateSelect = vi.fn();
  const sampleResumeData: ResumeData = {
    personalInfo: {
      fullName: "John Doe",
      email: "john.doe@email.com",
      phone: "(555) 123-4567",
      location: "New York, NY",
    },
    summary: "Test summary",
    experience: [],
    education: [],
    skills: { technical: ["JavaScript"] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render template selector with title and description", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      expect(screen.getByText("Choose Your Template")).toBeInTheDocument();
      expect(
        screen.getByText(/Select a professional template for your resume/)
      ).toBeInTheDocument();
    });

    it("should render all available templates", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      expect(screen.getByText("Professional")).toBeInTheDocument();
      expect(screen.getByText("Modern")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Clean, traditional layout with clear sections and ATS-friendly formatting"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Contemporary design with subtle styling and optimized spacing for readability"
        )
      ).toBeInTheDocument();
    });

    it("should show ATS Optimized badges for all templates", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      const atsOptimizedBadges = screen.getAllByText("ATS Optimized");
      expect(atsOptimizedBadges).toHaveLength(2);
    });

    it("should render ATS information section", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      expect(screen.getByText("ATS-Friendly Design")).toBeInTheDocument();
      expect(
        screen.getByText(/All templates use standard fonts/)
      ).toBeInTheDocument();
    });
  });

  describe("template selection", () => {
    it("should highlight selected template", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      const professionalTemplate = screen
        .getByText("Professional")
        .closest(".template-preview-container");
      const modernTemplate = screen
        .getByText("Modern")
        .closest(".template-preview-container");

      expect(professionalTemplate).toHaveClass(
        "ring-2",
        "ring-blue-500",
        "bg-blue-50"
      );
      expect(modernTemplate).not.toHaveClass(
        "ring-2",
        "ring-blue-500",
        "bg-blue-50"
      );
    });

    it("should show checkmark for selected template", () => {
      render(
        <TemplateSelector
          selectedTemplateId="modern"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      const modernTemplate = screen
        .getByText("Modern")
        .closest(".template-preview-container");
      const checkmark = modernTemplate?.querySelector("svg");

      expect(checkmark).toBeInTheDocument();
      expect(checkmark?.closest("div")).toHaveClass("bg-blue-500");
    });

    it("should call onTemplateSelect when template is clicked", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      const modernTemplate = screen
        .getByText("Modern")
        .closest(".template-preview-container");
      fireEvent.click(modernTemplate!);

      expect(mockOnTemplateSelect).toHaveBeenCalledWith("modern");
    });

    it("should call onTemplateSelect when different template is clicked", () => {
      render(
        <TemplateSelector
          selectedTemplateId="modern"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      const professionalTemplate = screen
        .getByText("Professional")
        .closest(".template-preview-container");
      fireEvent.click(professionalTemplate!);

      expect(mockOnTemplateSelect).toHaveBeenCalledWith("professional");
    });
  });

  describe("template previews", () => {
    it("should render template previews", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
          resumeData={sampleResumeData}
        />
      );

      const previews = screen.getAllByText("Mock Preview");
      expect(previews).toHaveLength(2);
    });

    it("should use sample data when no resume data provided", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      // Should still render previews with sample data
      const previews = screen.getAllByText("Mock Preview");
      expect(previews).toHaveLength(2);
    });
  });

  describe("responsive design", () => {
    it("should apply grid layout classes", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      const gridContainer = screen.getByText("Professional").closest(".grid");
      expect(gridContainer).toHaveClass(
        "grid-cols-1",
        "lg:grid-cols-2",
        "gap-6"
      );
    });

    it("should apply custom className when provided", () => {
      const { container } = render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
          className="custom-class"
        />
      );

      const templateSelector = container.querySelector(".template-selector");
      expect(templateSelector).toHaveClass("custom-class");
    });
  });

  describe("hover effects", () => {
    it("should apply hover classes to non-selected templates", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      const modernTemplate = screen
        .getByText("Modern")
        .closest(".template-preview-container");
      expect(modernTemplate).toHaveClass(
        "hover:ring-1",
        "hover:ring-gray-300",
        "hover:bg-gray-50"
      );
    });
  });

  describe("accessibility", () => {
    it("should have clickable template containers", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      const templates = screen.getAllByRole("generic");
      const clickableTemplates = templates.filter((el) =>
        el.classList.contains("cursor-pointer")
      );
      expect(clickableTemplates.length).toBeGreaterThan(0);
    });

    it("should have proper heading structure", () => {
      render(
        <TemplateSelector
          selectedTemplateId="professional"
          onTemplateSelect={mockOnTemplateSelect}
        />
      );

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Choose Your Template"
      );
      expect(screen.getByText("ATS-Friendly Design")).toBeInTheDocument();

      // Check that template names are rendered as h3 elements
      const templateHeadings = screen.getAllByRole("heading", { level: 3 });
      expect(templateHeadings).toHaveLength(3); // Professional, Modern, and ATS-Friendly Design

      const templateNames = templateHeadings.map((h) => h.textContent);
      expect(templateNames).toContain("Professional");
      expect(templateNames).toContain("Modern");
      expect(templateNames).toContain("ATS-Friendly Design");
    });
  });
});
