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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white shadow-sm border-b border-gray-200"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                MD Resume Converter
              </h1>
              <span
                className="ml-3 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
                aria-label="This application creates ATS-friendly resumes"
              >
                ATS-Friendly
              </span>
            </div>

            {/* Help button */}
            <div className="flex items-center space-x-4">
              <button
                className="btn-accessible btn-secondary p-2"
                onClick={handleHelpClick}
                aria-label="Get help information about using this application"
                title="Help"
              >
                <svg
                  className="w-5 h-5"
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
        className="bg-white border-b border-gray-200"
        aria-label="Resume creation progress"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressIndicator currentStep={state.currentStep} />
        </div>
      </nav>

      {/* Main Content */}
      <main
        id="main-content"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
        className="bg-white border-t border-gray-200 mt-12"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Transform your Markdown resume into an ATS-friendly PDF •{" "}
              <span className="ml-1 font-medium">Privacy-focused</span> •{" "}
              <span className="ml-1 font-medium">Client-side processing</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
