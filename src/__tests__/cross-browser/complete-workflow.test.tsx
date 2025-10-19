/**
 * Complete Application Workflow Tests
 *
 * Tests the complete application workflow from upload/input to PDF download
 * across different browsers and scenarios. Validates all requirements.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../../context/AppContext";
import App from "../../App";

// Mock browser APIs
const mockBrowserAPIs = () => {
  // Mock File API
  global.File = class MockFile {
    name: string;
    size: number;
    type: string;
    content: string;

    constructor(content: string[], filename: string, options: any = {}) {
      this.name = filename;
      this.size = options.size || content.join("").length;
      this.type = options.type || "text/plain";
      this.content = content.join("");
    }
  } as any;

  // Mock FileReader
  global.FileReader = class MockFileReader {
    result: string | null = null;
    onload: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;

    readAsText(file: any) {
      setTimeout(() => {
        this.result = file.content;
        if (this.onload) {
          this.onload({ target: { result: this.result } });
        }
      }, 10);
    }
  } as any;

  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = vi.fn();

  // Mock Blob
  global.Blob = class MockBlob {
    constructor(public content: any[], public options: any = {}) {}
  } as any;
};

// Mock PDF generation
vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue("mock-pdf-data"),
    internal: {
      pageSize: { width: 210, height: 297 },
    },
    getTextWidth: vi.fn().mockReturnValue(50),
    splitTextToSize: vi.fn().mockImplementation((text) => [text]),
  })),
}));

describe("Complete Application Workflow Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBrowserAPIs();
  });

  describe("File Upload to PDF Download Workflow", () => {
    it("should complete full workflow via file upload", async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Step 1: Upload file
      const fileInput = screen.getByLabelText(/upload.*markdown/i);
      const testFile = new File(
        [
          `
# John Doe

## Contact
- Email: john.doe@example.com
- Phone: +1 (555) 123-4567
- Location: New York, NY

## Professional Summary
Experienced software engineer with 5+ years in full-stack development.

## Experience
### Senior Software Engineer | Tech Corp | 2020 - Present
- Led development of microservices architecture
- Improved system performance by 40%
- Mentored junior developers

## Education
### Bachelor of Science in Computer Science | University of Technology | 2018
- GPA: 3.8

## Skills
- **Technical:** JavaScript, TypeScript, React, Node.js, Python, AWS
- **Languages:** English (Native), Spanish (Conversational)
      `,
        ],
        "resume.md",
        { type: "text/markdown" }
      );

      await user.upload(fileInput, testFile);

      // Step 2: Wait for parsing
      await waitFor(
        () => {
          expect(screen.getByText(/parsing/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Step 3: Navigate to template selection
      await waitFor(
        () => {
          expect(screen.getByText(/template/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const templateButton = screen.getByText(/professional/i);
      await user.click(templateButton);

      // Step 4: Navigate to preview
      await waitFor(
        () => {
          expect(screen.getByText(/preview/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Step 5: Generate and download PDF
      const downloadButton = screen.getByText(/download/i);
      await user.click(downloadButton);

      await waitFor(
        () => {
          expect(screen.getByText(/download.*ready/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Verify PDF generation was called
      const mockJsPDF = vi.mocked(require("jspdf").default);
      expect(mockJsPDF).toHaveBeenCalled();
    });

    it("should handle drag and drop file upload", async () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const dropZone = screen.getByText(/drag.*drop/i).closest("div");
      const testFile = new File(
        ["# Test Resume\n## Contact\nEmail: test@example.com"],
        "test.md"
      );

      // Simulate drag and drop
      fireEvent.dragEnter(dropZone!, {
        dataTransfer: {
          files: [testFile],
          types: ["Files"],
        },
      });

      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [testFile],
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/parsing/i)).toBeInTheDocument();
      });
    });
  });

  describe("Text Input to PDF Download Workflow", () => {
    it("should complete full workflow via text input", async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Step 1: Enter text directly
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      const resumeText = `
# Jane Smith

## Contact
- Email: jane.smith@example.com
- Phone: +1 (555) 987-6543
- Location: San Francisco, CA

## Professional Summary
Product manager with 7+ years of experience in tech startups.

## Experience
### Senior Product Manager | StartupCo | 2019 - Present
- Led product strategy for B2B SaaS platform
- Increased user engagement by 60%

## Education
### MBA | Business School | 2017
### Bachelor of Arts in Economics | University | 2015

## Skills
- **Product:** Strategy, Analytics, User Research
- **Technical:** SQL, Python, Tableau
      `;

      await user.type(textArea, resumeText);

      // Step 2: Parse content
      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/template/i)).toBeInTheDocument();
      });

      // Step 3: Select template
      const modernTemplate = screen.getByText(/modern/i);
      await user.click(modernTemplate);

      // Step 4: Preview
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      // Step 5: Download
      const downloadButton = screen.getByText(/download/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/download.*ready/i)).toBeInTheDocument();
      });

      // Verify workflow completion
      const mockJsPDF = vi.mocked(require("jspdf").default);
      expect(mockJsPDF).toHaveBeenCalled();
    });

    it("should handle sample template download", async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const sampleButton = screen.getByText(/download.*sample/i);
      await user.click(sampleButton);

      // Should trigger download
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe("Error Handling in Complete Workflow", () => {
    it("should handle invalid file upload gracefully", async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const fileInput = screen.getByLabelText(/upload.*markdown/i);
      const invalidFile = new File(["invalid content"], "test.txt", {
        type: "text/plain",
      });

      await user.upload(fileInput, invalidFile);

      await waitFor(() => {
        expect(screen.getByText(/invalid.*file/i)).toBeInTheDocument();
      });
    });

    it("should handle parsing errors gracefully", async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(textArea, "Invalid markdown without required sections");

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/missing.*required/i)).toBeInTheDocument();
      });
    });

    it("should handle PDF generation errors gracefully", async () => {
      // Mock PDF generation failure
      vi.mocked(require("jspdf").default).mockImplementation(() => {
        throw new Error("PDF generation failed");
      });

      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Test\n## Contact\nEmail: test@example.com\n## Experience\nDeveloper"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/template/i)).toBeInTheDocument();
      });

      const templateButton = screen.getByText(/professional/i);
      await user.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/download/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/error.*generating/i)).toBeInTheDocument();
      });
    });
  });

  describe("Navigation and State Management", () => {
    it("should allow navigation between steps without losing data", async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Enter data
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Test User\n## Contact\nEmail: test@example.com"
      );

      // Parse
      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/template/i)).toBeInTheDocument();
      });

      // Go back to upload step
      const backButton = screen.getByText(/back/i);
      await user.click(backButton);

      // Data should be preserved
      const preservedTextArea = screen.getByPlaceholderText(/paste.*markdown/i);
      expect(preservedTextArea).toHaveValue(
        expect.stringContaining("Test User")
      );
    });

    it("should show progress indicators throughout workflow", async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Should show step 1 initially
      expect(screen.getByText(/step.*1/i)).toBeInTheDocument();

      // Navigate to step 2
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Test\n## Contact\nEmail: test@example.com\n## Experience\nDeveloper"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/step.*2/i)).toBeInTheDocument();
      });
    });
  });

  describe("Performance During Complete Workflow", () => {
    it("should complete workflow within performance requirements", async () => {
      const user = userEvent.setup();
      const startTime = performance.now();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Complete workflow
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(
        textArea,
        "# Fast Test\n## Contact\nEmail: fast@example.com\n## Experience\nDeveloper"
      );

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/template/i)).toBeInTheDocument();
      });

      const templateButton = screen.getByText(/professional/i);
      await user.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/download/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/download.*ready/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for complete workflow
    });

    it("should handle large resume data efficiently", async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Create large resume content
      const largeContent = `
# Large Resume Test

## Contact
- Email: large@example.com
- Phone: +1 (555) 123-4567

## Professional Summary
${Array(10)
  .fill("Very detailed professional summary with lots of content. ")
  .join("")}

## Experience
${Array(20)
  .fill(
    `
### Job Title | Company | Date Range
- Achievement 1 with detailed description
- Achievement 2 with detailed description
- Achievement 3 with detailed description
`
  )
  .join("")}

## Skills
- **Technical:** ${Array(50)
        .fill("Technology")
        .map((tech, i) => `${tech}${i}`)
        .join(", ")}
      `;

      const startTime = performance.now();

      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      await user.type(textArea, largeContent);

      const parseButton = screen.getByText(/parse/i);
      await user.click(parseButton);

      await waitFor(
        () => {
          expect(screen.getByText(/template/i)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should handle large content within reasonable time
      expect(processingTime).toBeLessThan(15000); // 15 seconds for large content
    });
  });

  describe("Accessibility During Workflow", () => {
    it("should maintain keyboard navigation throughout workflow", async () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Test keyboard navigation
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      textArea.focus();

      expect(document.activeElement).toBe(textArea);

      // Tab to parse button
      fireEvent.keyDown(textArea, { key: "Tab" });

      const parseButton = screen.getByText(/parse/i);
      expect(document.activeElement).toBe(parseButton);
    });

    it("should provide screen reader support throughout workflow", () => {
      render(
        <AppProvider>
          <App />
        </AppProvider>
      );

      // Check for ARIA labels and roles
      const textArea = screen.getByPlaceholderText(/paste.*markdown/i);
      expect(textArea).toHaveAttribute("aria-label");

      const parseButton = screen.getByText(/parse/i);
      expect(parseButton).toHaveAttribute("role", "button");
    });
  });
});
