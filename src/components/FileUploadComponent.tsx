import React, { useState, useRef, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { ErrorType, ErrorSeverity } from "../types/errors";
import type { FileError } from "../types/errors";
import { RetryUtils } from "../utils/retryMechanism";
import {
  BrowserCompatibility,
  GracefulDegradation,
} from "../utils/browserCompatibility";
import { errorFactory } from "../utils/errorFactory";
import { withErrorBoundary } from "./ErrorBoundary";

interface FileUploadComponentProps {
  onFileSelect?: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  className?: string;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onFileSelect,
  acceptedTypes = [".md"],
  maxSizeBytes = 5 * 1024 * 1024, // 5MB default
  className = "",
}) => {
  const { state, dispatch } = useAppContext();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation function
  const validateFile = useCallback(
    (file: File): FileError | null => {
      // Check file size
      if (file.size > maxSizeBytes) {
        return errorFactory.createFileError(
          `File size ${file.size} bytes exceeds maximum allowed size of ${maxSizeBytes} bytes`,
          `File size (${(file.size / (1024 * 1024)).toFixed(
            1
          )}MB) exceeds the 5MB limit. Please choose a smaller file.`,
          {
            severity: "HIGH",
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          }
        );
      }

      // Check file extension
      const nameParts = file.name.split(".");
      const fileExtension =
        nameParts.length > 1 ? "." + nameParts.pop()?.toLowerCase() : "";
      if (!acceptedTypes.includes(fileExtension)) {
        return errorFactory.createFileError(
          `File type ${fileExtension} is not supported. Accepted types: ${acceptedTypes.join(
            ", "
          )}`,
          `Please select a Markdown file (.md). Other file types are not supported.`,
          {
            severity: "HIGH",
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          }
        );
      }

      return null;
    },
    [acceptedTypes, maxSizeBytes]
  );

  // Handle file processing with retry mechanism
  const processFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      dispatch({ type: "CLEAR_ERRORS" });

      try {
        // Check browser compatibility first
        const fileSupport = BrowserCompatibility.checkFeatureSupport("fileAPI");
        if (!fileSupport.supported) {
          const error = errorFactory.createFileError(
            "File API not supported",
            "Your browser does not support file uploads. Please try using the text input option instead.",
            {
              severity: "HIGH",
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              context: { browserCompatibility: false },
            }
          );
          dispatch({ type: "ADD_ERROR", payload: error });
          return;
        }

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          dispatch({ type: "ADD_ERROR", payload: validationError });
          return;
        }

        // Read file content with retry mechanism
        const content = await RetryUtils.retryFileOperation(
          () => readFileContent(file),
          (attempt, error) => {
            console.log(`File read attempt ${attempt} failed:`, error);
          }
        );

        // Update app state
        dispatch({ type: "SET_UPLOADED_FILE", payload: file });
        dispatch({ type: "SET_MARKDOWN_CONTENT", payload: content });

        // Call optional callback
        if (onFileSelect) {
          onFileSelect(file);
        }
      } catch (error) {
        const fileError = errorFactory.createFileError(
          `Failed to read file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "Failed to read the selected file. Please try again or choose a different file.",
          {
            severity: "CRITICAL",
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            context: { originalError: error },
          }
        );
        dispatch({ type: "ADD_ERROR", payload: fileError });
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onFileSelect, dispatch]
  );

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  // File input handler
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  // Click handler to trigger file input
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Get current errors related to file upload
  const fileErrors = state.errors.filter(
    (error) => error.type === "FILE_UPLOAD"
  );

  // Check for graceful degradation
  const fileUploadSupport = GracefulDegradation.handleFileUpload();

  // If file upload is not supported, show text-only message
  if (fileUploadSupport.method === "text-only") {
    return (
      <div className={`file-upload-component ${className}`}>
        <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg p-8 text-center">
          <svg
            className="w-12 h-12 text-yellow-400 mb-4 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            File Upload Not Supported
          </h3>
          <p className="text-yellow-700 mb-4">{fileUploadSupport.message}</p>
          <p className="text-sm text-yellow-600">
            Please use the text input option to paste your resume content
            directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`file-upload-component ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="sr-only"
        data-testid="file-input"
        id="file-upload-input"
        aria-describedby="file-upload-description file-upload-requirements"
      />

      {/* Show degradation warning if drag-and-drop is not supported */}
      {fileUploadSupport.method === "file-input" &&
        fileUploadSupport.message && (
          <div className="mb-4 notification-accessible" role="status">
            <div className="flex">
              <svg
                className="w-5 h-5 text-yellow-400 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-700">
                {fileUploadSupport.message}
              </p>
            </div>
          </div>
        )}

      {/* Drop zone */}
      <div
        className={`
          dropzone-accessible focus-ring
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          ${fileErrors.length > 0 ? "border-red-300 bg-red-50" : ""}
        `}
        onDragEnter={
          fileUploadSupport.method === "drag-drop" ? handleDragEnter : undefined
        }
        onDragLeave={
          fileUploadSupport.method === "drag-drop" ? handleDragLeave : undefined
        }
        onDragOver={
          fileUploadSupport.method === "drag-drop" ? handleDragOver : undefined
        }
        onDrop={
          fileUploadSupport.method === "drag-drop" ? handleDrop : undefined
        }
        onClick={!isUploading ? handleClick : undefined}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isUploading) {
            e.preventDefault();
            handleClick();
          }
        }}
        data-testid="drop-zone"
        role="button"
        tabIndex={isUploading ? -1 : 0}
        aria-label={
          fileUploadSupport.method === "drag-drop"
            ? "Upload area: drag and drop your Markdown file here, or press Enter to browse files"
            : "Upload area: press Enter to browse and select your Markdown file"
        }
        aria-describedby="file-upload-description file-upload-requirements"
        aria-expanded={isDragOver}
        aria-invalid={fileErrors.length > 0}
        aria-disabled={isUploading}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div
              className="loading-spinner mb-4"
              aria-hidden="false"
              role="status"
              aria-label="Processing file"
            ></div>
            <p className="text-gray-600" aria-live="polite">
              Processing file...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload your resume
            </h3>
            <p className="text-gray-600 mb-4" id="file-upload-description">
              {fileUploadSupport.method === "drag-drop"
                ? "Drag and drop your Markdown file here, or click to browse"
                : "Click to browse and select your Markdown file"}
            </p>
            <p className="text-sm text-gray-500" id="file-upload-requirements">
              Supports .md files up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* Error messages */}
      {fileErrors.length > 0 && (
        <div className="mt-4 space-y-2" role="alert" aria-live="polite">
          <h4 className="sr-only">File upload errors</h4>
          {fileErrors.map((error, index) => (
            <div
              key={error.id}
              className="notification-accessible"
              role="alert"
              data-testid="error-message"
              aria-describedby={`error-detail-${index}`}
            >
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {error.userMessage}
                  </p>
                  {error.details && (
                    <p
                      id={`error-detail-${index}`}
                      className="text-sm text-red-600 mt-1"
                    >
                      {error.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success message */}
      {state.uploadedFile && fileErrors.length === 0 && (
        <div className="mt-4" role="status" aria-live="polite">
          <div
            className="notification-accessible"
            role="status"
            data-testid="success-message"
            aria-describedby="upload-success-detail"
          >
            <div className="flex">
              <svg
                className="w-5 h-5 text-green-400 mr-2 mt-0.5"
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
              <div>
                <p className="text-sm font-medium text-green-800">
                  File uploaded successfully: {state.uploadedFile.name}
                </p>
                <p
                  id="upload-success-detail"
                  className="text-sm text-green-600"
                >
                  Size: {(state.uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export with error boundary
export default withErrorBoundary(FileUploadComponent, {
  level: "component",
  onError: (error) => {
    console.error("FileUploadComponent error:", error);
  },
});
