import type { ReactNode } from "react";
import { ProgressIndicator } from "./ProgressIndicator";
import { useAppContext } from "../context/AppContext";
import { useAccessibility } from "../utils/accessibility";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state } = useAppContext();
  const { announce } = useAccessibility();

  const handleHelpClick = () => {
    announce(
      "Help information: This application converts Markdown resumes to ATS-friendly PDFs. Use the step-by-step process to upload your resume, choose a template, and download your formatted PDF."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header
        className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl text-white"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  MD Resume Converter
                </h1>
                <p className="text-blue-100 text-sm mt-1">Transform your Markdown into ATS-friendly PDFs</p>
              </div>
              <span
                className="ml-4 px-3 py-1 text-xs font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm"
                aria-label="This application creates ATS-friendly resumes"
              >
                ATS-FRIENDLY
              </span>
            </div>

            {/* Help button */}
            <div className="flex items-center space-x-4">
              <button
                className="btn-accessible bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={handleHelpClick}
                aria-label="Get help information about using this application"
                title="Help"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="sr-only">Help</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <nav
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm"
        aria-label="Resume creation progress"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressIndicator currentStep={state.currentStep} />
        </div>
      </nav>

      {/* Main Content */}
      <main
        id="main-content"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        role="main"
        aria-label="Resume converter main content"
      >
        {/* Error Display */}
        {state.errors.length > 0 && (
          <div className="mb-6" role="alert" aria-live="polite">
            <h2 className="sr-only">Errors that need attention</h2>
            {state.errors.map((error, index) => (
              <div
                key={error.id || index}
                className="notification-accessible"
                role="alert"
                aria-describedby={`error-description-${index}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0" aria-hidden="true">
                    <svg
                      className="h-5 w-5 text-red-400"
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
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error.userMessage || error.message}
                    </h3>
                    {error.details && (
                      <div
                        id={`error-description-${index}`}
                        className="mt-2 text-sm text-red-700"
                      >
                        <p>{error.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Processing Indicator */}
        {state.isProcessing && (
          <div className="mb-6" role="status" aria-live="polite">
            <div className="notification-accessible" role="status">
              <div className="flex items-center">
                <div className="flex-shrink-0" aria-hidden="true">
                  <div className="loading-spinner" aria-hidden="true"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Processing your resume...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="card-accessible">{children}</div>
      </main>

      {/* Footer */}
      <footer
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100 mt-12"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center space-x-6 mb-4">
              <div className="flex items-center text-blue-600">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Privacy-focused</span>
              </div>
              <div className="flex items-center text-blue-600">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Client-side processing</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Transform your Markdown resume into an ATS-friendly PDF
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
