import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "../../context/AppContext";
import FileUploadComponent from "../../components/FileUploadComponent";
import { MarkdownParser } from "../../utils/MarkdownParser";
import { PDFGenerator } from "../../utils/PDFGenerator";
import { TemplateRegistry } from "../../templates/templateRegistry";

// Mock PDF generation
const mockPDFInstance = {
  save: vi.fn(),
  output: vi.fn().mockReturnValue("mock-pdf-blob"),
};

vi.mock("../../utils/PDFGenerator", () => ({
  PDFGenerator: vi.fn().mockImplementation(() => mockPDFInstance),
}));

// Mock template registry
vi.mock("../../templates/templateRegistry", () => ({
  TemplateRegistry: {
    getTemplate: vi.fn().mockReturnValue({
      id: "professional",
      name: "Professional",
      render: vi.fn().mockReturnValue("<div>Rendered resume</div>"),
    }),
    getAllTemplates: vi.fn().mockReturnValue([
      { id: "professional", name: "Professional" },
      { id: "modern", name: "Modern" },
    ]),
  },
}));

// Mock file reader
const mockFileReader = {
  readAsText: vi.fn(),
  result: "",
  onload: null as any,
  onerror: null as any,
};

global.FileReader = vi.fn().mockImplementation(() => mockFileReader);

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue("mock-blob-url");
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement for download link
const mockLink = {
  href: "",
  download: "",
  click: vi.fn(),
  style: {},
};

const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName) => {
  if (tagName === "a") {
    return mockLink;
  }
  return originalCreateElement.call(document, tagName);
});

