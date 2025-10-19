/**
 * Tests for ResumePreview component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ResumePreview } from "../ResumePreview";
import { AppProvider } from "../../context/AppContext";
import { templateRenderer } from "../../templates/templateRenderer";
import { getTemplateById } from "../../templates/templateRegistry";
import type { ResumeData, Template } from "../../types";

// Mock dependencies
vi.mock("../../templates/templateRenderer");
vi.mock("../../templates/templateRegistry");

const mockTemplateRenderer = vi.mocked(templateRenderer);
const mockGetTemplateById = vi.mocked(getTemplateById);

// Test data
const mockResumeData: ResumeData = {
  personalInfo: {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    location: "New York, NY",
    linkedin: "https://linkedin.com/in/johndoe",
    website: "https://johndoe.dev",
  },
  summary: "Experienced software developer with 5+ years of experience.",
  experience: [
    {
      jobTitle: "Senior Software Engineer",
      company: "Tech Corp",
      duration: "2020 - Present",
      accomplishments: [
        "Led development of microservices architecture",
        "Improved system performance by 40%",
      ],
      isCurrentRole: true,
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of Technology",
      graduationDate: "2018",
      gpa: "3.8",
    },
  ],
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Node.js"],
    languages: ["English", "Spanish"],
    soft: ["Leadership", "Communication"],
  },
};

const mockTemplate: Template = {
  id: "professional",
  name: "Professional",
  description: "A clean, professional template",
  layout: {
    margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
    spacing: { sectionGap: 12, itemGap: 8, lineHeight: 1.4 },
    columns: { enabled: false },
  },
  styling: {
    fonts: { primary: "Arial", fallback: ["sans-serif"] },
    colors: { primary: "#000000", secondary: "#666666", text: "#333333" },
    sizes: { headerFont: 16, subHeaderFont: 14, bodyFont: 11, smallFont: 10 },
    formatting: {
      boldHeaders: true,
      underlineHeaders: false,
      italicEmphasis: true,
    },
  },
  atsOptimized: true,
};

const mockPreviewHTML = `
  <style>/* mock styles */</style>
  <div class="resume-container preview">
    <div class="personal-info">
      <div class="name">John Doe</div>
      <div class="contact-info">john.doe@example.com • (555) 123-4567</div>
    </div>
  </div>
