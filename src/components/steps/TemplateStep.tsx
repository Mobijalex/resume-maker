import { Suspense } from "react";
import { useAppContext } from "../../context/AppContext";
import TemplateSelector from "../TemplateSelector";

export default function TemplateStep() {
  const { state, dispatch } = useAppContext();

  const handleTemplateSelect = (templateId: string) => {
    dispatch({ type: "SET_TEMPLATE", payload: templateId });
  };

  const handleContinue = () => {
    if (state.selectedTemplate) {
      dispatch({ type: "SET_STEP", payload: "preview" });
    }
  };

  const handleGoBack = () => {
    dispatch({ type: "SET_STEP", payload: "parse" });
  };

  return (
    <div className="p-8" data-testid="template-step">
      <div className="max-w-6xl mx-auto">
        {/* Check if we have resume data */}
        {!state.resumeData ? (
          <div className="text-center">
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
                No Resume Data Available
              </h3>
              <p className="text-yellow-700 mb-4">
                Please complete the parsing step first to generate your resume
                data.
              </p>
              <button
                onClick={handleGoBack}
                className="btn-primary"
                data-testid="go-back-to-parse"
              >
                Back to Parsing
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Template Selector */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading templates...
                  </span>
                </div>
              }
            >
              <TemplateSelector
                selectedTemplateId={state.selectedTemplate}
                onTemplateSelect={handleTemplateSelect}
                resumeData={state.resumeData}
              />
            </Suspense>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handleGoBack}
                className="btn-secondary"
                data-testid="template-back"
              >
                Back to Parsing
              </button>

              <div className="text-center">
                {state.selectedTemplate ? (
                  <div className="mb-4">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-green-800 font-medium">
                        Template selected
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 mb-4">
                    Please select a template to continue
                  </p>
                )}
              </div>

              <button
                onClick={handleContinue}
                disabled={!state.selectedTemplate}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="template-continue"
              >
                Continue to Preview
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
