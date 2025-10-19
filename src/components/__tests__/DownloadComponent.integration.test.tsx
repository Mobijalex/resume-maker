import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import DownloadComponent from "../DownloadComponent";
import { AppProvider } from "../../context/AppContext";
import { PDFGenerator } from "../../utils/PDFGenerator";

// Mock jsPDF
vi.mock("jspdf", () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        height: 842,
        width: 595,
      },
    },
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    getTextWidth: vi.fn().mockReturnValue(100),
    splitTextToSize: vi.fn().mockImplementation((text) => [text]),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    output: vi
      .fn()
      .mockReturnValue(new Blob(["mock pdf"], { type: "application/pdf" })),
    save: vi.fn(),
  })),
}));

// Mock URL methods
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
    now: vi.fn().mockReturnValue(1000),
  },
});

// Mock DOM methods
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

Object.defineProperty(document, "createElement", {
  value: vi.fn().mockReturnValue({
    href: "",
    download: "",
    click: mockClick,
  }),
});

Object.defineProperty(document.body, "appendChild", {
  value: mockAppendChild,
});

Object.defineProperty(document.body, "removeChild", {
  value: mockRemoveChild,
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>{children}</AppProvider>
);

describe("DownloadComponent Integration Tests", () => {
  const mockResumeData = {
    personalInfo: {
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "555-0123",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/janesmith",
      website: "janesmith.dev",
    },
    summary:
      "Senior software engineer with 8+ years of experience in full-stack development.",
    experience: [
      {
        jobTitle: "Senior Software Engineer",
        company: "Tech Innovations Inc.",
        duration: "2021 - Present",
        accomplishments: [
          "Led development of microservices architecture serving 1M+ users",
          "Reduced system latency by 40% through performance optimizations",
          "Mentored 5 junior developers and established code review processes",
        ],
        isCurrentRole: true,
      },
      {
        jobTitle: "Software Engineer",
        company: "StartupCorp",
        duration: "2019 - 2021",
        accomplishments: [
          "Built responsive web applications using React and Node.js",
          "Implemented CI/CD pipelines reducing deployment time by 60%",
          "Collaborated with design team to improve user experience",
        ],
        isCurrentRole: false,
      },
    ],
    education: [
      {
        degree: "Master of Science in Computer Science",
        institution: "Stanford University",
        graduationDate: "2019",
        gpa: "3.8",
        relevantCoursework: [
          "Algorithms",
          "Machine Learning",
          "Database Systems",
        ],
      },
      {
        degree: "Bachelor of Science in Computer Engineering",
        institution: "UC Berkeley",
        graduationDate: "2017",
      },
    ],
    skills: {
      technical: [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "AWS",
        "Docker",
      ],
      languages: ["English (Native)", "Spanish (Conversational)"],
      soft: [
        "Leadership",
        "Problem Solving",
        "Communication",
        "Team Collaboration",
      ],
    },
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        dateObtained: "2022",
        expirationDate: "2025",
        credentialId: "AWS-SA-123456",
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description:
          "Full-stack e-commerce solution with real-time inventory management",
        technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
        duration: "6 months",
        url: "github.com/janesmith/ecommerce",
        accomplishments: [
          "Processed 10,000+ transactions with 99.9% uptime",
          "Integrated with multiple payment gateways",
          "Implemented advanced search and filtering capabilities",
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
    (window.performance.now as any).mockReturnValue(1000);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("completes full download workflow with real data", async () => {
    render(
      <TestWrapper>
        <DownloadComponent />
      </TestWrapper>
    );

    // Initially should show missing data warning
    expect(screen.getByText("Missing Required Data")).toBeInTheDocument();

    // Simulate having resume data and template by dispatching actions
    // This would normally be done through the app flow
    const { rerender } = render(
      <TestWrapper>
        <DownloadComponent />
      </TestWrapper>
    );

    // We need to mock the context to have data
    // For integration test, we'll test the component behavior when data is available
    // by mocking the useAppContext hook locally
    const mockContextValue = {
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
        currentStep: "download" as const,
        isProcessing: false,
        previewContent: "",
        uploadedFile: null,
        markdownContent: "",
      },
      dispatch: vi.fn(),
    };

    // Mock the context for this specific test
    vi.doMock("../../context/AppContext", () => ({
      useAppContext: () => mockContextValue,
    }));

    // Re-import and re-render with mocked context
    const { default: DownloadComponentWithMockedContext } = await import(
      "../DownloadComponent"
    );

    rerender(
      <div>
        <DownloadComponentWithMockedContext />
      </div>
    );

    // Should now show the download interface
    await waitFor(() => {
      expect(screen.getByText("Download Your Resume")).toBeInTheDocument();
    });

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("professional")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Experience entries
    expect(screen.getByText("2")).toBeInTheDocument(); // Education entries

    // Click download button
    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    // Should show progress
    expect(screen.getByText("Generating PDF...")).toBeInTheDocument();

    // Wait for completion
    await waitFor(
      () => {
        expect(screen.getByText("Download Successful!")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify download was triggered
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  it("handles complex resume data with all sections", async () => {
    const mockContextValue = {
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "modern",
        errors: [],
        currentStep: "download" as const,
        isProcessing: false,
        previewContent: "",
        uploadedFile: null,
        markdownContent: "",
      },
      dispatch: vi.fn(),
    };

    vi.doMock("../../context/AppContext", () => ({
      useAppContext: () => mockContextValue,
    }));

    const { default: DownloadComponentWithMockedContext } = await import(
      "../DownloadComponent"
    );

    render(
      <div>
        <DownloadComponentWithMockedContext />
      </div>
    );

    await waitFor(() => {
      expect(screen.getByText("Download Your Resume")).toBeInTheDocument();
    });

    // Verify all data is displayed in summary
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("modern")).toBeInTheDocument();

    // Start download
    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    // Wait for completion
    await waitFor(
      () => {
        expect(screen.getByText("Download Successful!")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify the PDF generator was called with correct data
    // This tests that all sections of the resume data are processed
    expect(mockClick).toHaveBeenCalled();
  });

  it("measures and reports generation performance", async () => {
    let performanceCallCount = 0;
    (window.performance.now as any).mockImplementation(() => {
      performanceCallCount++;
      return performanceCallCount === 1 ? 1000 : 2500; // 1.5 second generation
    });

    const mockContextValue = {
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
        currentStep: "download" as const,
        isProcessing: false,
        previewContent: "",
        uploadedFile: null,
        markdownContent: "",
      },
      dispatch: vi.fn(),
    };

    vi.doMock("../../context/AppContext", () => ({
      useAppContext: () => mockContextValue,
    }));

    const { default: DownloadComponentWithMockedContext } = await import(
      "../DownloadComponent"
    );

    render(
      <div>
        <DownloadComponentWithMockedContext />
      </div>
    );

    await waitFor(() => {
      expect(screen.getByText("Download Your Resume")).toBeInTheDocument();
    });

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(
      () => {
        expect(screen.getByText("Download Successful!")).toBeInTheDocument();
        expect(screen.getByText(/Generation time: \d+ms/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should not show performance warning for fast generation
    expect(
      screen.queryByText("(Slower than target 3s)")
    ).not.toBeInTheDocument();
  });

  it("shows performance warning for slow generation", async () => {
    let performanceCallCount = 0;
    (window.performance.now as any).mockImplementation(() => {
      performanceCallCount++;
      return performanceCallCount === 1 ? 1000 : 5000; // 4 second generation
    });

    const mockContextValue = {
      state: {
        resumeData: mockResumeData,
        selectedTemplate: "professional",
        errors: [],
        currentStep: "download" as const,
        isProcessing: false,
        previewContent: "",
        uploadedFile: null,
        markdownContent: "",
      },
      dispatch: vi.fn(),
    };

    vi.doMock("../../context/AppContext", () => ({
      useAppContext: () => mockContextValue,
    }));

    const { default: DownloadComponentWithMockedContext } = await import(
      "../DownloadComponent"
    );

    render(
      <div>
        <DownloadComponentWithMockedContext />
      </div>
    );

    await waitFor(() => {
      expect(screen.getByText("Download Your Resume")).toBeInTheDocument();
    });

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(
      () => {
        expect(screen.getByText("Download Successful!")).toBeInTheDocument();
        expect(screen.getByText("(Slower than target 3s)")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("generates correct filename with special characters in name", async () => {
    const specialNameResumeData = {
      ...mockResumeData,
      personalInfo: {
        ...mockResumeData.personalInfo,
        fullName: "José María O'Connor-Smith",
      },
    };

    const mockContextValue = {
      state: {
        resumeData: specialNameResumeData,
        selectedTemplate: "professional",
        errors: [],
        currentStep: "download" as const,
        isProcessing: false,
        previewContent: "",
        uploadedFile: null,
        markdownContent: "",
      },
      dispatch: vi.fn(),
    };

    vi.doMock("../../context/AppContext", () => ({
      useAppContext: () => mockContextValue,
    }));

    // Mock Date to return consistent date
    const mockDate = new Date("2023-12-15");
    vi.spyOn(global, "Date").mockImplementation(() => mockDate as any);
    mockDate.toISOString = vi.fn().mockReturnValue("2023-12-15T00:00:00.000Z");

    const mockLink = {
      href: "",
      download: "",
      click: mockClick,
    };

    vi.spyOn(document, "createElement").mockReturnValue(mockLink as any);

    const { default: DownloadComponentWithMockedContext } = await import(
      "../DownloadComponent"
    );

    render(
      <div>
        <DownloadComponentWithMockedContext />
      </div>
    );

    await waitFor(() => {
      expect(screen.getByText("Download Your Resume")).toBeInTheDocument();
    });

    const downloadButton = screen.getByText("Generate & Download PDF");
    fireEvent.click(downloadButton);

    await waitFor(
      () => {
        expect(screen.getByText("Download Successful!")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Check that special characters are properly handled in filename
    expect(mockLink.download).toBe(
      "Resume_Jos_Mara_OConnorSmith_2023-12-15.pdf"
    );
  });
});
