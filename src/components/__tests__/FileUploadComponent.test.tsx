import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUploadComponent from "../FileUploadComponent";
import { AppProvider } from "../../context/AppContext";
import { ErrorType, ErrorSeverity } from "../../types/errors";

// Mock FileReader
const mockFileReader = {
  readAsText: vi.fn(),
  result: "",
  onload: null as any,
  onerror: null as any,
};

Object.defineProperty(window, "FileReader", {
  writable: true,
  value: vi.fn(() => mockFileReader),
});

// Helper function to create a mock file
const createMockFile = (
  name: string,
  size: number,
  type: string = "text/markdown"
): File => {
  const file = new File(["test content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

// Helper function to render component with context
const renderWithContext = (props = {}) => {
  return render(
    <AppProvider>
      <FileUploadComponent {...props} />
    </AppProvider>
  );
};

describe("FileUploadComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReader.result = "test markdown content";
  });

  describe("Rendering", () => {
    it("renders the upload area with correct text", () => {
      renderWithContext();

      expect(screen.getByText("Upload your resume")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Drag and drop your Markdown file here, or click to browse"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("Supports .md files up to 5MB")
      ).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      renderWithContext({ className: "custom-class" });

      const component = screen.getByTestId("drop-zone").parentElement;
      expect(component).toHaveClass("custom-class");
    });

    it("shows hidden file input with correct attributes", () => {
      renderWithContext();

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveAttribute("accept", ".md");
      expect(fileInput).toHaveClass("sr-only");
    });
  });

  describe("File Validation", () => {
    it("accepts valid .md file under size limit", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      renderWithContext({ onFileSelect });

      const validFile = createMockFile("resume.md", 1024 * 1024); // 1MB
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, validFile);

      // Simulate FileReader success
      mockFileReader.onload({ target: { result: "test content" } });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith(validFile);
      });

      expect(screen.getByTestId("success-message")).toBeInTheDocument();
      expect(
        screen.getByText("File uploaded successfully: resume.md")
      ).toBeInTheDocument();
    });

    it("rejects file that exceeds size limit", async () => {
      const user = userEvent.setup();
      renderWithContext();

      const largeFile = createMockFile("large-resume.md", 6 * 1024 * 1024); // 6MB
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/File size \(6\.0MB\) exceeds the 5MB limit/)
      ).toBeInTheDocument();
    });

    it("rejects file with wrong extension", async () => {
      renderWithContext();

      const wrongFile = createMockFile("resume.txt", 1024, "text/plain");
      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

      // Use fireEvent instead of userEvent for file upload
      Object.defineProperty(fileInput, "files", {
        value: [wrongFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "Please select a Markdown file (.md). Other file types are not supported."
        )
      ).toBeInTheDocument();
    });

    it("handles custom accepted types", async () => {
      const user = userEvent.setup();
      renderWithContext({ acceptedTypes: [".txt", ".md"] });

      const txtFile = createMockFile("resume.txt", 1024, "text/plain");
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, txtFile);

      // Simulate FileReader success
      mockFileReader.onload({ target: { result: "test content" } });

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
      });
    });

    it("handles custom size limit", async () => {
      const user = userEvent.setup();
      renderWithContext({ maxSizeBytes: 1024 }); // 1KB limit

      const largeFile = createMockFile("resume.md", 2048); // 2KB
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });
    });
  });

  describe("Drag and Drop", () => {
    it("handles drag enter and shows visual feedback", () => {
      renderWithContext();

      const dropZone = screen.getByTestId("drop-zone");

      fireEvent.dragEnter(dropZone);

      expect(dropZone).toHaveClass("border-blue-500", "bg-blue-50");
    });

    it("handles drag leave and removes visual feedback", () => {
      renderWithContext();

      const dropZone = screen.getByTestId("drop-zone");

      fireEvent.dragEnter(dropZone);
      fireEvent.dragLeave(dropZone);

      expect(dropZone).not.toHaveClass("border-blue-500", "bg-blue-50");
    });

    it("handles file drop", async () => {
      const onFileSelect = vi.fn();
      renderWithContext({ onFileSelect });

      const dropZone = screen.getByTestId("drop-zone");
      const validFile = createMockFile("resume.md", 1024);

      const dropEvent = new Event("drop", { bubbles: true });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          files: [validFile],
        },
      });

      fireEvent(dropZone, dropEvent);

      // Simulate FileReader success
      mockFileReader.onload({ target: { result: "test content" } });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith(validFile);
      });
    });

    it("prevents default behavior on drag events", () => {
      renderWithContext();

      const dropZone = screen.getByTestId("drop-zone");

      const dragOverEvent = new Event("dragover", { bubbles: true });
      const preventDefaultSpy = vi.spyOn(dragOverEvent, "preventDefault");

      fireEvent(dropZone, dragOverEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles FileReader error", async () => {
      const user = userEvent.setup();
      renderWithContext();

      const validFile = createMockFile("resume.md", 1024);
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, validFile);

      // Simulate FileReader error
      mockFileReader.onerror();

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "Failed to read the selected file. Please try again or choose a different file."
        )
      ).toBeInTheDocument();
    });

    it("shows error for invalid file", async () => {
      renderWithContext();

      // Upload invalid file
      const invalidFile = createMockFile("resume.txt", 1024, "text/plain");
      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

      Object.defineProperty(fileInput, "files", {
        value: [invalidFile],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "Please select a Markdown file (.md). Other file types are not supported."
        )
      ).toBeInTheDocument();
    });

    it("shows multiple errors with correct styling", async () => {
      renderWithContext();

      const invalidFile = createMockFile(
        "resume.txt",
        6 * 1024 * 1024,
        "text/plain"
      ); // Wrong type and too large
      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

      Object.defineProperty(fileInput, "files", {
        value: [invalidFile],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      const dropZone = screen.getByTestId("drop-zone");
      expect(dropZone).toHaveClass("border-red-300", "bg-red-50");
    });
  });

  describe("Loading State", () => {
    it("shows loading state during file processing", async () => {
      const user = userEvent.setup();
      renderWithContext();

      const validFile = createMockFile("resume.md", 1024);
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, validFile);

      // Before FileReader completes
      expect(screen.getByText("Processing file...")).toBeInTheDocument();
      expect(screen.getByTestId("drop-zone")).toHaveClass(
        "opacity-50",
        "cursor-not-allowed"
      );

      // Complete FileReader
      mockFileReader.onload({ target: { result: "test content" } });

      await waitFor(() => {
        expect(
          screen.queryByText("Processing file...")
        ).not.toBeInTheDocument();
      });
    });

    it("disables click during loading", async () => {
      const user = userEvent.setup();
      renderWithContext();

      const validFile = createMockFile("resume.md", 1024);
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, validFile);

      // Try to click while loading
      const dropZone = screen.getByTestId("drop-zone");
      await user.click(dropZone);

      // Should not trigger file input click during loading
      expect(screen.getByText("Processing file...")).toBeInTheDocument();
    });
  });

  describe("Click to Upload", () => {
    it("triggers file input when drop zone is clicked", async () => {
      const user = userEvent.setup();
      renderWithContext();

      const dropZone = screen.getByTestId("drop-zone");
      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

      const clickSpy = vi.spyOn(fileInput, "click");

      await user.click(dropZone);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("Success State", () => {
    it("displays file information on successful upload", async () => {
      const user = userEvent.setup();
      renderWithContext();

      const validFile = createMockFile("my-resume.md", 2048); // 2KB
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, validFile);

      // Simulate FileReader success
      mockFileReader.onload({ target: { result: "test content" } });

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
      });

      expect(
        screen.getByText("File uploaded successfully: my-resume.md")
      ).toBeInTheDocument();
      expect(screen.getByText("Size: 2.0 KB")).toBeInTheDocument();
    });
  });
});
