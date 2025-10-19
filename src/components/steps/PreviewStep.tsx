import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import ResumePreview from "../ResumePreview";
import { preloadTemplates } from "../../utils/dynamicImports";

export default function PreviewStep() {
  const { state, dispatch } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload templates when preview step is loaded
    preloadTemplates();

    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading preview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="preview-step">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Preview Your Resume
        </h2>
        <p className="text-gray-600">
          Review your resume before downloading. Make sure all information is
          correct.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {state.resumeData && state.selectedTemplate ? (
          <ResumePreview />
        ) : (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
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
                Missing Information
              </h3>
              <p className="text-yellow-700 mb-4">
                {!state.resumeData && !state.selectedTemplate
                  ? "Please complete the parsing and template selection steps first."
                  : !state.resumeData
                  ? "No resume data available. Please go back and complete the parsing step."
                  : "No template selected. Please go back and choose a template."}
              </p>
              <button
                onClick={() =>
                  dispatch({
                    type: "SET_STEP",
                    payload: !state.resumeData ? "parse" : "template",
                  })
                }
                className="btn-primary"
                data-testid="go-back-from-preview"
              >
                {!state.resumeData ? "Back to Parsing" : "Back to Templates"}
              </button>
            </div>
          </div>
        )}
        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => dispatch({ type: "SET_STEP", payload: "template" })}
            className="btn-secondary"
            data-testid="preview-back"
          >
            Back to Templates
          </button>

          <button
            onClick={() => dispatch({ type: "SET_STEP", payload: "download" })}
            className="btn-primary"
            data-testid="preview-next"
          >
            Continue to Download
          </button>
        </div>
      </div>
    </div>
  );
}
