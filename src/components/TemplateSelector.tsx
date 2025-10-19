/**
 * TemplateSelector component for template preview and selection
 */

import React from "react";
import type { Template, ResumeData } from "../types";
import { templates } from "../templates";
import { templateRenderer } from "../templates/templateRenderer";

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  resumeData?: ResumeData;
  className?: string;
}

interface TemplatePreviewProps {
  template: Template;
  isSelected: boolean;
  onClick: () => void;
  resumeData?: ResumeData;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isSelected,
  onClick,
  resumeData,
}) => {
  const sampleData: ResumeData = resumeData || {
    personalInfo: {
      fullName: "John Doe",
      email: "john.doe@email.com",
      phone: "(555) 123-4567",
      location: "New York, NY",
      linkedin: "https://linkedin.com/in/johndoe",
    },
    summary:
      "Experienced professional with expertise in software development and project management.",
    experience: [
      {
        jobTitle: "Senior Software Engineer",
        company: "Tech Company Inc.",
        duration: "2020 - Present",
        accomplishments: [
          "Led development of key features resulting in 25% performance improvement",
          "Mentored junior developers and established coding standards",
        ],
        isCurrentRole: true,
      },
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "University of Technology",
        graduationDate: "2018",
      },
    ],
    skills: {
      technical: ["JavaScript", "React", "Node.js", "Python"],
      languages: ["English (Native)", "Spanish (Conversational)"],
    },
  };

  const previewHTML = templateRenderer.renderPreview(sampleData, template);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`template-option template-preview-container focus-ring cursor-pointer ${
        isSelected
          ? "ring-2 ring-blue-500 bg-blue-50"
          : "hover:ring-1 hover:ring-gray-300 hover:bg-gray-50"
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="radio"
      tabIndex={0}
      aria-checked={isSelected}
      aria-labelledby={`template-${template.id}-name`}
      aria-describedby={`template-${template.id}-description template-${template.id}-features`}
    >
      <div className="template-preview-header p-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="font-semibold text-gray-900"
              id={`template-${template.id}-name`}
            >
              {template.name}
            </h3>
            <p
              className="text-sm text-gray-600"
              id={`template-${template.id}-description`}
            >
              {template.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {template.atsOptimized && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                id={`template-${template.id}-features`}
                aria-label="This template is optimized for ATS systems"
              >
                ATS Optimized
              </span>
            )}
            {isSelected && (
              <div
                className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="template-preview-content bg-gray-100 p-4 overflow-hidden">
        <div
          className="template-preview-iframe bg-white shadow-sm"
          style={{
            height: "300px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
          }}
          dangerouslySetInnerHTML={{ __html: previewHTML }}
          aria-label={`Preview of ${template.name} template`}
          role="img"
        />
      </div>
    </div>
  );
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  resumeData,
  className = "",
}) => {
  const handleKeyNavigation = (e: React.KeyboardEvent, templateId: string) => {
    const currentIndex = templates.findIndex((t) => t.id === templateId);
    let newIndex = currentIndex;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        newIndex = Math.min(currentIndex + 1, templates.length - 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = templates.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      e.preventDefault();
      const newTemplate = templates[newIndex];
      if (newTemplate) {
        onTemplateSelect(newTemplate.id);
        // Focus the new template
        const templateElement = document.querySelector(
          `[aria-labelledby="template-${newTemplate.id}-name"]`
        ) as HTMLElement;
        templateElement?.focus();
      }
    }
  };

  return (
    <div className={`template-selector ${className}`}>
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-gray-900 mb-2"
          id="template-selector-heading"
        >
          Choose Your Template
        </h2>
        <p className="text-gray-600" id="template-selector-description">
          Select a professional template for your resume. All templates are
          optimized for ATS systems.
        </p>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        role="radiogroup"
        aria-labelledby="template-selector-heading"
        aria-describedby="template-selector-description"
        onKeyDown={(e) => {
          const focusedElement = document.activeElement as HTMLElement;
          const templateId = focusedElement
            ?.getAttribute("aria-labelledby")
            ?.replace("template-", "")
            .replace("-name", "");
          if (templateId) {
            handleKeyNavigation(e, templateId);
          }
        }}
      >
        {templates.map((template) => (
          <TemplatePreview
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onClick={() => onTemplateSelect(template.id)}
            resumeData={resumeData}
          />
        ))}
      </div>

      <div
        className="mt-6 p-4 bg-blue-50 rounded-lg"
        role="region"
        aria-labelledby="ats-info-heading"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0" aria-hidden="true">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3
              className="text-sm font-medium text-blue-800"
              id="ats-info-heading"
            >
              ATS-Friendly Design
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                All templates use standard fonts, avoid complex formatting, and
                follow ATS best practices to ensure your resume passes automated
                screening systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
