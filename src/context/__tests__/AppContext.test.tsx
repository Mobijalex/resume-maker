import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppProvider, useAppContext } from "../AppContext";
import type { AppAction } from "../../types";

// Test component to interact with context
const TestComponent = () => {
  const { state, dispatch } = useAppContext();

  const handleSetStep = () => {
    dispatch({ type: "SET_STEP", payload: "parse" });
  };

  const handleAddError = () => {
    dispatch({
      type: "ADD_ERROR",
      payload: {
        id: "test-error",
        message: "Test error message",
        userMessage: "User friendly error",
        type: "validation",
        severity: "error",
        timestamp: Date.now(),
      },
    });
  };

  const handleSetProcessing = () => {
    dispatch({ type: "SET_PROCESSING", payload: true });
  };

  const handleClearErrors = () => {
    dispatch({ type: "CLEAR_ERRORS" });
  };

  const handleSetResumeData = () => {
    dispatch({
      type: "SET_RESUME_DATA",
      payload: {
        personalInfo: {
          fullName: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, NY",
        },
        summary: "Test summary",
        experience: [],
        education: [],
        skills: { technical: [] },
      },
    });
  };

  const handleSetTemplate = () => {
    dispatch({ type: "SET_TEMPLATE", payload: "professional" });
  };

  const handleSetPreviewContent = () => {
    dispatch({
      type: "SET_PREVIEW_CONTENT",
      payload: "<div>Preview content</div>",
    });
  };

  const handleSetUploadedFile = () => {
    const file = new File(["test content"], "test.md", {
      type: "text/markdown",
    });
    dispatch({ type: "SET_UPLOADED_FILE", payload: file });
  };

  const handleSetMarkdownContent = () => {
    dispatch({ type: "SET_MARKDOWN_CONTENT", payload: "# Test Markdown" });
  };

  const handleResetState = () => {
    dispatch({ type: "RESET_STATE" });
  };

  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="is-processing">{state.isProcessing.toString()}</div>
      <div data-testid="errors-count">{state.errors.length}</div>
      <div data-testid="selected-template">{state.selectedTemplate}</div>
      <div data-testid="preview-content">{state.previewContent}</div>
      <div data-testid="markdown-content">{state.markdownContent}</div>
      <div data-testid="uploaded-file">
        {state.uploadedFile?.name || "none"}
      </div>
      <div data-testid="resume-data">
        {state.resumeData?.personalInfo.fullName || "none"}
      </div>

      <button onClick={handleSetStep}>Set Step</button>
      <button onClick={handleAddError}>Add Error</button>
      <button onClick={handleSetProcessing}>Set Processing</button>
      <button onClick={handleClearErrors}>Clear Errors</button>
      <button onClick={handleSetResumeData}>Set Resume Data</button>
      <button onClick={handleSetTemplate}>Set Template</button>
      <button onClick={handleSetPreviewContent}>Set Preview Content</button>
      <button onClick={handleSetUploadedFile}>Set Uploaded File</button>
      <button onClick={handleSetMarkdownContent}>Set Markdown Content</button>
      <button onClick={handleResetState}>Reset State</button>
    </div>
  );
};

describe("AppContext", () => {
  it("should provide initial state", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("current-step")).toHaveTextContent("upload");
    expect(screen.getByTestId("is-processing")).toHaveTextContent("false");
    expect(screen.getByTestId("errors-count")).toHaveTextContent("0");
    expect(screen.getByTestId("selected-template")).toHaveTextContent("");
    expect(screen.getByTestId("preview-content")).toHaveTextContent("");
    expect(screen.getByTestId("markdown-content")).toHaveTextContent("");
    expect(screen.getByTestId("uploaded-file")).toHaveTextContent("none");
    expect(screen.getByTestId("resume-data")).toHaveTextContent("none");
  });

  it("should handle SET_STEP action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Set Step"));
    expect(screen.getByTestId("current-step")).toHaveTextContent("parse");
  });

  it("should handle ADD_ERROR action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Add Error"));
    expect(screen.getByTestId("errors-count")).toHaveTextContent("1");
  });

  it("should handle SET_PROCESSING action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Set Processing"));
    expect(screen.getByTestId("is-processing")).toHaveTextContent("true");
  });

  it("should handle CLEAR_ERRORS action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Add error first
    fireEvent.click(screen.getByText("Add Error"));
    expect(screen.getByTestId("errors-count")).toHaveTextContent("1");

    // Clear errors
    fireEvent.click(screen.getByText("Clear Errors"));
    expect(screen.getByTestId("errors-count")).toHaveTextContent("0");
  });

  it("should handle SET_RESUME_DATA action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Set Resume Data"));
    expect(screen.getByTestId("resume-data")).toHaveTextContent("John Doe");
  });

  it("should handle SET_TEMPLATE action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Set Template"));
    expect(screen.getByTestId("selected-template")).toHaveTextContent(
      "professional"
    );
  });

  it("should handle SET_PREVIEW_CONTENT action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Set Preview Content"));
    expect(screen.getByTestId("preview-content")).toHaveTextContent(
      "<div>Preview content</div>"
    );
  });

  it("should handle SET_UPLOADED_FILE action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Set Uploaded File"));
    expect(screen.getByTestId("uploaded-file")).toHaveTextContent("test.md");
  });

  it("should handle SET_MARKDOWN_CONTENT action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Set Markdown Content"));
    expect(screen.getByTestId("markdown-content")).toHaveTextContent(
      "# Test Markdown"
    );
  });

  it("should handle RESET_STATE action", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Change some state first
    fireEvent.click(screen.getByText("Set Step"));
    fireEvent.click(screen.getByText("Add Error"));
    fireEvent.click(screen.getByText("Set Processing"));

    expect(screen.getByTestId("current-step")).toHaveTextContent("parse");
    expect(screen.getByTestId("errors-count")).toHaveTextContent("1");
    expect(screen.getByTestId("is-processing")).toHaveTextContent("true");

    // Reset state
    fireEvent.click(screen.getByText("Reset State"));

    expect(screen.getByTestId("current-step")).toHaveTextContent("upload");
    expect(screen.getByTestId("errors-count")).toHaveTextContent("0");
    expect(screen.getByTestId("is-processing")).toHaveTextContent("false");
  });

  it("should throw error when useAppContext is used outside provider", () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const TestComponentOutsideProvider = () => {
      useAppContext();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow("useAppContext must be used within an AppProvider");

    consoleSpy.mockRestore();
  });

  it("should handle unknown action type gracefully", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    const { state, dispatch } = useAppContext();

    // This would normally be caught by TypeScript, but testing runtime behavior
    const unknownAction = { type: "UNKNOWN_ACTION" } as any;

    // Should return current state unchanged
    expect(() => {
      dispatch(unknownAction);
    }).not.toThrow();
  });
});
