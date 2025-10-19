import type { AppStep } from "../types";

interface ProgressIndicatorProps {
  currentStep: AppStep;
}

const steps: { key: AppStep; label: string; description: string }[] = [
  {
    key: "upload",
    label: "Upload",
    description: "Upload or input your resume",
  },
  { key: "parse", label: "Parse", description: "Process your content" },
  { key: "template", label: "Template", description: "Choose a template" },
  { key: "preview", label: "Preview", description: "Review your resume" },
  { key: "download", label: "Download", description: "Get your PDF" },
];

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div
      className="w-full py-6"
      role="progressbar"
      aria-label="Resume creation progress"
      data-testid="progress-indicator"
    >
      <ol
        className="flex items-center justify-between"
        aria-label="Progress steps"
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <li key={step.key} className="flex items-center progress-step">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200
                    ${
                      isCompleted
                        ? "bg-primary-600 text-white"
                        : isCurrent
                        ? "bg-primary-100 text-primary-600 border-2 border-primary-600"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={
                    isCompleted
                      ? `Step ${index + 1}: ${step.label} - Completed`
                      : isCurrent
                      ? `Step ${index + 1}: ${step.label} - Current step`
                      : `Step ${index + 1}: ${step.label} - Upcoming`
                  }
                  role="img"
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span aria-hidden="true">{index + 1}</span>
                  )}
                </div>

                {/* Step label and description */}
                <div className="mt-2 text-center">
                  <div
                    className={`
                      text-sm font-medium
                      ${
                        isCurrent
                          ? "text-primary-600"
                          : isCompleted
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    `}
                    id={`step-${index}-label`}
                  >
                    {step.label}
                  </div>
                  <div
                    className="text-xs text-gray-500 mt-1 max-w-20"
                    id={`step-${index}-description`}
                    aria-describedby={`step-${index}-label`}
                  >
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-colors duration-200
                    ${isCompleted ? "bg-primary-600" : "bg-gray-200"}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Screen reader progress announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {currentStepIndex + 1} of {steps.length}:{" "}
        {steps[currentStepIndex]?.label} -{" "}
        {steps[currentStepIndex]?.description}
      </div>
    </div>
  );
}
