/**
 * ResumePreview component for displaying real-time preview of the generated resume
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { getTemplateById } from "../templates/templateRegistry";
import { templateRenderer } from "../templates/templateRenderer";
import type { ResumeData, Template } from "../types";
import "./ResumePreview.css";

interface ResumePreviewProps {
  resumeData?: ResumeData;
  template?: Template;
  className?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData: propResumeData,
  template: propTemplate,
  className = "",
}) => {
  const { state, dispatch } = useAppContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [error, setError] = useState<string | null>(null);

  // Use props if provided, otherwise use context state
  const resumeData = propResumeData || state.resumeData;

  // Handle template resolution more robustly
  let selectedTemplate: Template | null = null;

  if (propTemplate) {
    // If template is passed as prop, use it directly or resolve it
    selectedTemplate =
      typeof propTemplate === "string"
        ? getTemplateById(propTemplate)
        : propTemplate;
  } else if (state.selectedTemplate) {
    // Otherwise use the template from state
    selectedTemplate = getTemplateById(state.selectedTemplate);
  }

  // Fallback to default template if none found
  if (!selectedTemplate && (state.selectedTemplate || propTemplate)) {
    console.warn("Template not found, using default template");
    selectedTemplate = getTemplateById("professional") || null;
  }

  // Generate preview content
  const generatePreview = useCallback(async (): Promise<string> => {
    if (!resumeData || !selectedTemplate) {
      return '<div class="preview-placeholder">No data or template selected</div>';
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use template renderer to generate preview HTML
      const previewHTML = await Promise.resolve(
        templateRenderer.renderPreview(resumeData, selectedTemplate)
      );

      return previewHTML;
    } catch (err) {
      console.error("Preview generation error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate preview";
      setError(errorMessage);
      return `<div class="preview-error">Error generating preview: ${errorMessage}</div>`;
    } finally {
      setIsLoading(false);
    }
  }, [resumeData, selectedTemplate]);

  // Update preview when data or template changes
  const refreshPreview = useCallback(async () => {
    const previewHTML = await generatePreview();

    // Update context with new preview content
    dispatch({ type: "SET_PREVIEW_CONTENT", payload: previewHTML });

    // Update the preview container
    if (previewRef.current) {
      previewRef.current.innerHTML = previewHTML;
    }
  }, [generatePreview, dispatch]);

  // Handle zoom changes
  const handleZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(0.3, Math.min(1.5, newZoom));
    setZoomLevel(clampedZoom);

    if (previewRef.current) {
      const previewContainer = previewRef.current.querySelector(
        ".resume-container.preview"
      ) as HTMLElement;
      if (previewContainer) {
        previewContainer.style.transform = `scale(${clampedZoom})`;
        previewContainer.style.width = `${100 / clampedZoom}%`;
        previewContainer.style.height = `${100 / clampedZoom}%`;
      }
    }
  }, []);

  // Initial preview generation and updates when dependencies change
  useEffect(() => {
    refreshPreview();
  }, [refreshPreview]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`resume-preview-container ${className}`}>
        <div className="preview-loading">
          <div className="loading-spinner"></div>
          <p>Generating preview...</p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!resumeData) {
    return (
      <div className={`resume-preview-container ${className}`}>
        <div className="preview-placeholder">
          <div className="placeholder-content">
            <svg
              className="placeholder-icon"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            <h3>No Resume Data</h3>
            <p>
              Upload a Markdown file or enter text to see your resume preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle no template state
  if (!selectedTemplate) {
    return (
      <div className={`resume-preview-container ${className}`}>
        <div className="preview-placeholder">
          <div className="placeholder-content">
            <svg
              className="placeholder-icon"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
            <h3>No Template Selected</h3>
            <p>Choose a template to see your resume preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`resume-preview-container ${className}`}>
      {/* Preview Controls */}
      <div className="preview-controls">
        <div className="zoom-controls">
          <button
            onClick={() => handleZoom(zoomLevel - 0.1)}
            disabled={zoomLevel <= 0.3}
            className="zoom-btn"
            aria-label="Zoom out"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>

          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>

          <button
            onClick={() => handleZoom(zoomLevel + 0.1)}
            disabled={zoomLevel >= 1.5}
            className="zoom-btn"
            aria-label="Zoom in"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>

          <button
            onClick={() => handleZoom(1)}
            className="zoom-btn reset-zoom"
            aria-label="Reset zoom"
          >
            100%
          </button>
        </div>

        <div className="preview-info">
          <span className="template-name">{selectedTemplate.name}</span>
          {error && <span className="preview-error-indicator">⚠️ Error</span>}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="preview-error-banner">
          <p>Preview Error: {error}</p>
          <button onClick={refreshPreview} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Preview Content */}
      <div className="preview-content">
        <div
          ref={previewRef}
          className="preview-wrapper"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left",
            width: `${100 / zoomLevel}%`,
            height: `${100 / zoomLevel}%`,
          }}
          dangerouslySetInnerHTML={{ __html: state.previewContent }}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="preview-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