`;

// Helper function to render component with context
const renderWithContext = (
  component: React.ReactElement,
  initialState = {}
) => {
  return render(<AppProvider>{component}</AppProvider>);
};

describe("ResumePreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTemplateRenderer.renderPreview.mockReturnValue(mockPreviewHTML);
    mockGetTemplateById.mockReturnValue(mockTemplate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering States", () => {
    it("renders loading state when generating preview", async () => {
      mockTemplateRenderer.renderPreview.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockPreviewHTML), 100)
          )
      );

      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      expect(screen.getByText("Generating preview...")).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.queryByText("Generating preview...")
        ).not.toBeInTheDocument();
      });
    });

    it("renders placeholder when no resume data is provided", async () => {
      renderWithContext(<ResumePreview />);

      await waitFor(() => {
        expect(screen.getByText("No Resume Data")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Upload a Markdown file or enter text to see your resume preview"
          )
        ).toBeInTheDocument();
      });
    });

    it("renders template placeholder when no template is selected", async () => {
      mockGetTemplateById.mockReturnValue(undefined);

      renderWithContext(<ResumePreview resumeData={mockResumeData} />);

      await waitFor(() => {
        expect(screen.getByText("No Template Selected")).toBeInTheDocument();
        expect(
          screen.getByText("Choose a template to see your resume preview")
        ).toBeInTheDocument();
      });
    });

    it("renders preview when both data and template are available", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("Professional")).toBeInTheDocument();
        expect(mockTemplateRenderer.renderPreview).toHaveBeenCalledWith(
          mockResumeData,
          mockTemplate
        );
      });
    });
  });

  describe("Preview Generation", () => {
    it("calls template renderer with correct parameters", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(mockTemplateRenderer.renderPreview).toHaveBeenCalledWith(
          mockResumeData,
          mockTemplate
        );
      });
    });

    it("handles template renderer errors gracefully", async () => {
      const errorMessage = "Template rendering failed";
      mockTemplateRenderer.renderPreview.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(
          screen.getByText(`Preview Error: ${errorMessage}`)
        ).toBeInTheDocument();
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });
    });

    it("retries preview generation when retry button is clicked", async () => {
      let callCount = 0;
      mockTemplateRenderer.renderPreview.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error("First attempt failed");
        }
        return mockPreviewHTML;
      });

      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Retry"));

      await waitFor(() => {
        expect(mockTemplateRenderer.renderPreview).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Zoom Controls", () => {
    it("renders zoom controls with default zoom level", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("70%")).toBeInTheDocument();
        expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
        expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
        expect(screen.getByLabelText("Reset zoom")).toBeInTheDocument();
      });
    });

    it("increases zoom level when zoom in button is clicked", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("70%")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("Zoom in"));

      await waitFor(() => {
        expect(screen.getByText("80%")).toBeInTheDocument();
      });
    });

    it("decreases zoom level when zoom out button is clicked", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("70%")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("Zoom out"));

      await waitFor(() => {
        expect(screen.getByText("60%")).toBeInTheDocument();
      });
    });

    it("resets zoom to 100% when reset button is clicked", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("70%")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("Reset zoom"));

      await waitFor(() => {
        expect(
          screen.getByText("100%", { selector: ".zoom-level" })
        ).toBeInTheDocument();
      });
    });

    it("disables zoom out button at minimum zoom level", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText("70%")).toBeInTheDocument();
      });

      // Zoom out to minimum
      const zoomOutBtn = screen.getByLabelText("Zoom out");

      // Click multiple times to reach minimum
      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomOutBtn);
      }

      await waitFor(() => {
        expect(zoomOutBtn).toBeDisabled();
        expect(screen.getByText("30%")).toBeInTheDocument();
      });
    });

    it("disables zoom in button at maximum zoom level", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText("70%")).toBeInTheDocument();
      });

      // Zoom in to maximum
      const zoomInBtn = screen.getByLabelText("Zoom in");

      // Click multiple times to reach maximum
      for (let i = 0; i < 20; i++) {
        fireEvent.click(zoomInBtn);
      }

      await waitFor(() => {
        expect(zoomInBtn).toBeDisabled();
        expect(screen.getByText("150%")).toBeInTheDocument();
      });
    });
  });

  describe("Template Information", () => {
    it("displays template name in preview controls", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("Professional")).toBeInTheDocument();
      });
    });

    it("shows error indicator when preview generation fails", async () => {
      mockTemplateRenderer.renderPreview.mockImplementation(() => {
        throw new Error("Rendering failed");
      });

      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("⚠️ Error")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("provides proper ARIA labels for zoom controls", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
        expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
        expect(screen.getByLabelText("Reset zoom")).toBeInTheDocument();
      });
    });

    it("maintains focus management for interactive elements", async () => {
      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        const zoomInBtn = screen.getByLabelText("Zoom in");
        zoomInBtn.focus();
        expect(document.activeElement).toBe(zoomInBtn);
      });
    });
  });

  describe("Props vs Context", () => {
    it("uses prop data when provided instead of context", async () => {
      const propResumeData = {
        ...mockResumeData,
        personalInfo: {
          ...mockResumeData.personalInfo,
          fullName: "Jane Smith",
        },
      };

      renderWithContext(
        <ResumePreview resumeData={propResumeData} template={mockTemplate} />
      );

      await waitFor(() => {
        expect(mockTemplateRenderer.renderPreview).toHaveBeenCalledWith(
          propResumeData,
          mockTemplate
        );
      });
    });

    it("uses prop template when provided instead of context", async () => {
      const propTemplate = { ...mockTemplate, name: "Custom Template" };

      renderWithContext(
        <ResumePreview resumeData={mockResumeData} template={propTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText("Custom Template")).toBeInTheDocument();
        expect(mockTemplateRenderer.renderPreview).toHaveBeenCalledWith(
          mockResumeData,
          propTemplate
        );
      });
    });
  });

  describe("Custom CSS Classes", () => {
    it("applies custom className when provided", () => {
      const { container } = renderWithContext(
        <ResumePreview
          resumeData={mockResumeData}
          template={mockTemplate}
          className="custom-preview-class"
        />
      );

      expect(
        container.querySelector(".custom-preview-class")
      ).toBeInTheDocument();
    });
  });
});