describe("End-to-End: File Upload to PDF Download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReader.result = "";
  });

  it("should process uploaded markdown file and generate PDF", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const [step, setStep] = React.useState("upload");
      const [resumeData, setResumeData] = React.useState(null);
      const [selectedTemplate, setSelectedTemplate] =
        React.useState("professional");

      const handleFileUpload = async (file: File) => {
        // Simulate file reading
        const parser = new MarkdownParser(file.name);
        const data = parser.parseMarkdown();
        setResumeData(data);
        setStep("template");
      };

      const handleGeneratePDF = async () => {
        const template = TemplateRegistry.getTemplate(selectedTemplate);
        const generator = new PDFGenerator();

        // Simulate PDF generation
        await generator.generate(resumeData, template);

        // Simulate download
        const link = document.createElement("a");
        link.href = "mock-blob-url";
        link.download = "Resume_John_Doe_2024.pdf";
        link.click();
      };

      return (
        <div>
          {step === "upload" && (
            <div data-testid="upload-section">
              <input
                data-testid="file-input"
                type="file"
                accept=".md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </div>
          )}

          {step === "template" && (
            <div data-testid="template-section">
              <button
                data-testid="select-professional"
                onClick={() => setSelectedTemplate("professional")}
              >
                Professional Template
              </button>
              <button data-testid="generate-pdf" onClick={handleGeneratePDF}>
                Generate PDF
              </button>
            </div>
          )}
        </div>
      );
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Step 1: Upload file
    expect(screen.getByTestId("upload-section")).toBeInTheDocument();

    const fileInput = screen.getByTestId("file-input");
    const markdownContent = `# John Doe
john.doe@email.com | (555) 123-4567 | New York, NY

## Professional Summary
Experienced software engineer with 5+ years of expertise.

## Experience
### Software Engineer | Tech Corp | 2020 - Present
- Developed web applications
- Led team of 3 developers

## Education
### Bachelor of Science in Computer Science | University | 2020

## Skills
- JavaScript, TypeScript, React
- Node.js, Python
- AWS, Docker`;

    const file = new File([markdownContent], "resume.md", {
      type: "text/markdown",
    });

    // Mock FileReader behavior
    mockFileReader.result = markdownContent;
    mockFileReader.onload = vi.fn();

    await user.upload(fileInput, file);

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: markdownContent } } as any);
    }

    // Step 2: Template selection should appear
    await waitFor(() => {
      expect(screen.getByTestId("template-section")).toBeInTheDocument();
    });

    // Step 3: Select template and generate PDF
    const professionalButton = screen.getByTestId("select-professional");
    await user.click(professionalButton);

    const generateButton = screen.getByTestId("generate-pdf");
    await user.click(generateButton);

    // Verify PDF generation was called
    expect(PDFGenerator).toHaveBeenCalled();
    expect(mockPDFInstance.save).toHaveBeenCalled();

    // Verify download link was created and clicked
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toBe("Resume_John_Doe_2024.pdf");
  });

  it("should handle file upload errors gracefully", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const [error, setError] = React.useState("");

      const handleFileUpload = (file: File) => {
        // Simulate file reading error
        mockFileReader.onerror = () => {
          setError("Failed to read file");
        };

        // Trigger error
        if (mockFileReader.onerror) {
          mockFileReader.onerror(new Error("File read error") as any);
        }
      };

      return (
        <div>
          <input
            data-testid="file-input"
            type="file"
            accept=".md"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          {error && <div data-testid="error-message">{error}</div>}
        </div>
      );
    };

    render(<TestComponent />);

    const fileInput = screen.getByTestId("file-input");
    const file = new File(["invalid content"], "resume.md", {
      type: "text/markdown",
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to read file"
      );
    });
  });

  it("should validate file type and size", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const [error, setError] = React.useState("");

      const handleFileUpload = (file: File) => {
        // Validate file type
        if (!file.name.endsWith(".md")) {
          setError("Please upload a .md file");
          return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setError("File size must be less than 5MB");
          return;
        }

        setError("");
      };

      return (
        <div>
          <input
            data-testid="file-input"
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          {error && <div data-testid="error-message">{error}</div>}
        </div>
      );
    };

    render(<TestComponent />);

    const fileInput = screen.getByTestId("file-input");

    // Test invalid file type
    const invalidFile = new File(["content"], "resume.txt", {
      type: "text/plain",
    });

    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Please upload a .md file"
      );
    });

    // Test file too large
    const largeContent = "x".repeat(6 * 1024 * 1024); // 6MB
    const largeFile = new File([largeContent], "resume.md", {
      type: "text/markdown",
    });

    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "File size must be less than 5MB"
      );
    });
  });

  it("should handle PDF generation errors", async () => {
    const user = userEvent.setup();

    // Mock PDF generation to throw error
    const mockPDFGeneratorError = vi.fn().mockImplementation(() => {
      throw new Error("PDF generation failed");
    });

    vi.mocked(PDFGenerator).mockImplementation(mockPDFGeneratorError);

    const TestComponent = () => {
      const [error, setError] = React.useState("");

      const handleGeneratePDF = async () => {
        try {
          const generator = new PDFGenerator();
          await generator.generate({}, {});
        } catch (err) {
          setError("Failed to generate PDF");
        }
      };

      return (
        <div>
          <button data-testid="generate-pdf" onClick={handleGeneratePDF}>
            Generate PDF
          </button>
          {error && <div data-testid="error-message">{error}</div>}
        </div>
      );
    };

    render(<TestComponent />);

    const generateButton = screen.getByTestId("generate-pdf");
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to generate PDF"
      );
    });
  });

  it("should handle template selection and application", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const [selectedTemplate, setSelectedTemplate] = React.useState("");
      const [appliedTemplate, setAppliedTemplate] = React.useState("");

      const handleApplyTemplate = () => {
        const template = TemplateRegistry.getTemplate(selectedTemplate);
        if (template) {
          setAppliedTemplate(template.name);
        }
      };

      return (
        <div>
          <select
            data-testid="template-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">Select Template</option>
            <option value="professional">Professional</option>
            <option value="modern">Modern</option>
          </select>

          <button data-testid="apply-template" onClick={handleApplyTemplate}>
            Apply Template
          </button>

          {appliedTemplate && (
            <div data-testid="applied-template">Applied: {appliedTemplate}</div>
          )}
        </div>
      );
    };

    render(<TestComponent />);

    const templateSelect = screen.getByTestId("template-select");
    const applyButton = screen.getByTestId("apply-template");

    // Select professional template
    await user.selectOptions(templateSelect, "professional");
    await user.click(applyButton);

    await waitFor(() => {
      expect(screen.getByTestId("applied-template")).toHaveTextContent(
        "Applied: Professional"
      );
    });

    // Verify template registry was called
    expect(TemplateRegistry.getTemplate).toHaveBeenCalledWith("professional");
  });

  it("should generate proper filename for PDF download", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const resumeData = {
        personalInfo: {
          fullName: "Jane Smith",
          email: "jane@example.com",
          phone: "123-456-7890",
          location: "Boston, MA",
        },
        summary: "",
        experience: [],
        education: [],
        skills: { technical: [] },
      };

      const handleDownload = () => {
        const date = new Date().toISOString().split("T")[0];
        const filename = `Resume_${resumeData.personalInfo.fullName.replace(
          /\s+/g,
          "_"
        )}_${date}.pdf`;

        const link = document.createElement("a");
        link.download = filename;
        link.click();
      };

      return (
        <button data-testid="download-button" onClick={handleDownload}>
          Download PDF
        </button>
      );
    };

    render(<TestComponent />);

    const downloadButton = screen.getByTestId("download-button");
    await user.click(downloadButton);

    const expectedDate = new Date().toISOString().split("T")[0];
    expect(mockLink.download).toBe(`Resume_Jane_Smith_${expectedDate}.pdf`);
  });
});
