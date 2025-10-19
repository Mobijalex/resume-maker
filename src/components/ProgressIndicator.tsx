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
        className="flex items-center justify-between relative"
        aria-label="Progress steps"
      >
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200/50 z-0"></div>
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <li key={step.key} className="flex items-center progress-step relative z-10">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-md
                    ${
                      isCompleted
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-110 shadow-lg"
                        : isCurrent
                        ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-4 border-blue-500 scale-110 shadow-lg"
                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-300"
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
                      className="w-6 h-6"
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
                <div className="mt-3 text-center">
                  <div
                    className={`
                      text-sm font-semibold
                      ${
                        isCurrent
                          ? "text-blue-700"
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
                    className="text-xs text-gray-500 mt-1 max-w-24 truncate"
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
                    flex-1 h-1 transition-all duration-500 -mt-6
                    ${isCompleted ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gray-200"}
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
