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
    <div className="p-6 sm:p-8" data-testid="template-step">
      <div className="max-w-6xl mx-auto">
        {/* Check if we have resume data */}
        {!state.resumeData ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200/50 rounded-2xl p-10 max-w-md mx-auto shadow-sm">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-yellow-100 p-4 rounded-full">
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
              </div>
              <h3 className="text-2xl font-bold text-yellow-800 mb-3">
                No Resume Data Available
              </h3>
              <p className="text-yellow-700 mb-6 text-lg">
                Please complete the parsing step first to generate your resume
                data.
              </p>
              <button
                onClick={handleGoBack}
                className="btn-primary py-3 px-8"
                data-testid="go-back-to-parse"
              >
                Back to Parsing
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Template Selector */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Choose Your Template</h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
                Select from our professionally designed templates that are optimized for ATS systems.
              </p>
              
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <span className="text-gray-600 text-lg">
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
            </div>

            {/* Navigation */}
            <div className="mt-12 flex justify-between items-center">
              <button
                onClick={handleGoBack}
                className="btn-secondary py-3 px-6"
                data-testid="template-back"
              >
                Back to Parsing
              </button>

              <div className="text-center">
                {state.selectedTemplate ? (
                  <div className="mb-4">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-xl shadow-sm">
                      <svg
                        className="w-6 h-6 text-green-500 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-green-800 font-semibold text-lg">
                        Template selected
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-lg mb-4">
                    Please select a template to continue
                  </p>
                )}
              </div>

              <button
                onClick={handleContinue}
                disabled={!state.selectedTemplate}
                className="btn-primary py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
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
