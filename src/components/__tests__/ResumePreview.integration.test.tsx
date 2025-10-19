/**
 * Integration tests for ResumePreview component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ResumePreview } from "../ResumePreview";
import { AppProvider, useAppContext } from "../../context/AppContext";
import type { ResumeData } from "../../types";

// Test component to manipulate context state
const TestController: React.FC<{
  resumeData?: ResumeData;
  selectedTemplate?: string;
  children: React.ReactNode;
}> = ({ resumeData, selectedTemplate, children }) => {
  const { dispatch } = useAppContext();

  React.useEffect(() => {
    if (resumeData) {
      dispatch({ type: "SET_RESUME_DATA", payload: resumeData });
    }
    if (selectedTemplate) {
      dispatch({ type: "SET_TEMPLATE", payload: selectedTemplate });
    }
  }, [resumeData, selectedTemplate, dispatch]);

  return <>{children}</>;
};

const mockResumeData: ResumeData = {
  personalInfo: {
    fullName: "Integration Test User",
    email: "test@example.com",
    phone: "(555) 987-6543",
    location: "Test City, TC",
    linkedin: "https://linkedin.com/in/testuser",
  },
  summary: "This is a test summary for integration testing.",
  experience: [
    {
      jobTitle: "Test Engineer",
      company: "Test Company",
      duration: "2021 - Present",
      accomplishments: [
        "Wrote comprehensive integration tests",
        "Improved test coverage by 95%",
      ],
      isCurrentRole: true,
    },
  ],
  education: [
    {
      degree: "Bachelor of Testing",
      institution: "Test University",
      graduationDate: "2020",
    },
  ],
  skills: {
    technical: ["Testing", "Jest", "Vitest", "React Testing Library"],
  },
};

describe("ResumePreview Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Context Integration", () => {
    it("updates preview when context resume data changes", async () => {
      const { rerender } = render(
        <AppProvider>
          <TestController>
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      // Initially should show no data placeholder
      await waitFor(() => {
        expect(screen.getByText("No Resume Data")).toBeInTheDocument();
      });

      // Update with resume data
      rerender(
        <AppProvider>
          <TestController resumeData={mockResumeData}>
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText("No Resume Data")).not.toBeInTheDocument();
      });
    });

    it("updates preview when context template changes", async () => {
      const { rerender } = render(
        <AppProvider>
          <TestController resumeData={mockResumeData}>
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      // Initially should show no template placeholder
      await waitFor(() => {
        expect(screen.getByText("No Template Selected")).toBeInTheDocument();
      });

      // Update with template
      rerender(
        <AppProvider>
          <TestController
            resumeData={mockResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(
          screen.queryByText("No Template Selected")
        ).not.toBeInTheDocument();
      });
    });

    it("maintains zoom level when data updates", async () => {
      const { rerender } = render(
        <AppProvider>
          <TestController
            resumeData={mockResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      // Wait for initial render and change zoom
      await waitFor(() => {
        expect(screen.getByText("70%")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("Zoom in"));

      await waitFor(() => {
        expect(screen.getByText("80%")).toBeInTheDocument();
      });

      // Update resume data
      const updatedResumeData = {
        ...mockResumeData,
        personalInfo: {
          ...mockResumeData.personalInfo,
          fullName: "Updated Name",
        },
      };

      rerender(
        <AppProvider>
          <TestController
            resumeData={updatedResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      // Zoom level should be maintained
      await waitFor(() => {
        expect(screen.getByText("80%")).toBeInTheDocument();
      });
    });
  });

  describe("Real Template Integration", () => {
    it("renders with actual professional template", async () => {
      render(
        <AppProvider>
          <TestController
            resumeData={mockResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Professional")).toBeInTheDocument();
      });

      // Should contain actual resume content
      await waitFor(() => {
        const previewContent = document.querySelector(".preview-wrapper");
        expect(previewContent).toBeInTheDocument();
        expect(previewContent?.innerHTML).toContain("Integration Test User");
      });
    });

    it("renders with actual modern template", async () => {
      render(
        <AppProvider>
          <TestController resumeData={mockResumeData} selectedTemplate="modern">
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Modern")).toBeInTheDocument();
      });

      // Should contain actual resume content
      await waitFor(() => {
        const previewContent = document.querySelector(".preview-wrapper");
        expect(previewContent).toBeInTheDocument();
        expect(previewContent?.innerHTML).toContain("Integration Test User");
      });
    });

    it("switches between templates correctly", async () => {
      const { rerender } = render(
        <AppProvider>
          <TestController
            resumeData={mockResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Professional")).toBeInTheDocument();
      });

      // Switch to modern template
      rerender(
        <AppProvider>
          <TestController resumeData={mockResumeData} selectedTemplate="modern">
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Modern")).toBeInTheDocument();
        expect(screen.queryByText("Professional")).not.toBeInTheDocument();
      });
    });
  });

  describe("Preview Content Accuracy", () => {
    it("displays all resume sections when available", async () => {
      const completeResumeData: ResumeData = {
        ...mockResumeData,
        certifications: [
          {
            name: "Test Certification",
            issuer: "Test Institute",
            dateObtained: "2023",
          },
        ],
        projects: [
          {
            name: "Test Project",
            description: "A comprehensive testing project",
            technologies: ["React", "TypeScript"],
            accomplishments: ["Built amazing tests"],
          },
        ],
      };

      render(
        <AppProvider>
          <TestController
            resumeData={completeResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        const previewContent = document.querySelector(".preview-wrapper");
        expect(previewContent).toBeInTheDocument();

        // Check that all sections are rendered
        expect(previewContent?.innerHTML).toContain("Integration Test User");
        expect(previewContent?.innerHTML).toContain("This is a test summary");
        expect(previewContent?.innerHTML).toContain("Test Engineer");
        expect(previewContent?.innerHTML).toContain("Bachelor of Testing");
        expect(previewContent?.innerHTML).toContain("Testing");
        expect(previewContent?.innerHTML).toContain("Test Certification");
        expect(previewContent?.innerHTML).toContain("Test Project");
      });
    });

    it("handles missing optional sections gracefully", async () => {
      const minimalResumeData: ResumeData = {
        personalInfo: {
          fullName: "Minimal User",
          email: "minimal@example.com",
          phone: "(555) 000-0000",
          location: "Minimal City, MC",
        },
        summary: "",
        experience: [],
        education: [],
        skills: { technical: [] },
      };

      render(
        <AppProvider>
          <TestController
            resumeData={minimalResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        const previewContent = document.querySelector(".preview-wrapper");
        expect(previewContent).toBeInTheDocument();
        expect(previewContent?.innerHTML).toContain("Minimal User");
      });
    });
  });

  describe("Error Handling Integration", () => {
    it("recovers from template rendering errors", async () => {
      // Start with invalid template ID
      const { rerender } = render(
        <AppProvider>
          <TestController
            resumeData={mockResumeData}
            selectedTemplate="invalid-template"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("No Template Selected")).toBeInTheDocument();
      });

      // Switch to valid template
      rerender(
        <AppProvider>
          <TestController
            resumeData={mockResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Professional")).toBeInTheDocument();
        expect(
          screen.queryByText("No Template Selected")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Performance Integration", () => {
    it("handles multiple rapid updates gracefully", async () => {
      const { rerender } = render(
        <AppProvider>
          <TestController
            resumeData={mockResumeData}
            selectedTemplate="professional"
          >
            <ResumePreview />
          </TestController>
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Professional")).toBeInTheDocument();
      });

      // Rapidly update resume data multiple times
      for (let i = 0; i < 5; i++) {
        const updatedData = {
          ...mockResumeData,
          personalInfo: {
            ...mockResumeData.personalInfo,
            fullName: `User ${i}`,
          },
        };

        rerender(
          <AppProvider>
            <TestController
              resumeData={updatedData}
              selectedTemplate="professional"
            >
              <ResumePreview />
            </TestController>
          </AppProvider>
        );
      }

      // Should still render correctly after rapid updates
      await waitFor(() => {
        expect(screen.getByText("Professional")).toBeInTheDocument();
      });
    });
  });
});
