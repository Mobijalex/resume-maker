import React, { useState, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { PDFGenerator } from "../utils/PDFGenerator";
import { templateRegistry } from "../templates/templateRegistry";
import type { ResumeData } from "../types/resume";

interface DownloadState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  downloadUrl: string | null;
  generationTime: number | null;
}

export default function DownloadComponent() {
  const { state, dispatch } = useAppContext();
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isGenerating: false,
    progress: 0,
    error: null,
    success: false,
    downloadUrl: null,
    generationTime: null,
  });

  const generateAndDownloadPDF = useCallback(async () => {
    if (!state.resumeData || !state.selectedTemplate) {
      setDownloadState((prev) => ({
        ...prev,
        error:
          "Resume data or template not available. Please go back and complete the previous steps.",
      }));
      return;
    }

    const startTime = performance.now();

    setDownloadState({
      isGenerating: true,
      progress: 0,
      error: null,
      success: false,
      downloadUrl: null,
      generationTime: null,
    });

    try {
      // Progress: Starting generation
      setDownloadState((prev) => ({ ...prev, progress: 10 }));

      // Get the selected template
      const template = templateRegistry.getTemplate(state.selectedTemplate);
      if (!template) {
        throw new Error(`Template "${state.selectedTemplate}" not found`);
      }

      // Progress: Template loaded
      setDownloadState((prev) => ({ ...prev, progress: 25 }));

      // Create PDF generator
      const pdfGenerator = new PDFGenerator({
        template,
        resumeData: state.resumeData,
        atsOptimized: true,
      });

      // Progress: Generator initialized
      setDownloadState((prev) => ({ ...prev, progress: 40 }));

      // Generate PDF
      const result = await pdfGenerator.generatePDF();

      // Progress: PDF generated
      setDownloadState((prev) => ({ ...prev, progress: 70 }));

      if (!result.success || !result.pdf) {
        throw new Error(result.error || "Failed to generate PDF");
      }

      // Progress: Preparing download
      setDownloadState((prev) => ({ ...prev, progress: 85 }));

      // Generate filename
      const filename = generateFilename(state.resumeData.personalInfo.fullName);

      // Create blob URL for download
      const pdfBlob = result.pdf.output("blob");
      const downloadUrl = URL.createObjectURL(pdfBlob);

      // Progress: Complete
      setDownloadState((prev) => ({ ...prev, progress: 100 }));

      const endTime = performance.now();
      const generationTime = Math.round(endTime - startTime);

      // Trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update state with success
      setDownloadState({
        isGenerating: false,
        progress: 100,
        error: null,
        success: true,
        downloadUrl,
        generationTime,
      });

      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning) => {
          dispatch({
            type: "ADD_ERROR",
            payload: {
              type: "warning" as any,
              severity: "warning" as any,
              message: warning,
              field: "pdf-generation",
            },
          });
        });
      }
    } catch (error) {
      const endTime = performance.now();
      const generationTime = Math.round(endTime - startTime);

      setDownloadState({
        isGenerating: false,
        progress: 0,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        success: false,
        downloadUrl: null,
        generationTime,
      });

      dispatch({
        type: "ADD_ERROR",
        payload: {
          type: "pdf" as any,
          severity: "error" as any,
          message:
            error instanceof Error ? error.message : "PDF generation failed",
          field: "pdf-generation",
        },
      });
    }
  }, [state.resumeData, state.selectedTemplate, dispatch]);

  const generateFilename = (fullName: string): string => {
    // Clean the name to remove special characters
    const cleanName = fullName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_");

    // Format date as YYYY-MM-DD
    const date = new Date().toISOString().split("T")[0];

    return `Resume_${cleanName}_${date}.pdf`;
  };

  const resetDownload = () => {
    if (downloadState.downloadUrl) {
      URL.revokeObjectURL(downloadState.downloadUrl);
    }
    setDownloadState({
      isGenerating: false,
      progress: 0,
      error: null,
      success: false,
      downloadUrl: null,
      generationTime: null,
    });
    dispatch({ type: "CLEAR_ERRORS" });
  };

  const goBackToPreview = () => {
    resetDownload();
    dispatch({ type: "SET_STEP", payload: "preview" });
  };

  const startOver = () => {
    resetDownload();
    dispatch({ type: "RESET_STATE" });
  };

  // Check if we have the required data
  const hasRequiredData = state.resumeData && state.selectedTemplate;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Download Your Resume
        </h2>
        <p className="text-lg text-gray-600">
          Your ATS-friendly PDF resume is ready to be generated and downloaded.
        </p>
      </div>

      {!hasRequiredData ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-yellow-600 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                Missing Required Data
              </h3>
              <p className="text-yellow-700 mt-1">
                Please complete the previous steps to upload your resume and
                select a template.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => dispatch({ type: "SET_STEP", payload: "upload" })}
              className="btn-primary"
            >
              Go to Upload Step
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resume Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Resume Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">
                  {state.resumeData.personalInfo.fullName}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Template:</span>
                <span className="ml-2 text-gray-900">
                  {state.selectedTemplate}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Experience Entries:
                </span>
                <span className="ml-2 text-gray-900">
                  {state.resumeData.experience.length}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Education Entries:
                </span>
                <span className="ml-2 text-gray-900">
                  {state.resumeData.education.length}
                </span>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {!downloadState.isGenerating &&
              !downloadState.success &&
              !downloadState.error && (
                <div className="text-center">
                  <div className="mb-6">
                    <svg
                      className="w-16 h-16 text-blue-500 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Ready to Download
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Click the button below to generate and download your
                      ATS-optimized PDF resume.
                    </p>
                  </div>
                  <button
                    onClick={generateAndDownloadPDF}
                    className="btn-primary btn-lg"
                  >
                    Generate & Download PDF
                  </button>
                </div>
              )}

            {downloadState.isGenerating && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Generating PDF...
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Please wait while we create your ATS-optimized resume.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${downloadState.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  {downloadState.progress}% complete
                </p>
              </div>
            )}

            {downloadState.success && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-green-500 mx-auto mb-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-green-900 mb-2">
                    Download Successful!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Your resume has been generated and downloaded successfully.
                  </p>
                  {downloadState.generationTime && (
                    <p className="text-sm text-gray-600 mb-4">
                      Generation time: {downloadState.generationTime}ms
                      {downloadState.generationTime > 3000 && (
                        <span className="text-yellow-600 ml-2">
                          (Slower than target 3s)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={generateAndDownloadPDF}
                    className="btn-primary w-full"
                  >
                    Download Again
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={goBackToPreview}
                      className="btn-secondary flex-1"
                    >
                      Back to Preview
                    </button>
                    <button
                      onClick={startOver}
                      className="btn-secondary flex-1"
                    >
                      Create New Resume
                    </button>
                  </div>
                </div>
              </div>
            )}

            {downloadState.error && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-red-500 mx-auto mb-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-red-900 mb-2">
                    Download Failed
                  </h3>
                  <p className="text-red-700 mb-4">{downloadState.error}</p>
                  {downloadState.generationTime && (
                    <p className="text-sm text-gray-600 mb-4">
                      Failed after: {downloadState.generationTime}ms
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={generateAndDownloadPDF}
                    className="btn-primary w-full"
                  >
                    Try Again
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={goBackToPreview}
                      className="btn-secondary flex-1"
                    >
                      Back to Preview
                    </button>
                    <button
                      onClick={resetDownload}
                      className="btn-secondary flex-1"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ATS Optimization Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-600 mr-3 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  ATS Optimization Features
                </h3>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Standard fonts (Arial, Calibri, Times New Roman)</li>
                  <li>• No tables, text boxes, or complex formatting</li>
                  <li>• Searchable and parseable text</li>
                  <li>• Clean section headers and consistent spacing</li>
                  <li>• Compatible with major ATS systems</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
