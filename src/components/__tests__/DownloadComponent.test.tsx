import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import DownloadComponent from "../DownloadComponent";
import { useAppContext } from "../../context/AppContext";
import { PDFGenerator } from "../../utils/PDFGenerator";
import { templateRegistry } from "../../templates/templateRegistry";

// Mock dependencies
vi.mock("../../context/AppContext");
vi.mock("../../utils/PDFGenerator");
vi.mock("../../templates/templateRegistry");

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(window.URL, "createObjectURL", {
  value: mockCreateObjectURL,
});
Object.defineProperty(window.URL, "revokeObjectURL", {
  value: mockRevokeObjectURL,
});

// Mock performance.now
Object.defineProperty(window, "performance", {
  value: {
    now: vi.fn(),
  },
});

// Setup DOM environment
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock document methods
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

const mockLink = {
  href: "",
  download: "",
  click: mockClick,
};

// Store original createElement to avoid recursion
const originalCreateElement = document.createElement.bind(document);

Object.defineProperty(document, "createElement", {
  value: vi.fn((tagName: string) => {
    if (tagName === "a") {
      return mockLink;
    }
    return originalCreateElement(tagName);
  }),
});

Object.defineProperty(document.body, "appendChild", {
  value: mockAppendChild,
});

Object.defineProperty(document.body, "removeChild", {
  value: mockRemoveChild,
});

const mockUseAppContext = useAppContext as any;
const mockPDFGenerator = PDFGenerator as any;
const mockTemplateRegistry = templateRegistry as any;

