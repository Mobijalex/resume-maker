import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { MarkdownParser } from "../../utils/MarkdownParser";
import { errorFactory } from "../../utils/errorFactory";

export default function ParseStep() {
  const { state, dispatch } = useAppContext();
  const [isParsingComplete, setIsParsingComplete] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("Initializing parser...");

  useEffect(() => {
    const parseMarkdownContent = async () => {
      if (!state.markdownContent.trim()) {
        const error = errorFactory.createParsingError(
          "No markdown content available for parsing",
          "Please upload a file or enter markdown content before proceeding to parsing.",
          {
            severity: "HIGH",
            context: { step: "parse", hasContent: false },
          }
        );
        dispatch({ type: "ADD_ERROR", payload: error });
        return;
      }

      try {
        dispatch({ type: "SET_PROCESSING", payload: true });
        dispatch({ type: "CLEAR_ERRORS" });

        // Simulate parsing progress for better UX
        const tasks = [
          "Initializing parser...",
          "Extracting personal information...",
          "Processing work experience...",
          "Parsing education details...",
          "Analyzing skills section...",
          "Processing optional sections...",
          "Validating structure...",
          "Finalizing resume data...",
        ];

        for (let i = 0; i < tasks.length; i++) {
          setCurrentTask(tasks[i]);
          setParsingProgress(((i + 1) / tasks.length) * 100);

          // Add small delay for better UX (except for the last step)
          if (i < tasks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        // Create parser instance and parse the content
        const parser = new MarkdownParser(state.markdownContent);

        // Validate structure first
        const validation = parser.validateStructure();
        if (!validation.isValid) {
          const error = errorFactory.createParsingError(
            `Invalid resume structure: ${validation.errors.join(", ")}`,
            "Your resume is missing required sections or information. Please check the structure and try again.",
            {
              severity: "HIGH",
              context: {
                validationErrors: validation.errors,
                step: "parse",
              },
            }
          );
          dispatch({ type: "ADD_ERROR", payload: error });
          dispatch({ type: "SET_PROCESSING", payload: false });
          return;
        }

        // Parse the markdown content
        const resumeData = await parser.parseMarkdown();

        // Update app state with parsed data
        dispatch({ type: "SET_RESUME_DATA", payload: resumeData });
        setIsParsingComplete(true);

        // Auto-advance to template selection after a brief delay
        setTimeout(() => {
          dispatch({ type: "SET_STEP", payload: "template" });
        }, 1500);
      } catch (error) {
        const parsingError = errorFactory.createParsingError(
          `Failed to parse markdown content: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "There was an error processing your resume content. Please check the format and try again.",
          {
            severity: "CRITICAL",
            context: {
              originalError: error,
              step: "parse",
              contentLength: state.markdownContent.length,
            },
          }
        );
        dispatch({ type: "ADD_ERROR", payload: parsingError });
        setIsParsingComplete(false);
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    };

    // Only parse if we have content and haven't parsed yet
    if (
      state.markdownContent.trim() &&
      !state.resumeData &&
      !isParsingComplete
    ) {
      parseMarkdownContent();
    }
  }, [state.markdownContent, state.resumeData, isParsingComplete, dispatch]);

  // Get parsing errors
  const parsingErrors = state.errors.filter(
    (error) => error.type === "PARSING"
  );

  const handleRetry = () => {
    setIsParsingComplete(false);
    setParsingProgress(0);
    setCurrentTask("Initializing parser...");
    dispatch({ type: "CLEAR_ERRORS" });
    dispatch({ type: "SET_RESUME_DATA", payload: null });
  };

  const handleGoBack = () => {
    dispatch({ type: "SET_STEP", payload: "upload" });
  };

  return (
    <div className="p-8 text-center" data-testid="parse-step">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Processing Your Resume
      </h2>
      <p className="text-gray-600 mb-8">
        We're parsing your Markdown content and extracting the resume data.
      </p>

      <div className="max-w-2xl mx-auto">
        {/* Parsing Progress */}
        {state.isProcessing && !isParsingComplete && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-700 font-medium">{currentTask}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${parsingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {Math.round(parsingProgress)}% complete
            </p>
          </div>
        )}

        {/* Parsing Complete */}
        {isParsingComplete && !parsingErrors.length && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Parsing Complete!
            </h3>
            <p className="text-green-700 mb-4">
              Your resume has been successfully processed and structured.
            </p>
            <p className="text-sm text-green-600">
              Redirecting to template selection...
            </p>
          </div>
        )}

        {/* Parsing Errors */}
        {parsingErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-6">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-4">
              Parsing Failed
            </h3>
            <div className="space-y-2 mb-6">
              {parsingErrors.map((error, index) => (
                <div key={error.id} className="text-left">
                  <p className="text-red-700 font-medium">
                    {error.userMessage}
                  </p>
                  {error.details && (
                    <p className="text-red-600 text-sm mt-1">{error.details}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRetry}
                className="btn-primary"
                data-testid="retry-parsing"
              >
                Try Again
              </button>
              <button
                onClick={handleGoBack}
                className="btn-secondary"
                data-testid="go-back"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* No Content State */}
        {!state.markdownContent.trim() && !state.isProcessing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              No Content to Parse
            </h3>
            <p className="text-yellow-700 mb-4">
              Please upload a file or enter markdown content before proceeding.
            </p>
            <button
              onClick={handleGoBack}
              className="btn-primary"
              data-testid="go-back-to-upload"
            >
              Back to Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
