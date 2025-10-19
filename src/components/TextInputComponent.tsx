import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { ErrorType, ErrorSeverity } from "../types/errors";
import type { ValidationError } from "../types/errors";

interface TextInputComponentProps {
  onTextChange?: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const TextInputComponent: React.FC<TextInputComponentProps> = ({
  onTextChange,
  placeholder = "Paste your Markdown resume content here...",
  className = "",
}) => {
  const { state, dispatch } = useAppContext();
  const [isValidating, setIsValidating] = useState(false);
  const [showFormatHints, setShowFormatHints] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  // Validate Markdown content
  const validateMarkdownContent = useCallback(
    (content: string): ValidationError[] => {
      const errors: ValidationError[] = [];
      const lines = content.split("\n");

      if (!content.trim()) {
        return errors; // Empty content is valid, just not ready for processing
      }

      // Check for basic Markdown structure
      const hasHeaders = lines.some((line) => line.trim().startsWith("#"));
      if (!hasHeaders) {
        errors.push({
          id: `validation-error-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          message: "No Markdown headers found in content",
          userMessage:
            "Your resume should include section headers (e.g., # Name, ## Experience). Use the sample template for guidance.",
          timestamp: new Date(),
          field: "markdownContent",
          value: content,
          rule: "required-headers",
        });
      }

      // Check for potential contact information
      const hasEmail =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(content);
      if (!hasEmail) {
        errors.push({
          id: `validation-error-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          message: "No email address found in content",
          userMessage:
            "Please include your email address in the contact information section.",
          timestamp: new Date(),
          field: "markdownContent",
          value: content,
          rule: "required-email",
        });
      }

      // Check content length (reasonable resume length)
      if (content.length < 100) {
        errors.push({
          id: `validation-error-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.LOW,
          message: "Content appears to be too short for a complete resume",
          userMessage:
            "Your resume content seems quite short. Consider adding more details about your experience and skills.",
          timestamp: new Date(),
          field: "markdownContent",
          value: content,
          rule: "minimum-length",
        });
      }

      if (content.length > 50000) {
        errors.push({
          id: `validation-error-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.HIGH,
          message: "Content exceeds maximum recommended length",
          userMessage:
            "Your resume content is very long. Consider condensing it to 2-3 pages for better ATS compatibility.",
          timestamp: new Date(),
          field: "markdownContent",
          value: content,
          rule: "maximum-length",
        });
      }

      return errors;
    },
    []
  );

  // Handle text change with validation
  const handleTextChange = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;

      // Update state immediately for responsive UI
      dispatch({ type: "SET_MARKDOWN_CONTENT", payload: newText });

      // Clear uploaded file since we're using direct input
      if (state.uploadedFile) {
        dispatch({ type: "SET_UPLOADED_FILE", payload: null });
      }

      // Call optional callback
      if (onTextChange) {
        onTextChange(newText);
      }

      // Adjust textarea height
      adjustTextareaHeight();

      // Debounced validation
      setIsValidating(true);

      // Clear existing validation errors for this field
      const nonTextErrors = state.errors.filter(
        (error) =>
          !(
            error.type === ErrorType.VALIDATION &&
            "field" in error &&
            error.field === "markdownContent"
          )
      );
      dispatch({ type: "CLEAR_ERRORS" });
      nonTextErrors.forEach((error) =>
        dispatch({ type: "ADD_ERROR", payload: error })
      );

      // Validate after a short delay to avoid excessive validation
      setTimeout(() => {
        const validationErrors = validateMarkdownContent(newText);
        validationErrors.forEach((error) => {
          dispatch({ type: "ADD_ERROR", payload: error });
        });
        setIsValidating(false);
      }, 500);
    },
    [
      dispatch,
      state.uploadedFile,
      state.errors,
      onTextChange,
      adjustTextareaHeight,
      validateMarkdownContent,
    ]
  );

  // Download sample template
  const handleDownloadSample = useCallback(() => {
    const link = document.createElement("a");
    link.href = "/sample-resume-template.md";
    link.download = "sample-resume-template.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Initialize textarea height on mount and when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [state.markdownContent, adjustTextareaHeight]);

  // Get validation errors for this component
  const textValidationErrors = state.errors.filter(
    (error) =>
      error.type === ErrorType.VALIDATION &&
      "field" in error &&
      error.field === "markdownContent"
  );

  const hasContent = state.markdownContent.trim().length > 0;
  const hasErrors = textValidationErrors.length > 0;

  return (
    <div className={`text-input-component ${className}`}>
      {/* Header with sample download */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3
            className="text-lg font-medium text-gray-900"
            id="text-input-heading"
          >
            Direct Markdown Input
          </h3>
          <p className="text-sm text-gray-600" id="text-input-description">
            Paste your resume content in Markdown format
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFormatHints(!showFormatHints)}
            className="btn-accessible btn-secondary text-sm"
            type="button"
            aria-expanded={showFormatHints}
            aria-controls="format-hints"
            aria-describedby="text-input-description"
          >
            {showFormatHints ? "Hide" : "Show"} Format Hints
          </button>
          <button
            onClick={handleDownloadSample}
            className="btn-accessible btn-secondary text-sm"
            type="button"
            aria-describedby="text-input-description"
          >
            Download Sample Template
          </button>
        </div>
      </div>

      {/* Format hints */}
      {showFormatHints && (
        <div
          className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          id="format-hints"
          role="region"
          aria-labelledby="format-hints-heading"
        >
          <h4
            className="font-medium text-blue-900 mb-2"
            id="format-hints-heading"
          >
            Markdown Format Guidelines:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1" role="list">
            <li role="listitem">
              • Use <code className="bg-blue-100 px-1 rounded"># Name</code> for
              your name as the main header
            </li>
            <li role="listitem">
              • Use{" "}
              <code className="bg-blue-100 px-1 rounded">## Section Name</code>{" "}
              for major sections (Experience, Education, etc.)
            </li>
            <li role="listitem">
              • Use{" "}
              <code className="bg-blue-100 px-1 rounded">### Job Title</code>{" "}
              for subsections like job positions
            </li>
            <li role="listitem">
              • Use{" "}
              <code className="bg-blue-100 px-1 rounded">**Bold Text**</code>{" "}
              for emphasis (company names, dates)
            </li>
            <li role="listitem">
              • Use{" "}
              <code className="bg-blue-100 px-1 rounded">*Italic Text*</code>{" "}
              for job dates or locations
            </li>
            <li role="listitem">
              • Use{" "}
              <code className="bg-blue-100 px-1 rounded">- Bullet point</code>{" "}
              for lists and accomplishments
            </li>
            <li role="listitem">
              • Include contact information: email, phone, location, LinkedIn
            </li>
          </ul>
        </div>
      )}

      {/* Text input area */}
      <div className="relative">
        <label htmlFor="markdown-textarea" className="sr-only">
          Markdown resume content
        </label>
        <textarea
          ref={textareaRef}
          id="markdown-textarea"
          value={state.markdownContent}
          onChange={handleTextChange}
          placeholder={placeholder}
          className={`
            input-accessible w-full min-h-[200px] p-4 border rounded-lg resize-none font-mono text-sm
            ${hasErrors ? "border-red-300 bg-red-50" : "border-gray-300"}
            ${isValidating ? "opacity-75" : ""}
          `}
          data-testid="markdown-textarea"
          aria-labelledby="text-input-heading"
          aria-describedby="text-input-description character-count validation-status"
          aria-invalid={hasErrors}
          aria-required="false"
          spellCheck="false"
          autoComplete="off"
        />

        {/* Validation indicator */}
        {isValidating && (
          <div className="absolute top-2 right-2" aria-hidden="true">
            <div
              className="loading-spinner"
              role="status"
              aria-label="Validating content"
            ></div>
          </div>
        )}
      </div>

      {/* Character count and status */}
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
        <div id="character-count" aria-live="polite">
          {state.markdownContent.length} characters
          {state.markdownContent.length > 0 && (
            <span className="ml-2">
              • {Math.ceil(state.markdownContent.length / 500)} estimated pages
            </span>
          )}
        </div>
        {hasContent && !isValidating && (
          <div
            id="validation-status"
            className={`flex items-center ${
              hasErrors ? "text-red-600" : "text-green-600"
            }`}
            aria-live="polite"
          >
            {hasErrors ? (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Issues found</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Content looks good</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Validation errors */}
      {textValidationErrors.length > 0 && (
        <div className="mt-4 space-y-2">
          {textValidationErrors.map((error) => (
            <div
              key={error.id}
              className={`border rounded-md p-3 ${
                error.severity === ErrorSeverity.HIGH
                  ? "bg-red-50 border-red-200"
                  : error.severity === ErrorSeverity.MEDIUM
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}
              data-testid="validation-message"
            >
              <div className="flex">
                <svg
                  className={`w-5 h-5 mr-2 mt-0.5 ${
                    error.severity === ErrorSeverity.HIGH
                      ? "text-red-400"
                      : error.severity === ErrorSeverity.MEDIUM
                      ? "text-yellow-400"
                      : "text-blue-400"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {error.severity === ErrorSeverity.HIGH ? (
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      error.severity === ErrorSeverity.HIGH
                        ? "text-red-800"
                        : error.severity === ErrorSeverity.MEDIUM
                        ? "text-yellow-800"
                        : "text-blue-800"
                    }`}
                  >
                    {error.userMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success message */}
      {hasContent && !isValidating && textValidationErrors.length === 0 && (
        <div className="mt-4">
          <div
            className="bg-green-50 border border-green-200 rounded-md p-3"
            data-testid="success-message"
          >
            <div className="flex">
              <svg
                className="w-5 h-5 text-green-400 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Markdown content is ready for processing
                </p>
                <p className="text-sm text-green-600">
                  {state.markdownContent.split("\n").length} lines •{" "}
                  {state.markdownContent.split(/\s+/).length} words
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextInputComponent;