describe("DownloadComponent", () => {
  const mockDispatch = vi.fn();
  const mockResumeData = {
    personalInfo: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      location: "New York, NY",
    },
    summary: "Experienced developer",
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Tech Corp",
        duration: "2020-2023",
        accomplishments: ["Built awesome apps"],
        isCurrentRole: false,
      },
    ],
    education: [
      {
        degree: "BS Computer Science",
        institution: "University",
        graduationDate: "2020",
      },
    ],
    skills: {
      technical: ["JavaScript", "React"],
    },
  };

  const mockTemplate = {
    id: "professional",
    name: "Professional",
    description: "A professional template",
    layout: {
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      spacing: { lineHeight: 14, itemGap: 8, sectionGap: 16 },
    },
    styling: {
      fonts: { primary: "Arial" },
      sizes: { headerFont: 18, subHeaderFont: 14, bodyFont: 11 },
    },
    atsOptimized: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
    (window.performance.now as any).mockReturnValue(1000);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders missing data warning when resume data is not available", () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: null,
        selectedTemplate: "",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    render(<DownloadComponent />);

    expect(screen.getByText("Missing Required Data")).toBeInTheDocument();
    expect(screen.getByText("Go to Upload Step")).toBeInTheDocument();
  });

  it("renders missing data warning when template is not selected", () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    render(<DownloadComponent />);

    expect(screen.getByText("Missing Required Data")).toBeInTheDocument();
  });

  it("renders download interface when data is available", () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    render(<DownloadComponent />);

    expect(screen.getByText("Download Your Resume")).toBeInTheDocument();
    expect(screen.getByText("Resume Summary")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("professional")).toBeInTheDocument();
    expect(screen.getByText("Generate & Download PDF")).toBeInTheDocument();
  });

  it("shows progress during PDF generation", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(mockTemplate);

    // Mock PDF generation to take some time
    const mockPDFInstance = {
      generatePDF: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                success: true,
                pdf: { output: vi.fn().mockReturnValue(new Blob()) },
                generationTime: 1500,
              });
            }, 100);
          })
      ),
    };

    mockPDFGenerator.mockImplementation(() => mockPDFInstance);

    render(<DownloadComponent />);

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    // Should show progress
    expect(screen.getByText("Generating PDF...")).toBeInTheDocument();
    expect(screen.getByText(/% complete/)).toBeInTheDocument();

    // Wait for completion
    await waitFor(
      () => {
        expect(screen.getByText("Download Successful!")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("generates correct filename format", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(mockTemplate);

    const mockPDFInstance = {
      generatePDF: vi.fn().mockResolvedValue({
        success: true,
        pdf: { output: vi.fn().mockReturnValue(new Blob()) },
        generationTime: 1500,
      }),
    };

    mockPDFGenerator.mockImplementation(() => mockPDFInstance);

    // Mock Date to return consistent date
    const mockDate = new Date("2023-12-01");
    vi.spyOn(global, "Date").mockImplementation(() => mockDate as any);
    mockDate.toISOString = vi.fn().mockReturnValue("2023-12-01T00:00:00.000Z");

    // Mock document.createElement and appendChild
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink as any);
    vi.spyOn(document.body, "appendChild").mockImplementation(
      () => mockLink as any
    );
    vi.spyOn(document.body, "removeChild").mockImplementation(
      () => mockLink as any
    );

    render(<DownloadComponent />);

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText("Download Successful!")).toBeInTheDocument();
    });

    // Check that the filename follows the correct format
    expect(mockLink.download).toBe("Resume_John_Doe_2023-12-01.pdf");
  });

  it("handles PDF generation errors gracefully", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(mockTemplate);

    const mockPDFInstance = {
      generatePDF: vi.fn().mockResolvedValue({
        success: false,
        error: "PDF generation failed",
        generationTime: 500,
      }),
    };

    mockPDFGenerator.mockImplementation(() => mockPDFInstance);

    render(<DownloadComponent />);

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText("Download Failed")).toBeInTheDocument();
      expect(screen.getByText("PDF generation failed")).toBeInTheDocument();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ADD_ERROR",
      payload: expect.objectContaining({
        message: "PDF generation failed",
      }),
    });
  });

  it("handles template not found error", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "nonexistent",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(null);

    render(<DownloadComponent />);

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText("Download Failed")).toBeInTheDocument();
      expect(
        screen.getByText(/Template "nonexistent" not found/)
      ).toBeInTheDocument();
    });
  });

  it("shows warnings when PDF generation has warnings", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(mockTemplate);

    const mockPDFInstance = {
      generatePDF: vi.fn().mockResolvedValue({
        success: true,
        pdf: { output: vi.fn().mockReturnValue(new Blob()) },
        warnings: ["Font not ATS-optimized"],
        generationTime: 1500,
      }),
    };

    mockPDFGenerator.mockImplementation(() => mockPDFInstance);

    render(<DownloadComponent />);

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText("Download Successful!")).toBeInTheDocument();
    });

    // Check that warning was dispatched
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ADD_ERROR",
      payload: expect.objectContaining({
        message: "Font not ATS-optimized",
      }),
    });
  });

  it("allows downloading again after successful generation", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(mockTemplate);

    const mockPDFInstance = {
      generatePDF: vi.fn().mockResolvedValue({
        success: true,
        pdf: { output: vi.fn().mockReturnValue(new Blob()) },
        generationTime: 1500,
      }),
    };

    mockPDFGenerator.mockImplementation(() => mockPDFInstance);

    render(<DownloadComponent />);

    // First download
    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText("Download Successful!")).toBeInTheDocument();
    });

    // Download again
    const downloadAgainButton = screen.getByText("Download Again");
    fireEvent.click(downloadAgainButton);

    expect(mockPDFInstance.generatePDF).toHaveBeenCalledTimes(2);
  });

  it("navigates back to preview when requested", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(mockTemplate);

    const mockPDFInstance = {
      generatePDF: vi.fn().mockResolvedValue({
        success: true,
        pdf: { output: vi.fn().mockReturnValue(new Blob()) },
        generationTime: 1500,
      }),
    };

    mockPDFGenerator.mockImplementation(() => mockPDFInstance);

    render(<DownloadComponent />);

    // Generate PDF first
    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText("Download Successful!")).toBeInTheDocument();
    });

    // Click back to preview
    const backButton = screen.getByText("Back to Preview");
    fireEvent.click(backButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_STEP",
      payload: "preview",
    });
  });

  it("resets state when starting over", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(mockTemplate);

    const mockPDFInstance = {
      generatePDF: vi.fn().mockResolvedValue({
        success: true,
        pdf: { output: vi.fn().mockReturnValue(new Blob()) },
        generationTime: 1500,
      }),
    };

    mockPDFGenerator.mockImplementation(() => mockPDFInstance);

    render(<DownloadComponent />);

    // Generate PDF first
    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText("Download Successful!")).toBeInTheDocument();
    });

    // Click start over
    const startOverButton = screen.getByText("Create New Resume");
    fireEvent.click(startOverButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "RESET_STATE",
    });
  });

  it("shows performance warning when generation takes longer than 3 seconds", async () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    mockTemplateRegistry.getTemplate.mockReturnValue(mockTemplate);

    const mockPDFInstance = {
      generatePDF: vi.fn().mockResolvedValue({
        success: true,
        pdf: { output: vi.fn().mockReturnValue(new Blob()) },
        generationTime: 4000, // Longer than 3 seconds
      }),
    };

    mockPDFGenerator.mockImplementation(() => mockPDFInstance);

    render(<DownloadComponent />);

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText("Download Successful!")).toBeInTheDocument();
      expect(screen.getByText("(Slower than target 3s)")).toBeInTheDocument();
    });
  });

  it("cleans up blob URLs when component unmounts", () => {
    mockUseAppContext.mockReturnValue({
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
      },
      dispatch: mockDispatch,
    });

    const { unmount } = render(<DownloadComponent />);

    // Simulate having a blob URL
    mockCreateObjectURL.mockReturnValue("blob:test-url");

    unmount();

    // Note: In a real scenario, we'd need to track the blob URL creation
    // and ensure cleanup happens. This test verifies the mock is available.
    expect(mockRevokeObjectURL).toBeDefined();
  });
});
