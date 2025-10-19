import { Suspense, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import type { AppStep } from "../types";
import {
  withLazyLoading,
  preloadComponent,
  LoadingFallback,
} from "../utils/lazyLoading";

// Lazy load step components for better code splitting
const UploadStep = withLazyLoading(
  () => import("./steps/UploadStep"),
  "Loading upload interface..."
);

const ParseStep = withLazyLoading(
  () => import("./steps/ParseStep"),
  "Loading parser..."
);

const TemplateStep = withLazyLoading(
  () => import("./steps/TemplateStep"),
  "Loading templates..."
);

const PreviewStep = withLazyLoading(
  () => import("./steps/PreviewStep"),
  "Loading preview..."
);

const DownloadStep = withLazyLoading(
  () => import("./steps/DownloadStep"),
  "Loading download interface..."
);

export function StepRouter() {
  const { state, dispatch } = useAppContext();

  // Preload next step component for better perceived performance
  useEffect(() => {
    const steps: AppStep[] = [
      "upload",
      "parse",
      "template",
      "preview",
      "download",
    ];
    const currentIndex = steps.indexOf(state.currentStep);
    const nextStep = steps[currentIndex + 1];

    // Preload the next step component
    if (nextStep) {
      switch (nextStep) {
        case "parse":
          preloadComponent(() => import("./steps/ParseStep"));
          break;
        case "template":
          preloadComponent(() => import("./steps/TemplateStep"));
          break;
        case "preview":
          preloadComponent(() => import("./steps/PreviewStep"));
          break;
        case "download":
          preloadComponent(() => import("./steps/DownloadStep"));
          break;
      }
    }
  }, [state.currentStep]);

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case "upload":
        return <UploadStep />;
      case "parse":
        return <ParseStep />;
      case "template":
        return <TemplateStep />;
      case "preview":
        return <PreviewStep />;
      case "download":
        return <DownloadStep />;
      default:
        return <UploadStep />;
    }
  };

  const handleStepNavigation = (step: AppStep) => {
    dispatch({ type: "SET_STEP", payload: step });
  };

  return (
    <div className="min-h-96">
      <Suspense fallback={<LoadingFallback message="Loading step..." />}>
        {renderCurrentStep()}
      </Suspense>

      {/* Navigation buttons for testing - will be replaced by step-specific navigation */}
      <div className="border-t border-gray-200/30 px-8 py-8 bg-white/30 backdrop-blur-sm">
        <div className="flex justify-between">
          <button
            onClick={() => {
              const steps: AppStep[] = [
                "upload",
                "parse",
                "template",
                "preview",
                "download",
              ];
              const currentIndex = steps.indexOf(state.currentStep);
              if (currentIndex > 0) {
                handleStepNavigation(steps[currentIndex - 1]);
              }
            }}
            disabled={state.currentStep === "upload"}
            className="btn-secondary py-3 px-6 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={() => {
              const steps: AppStep[] = [
                "upload",
                "parse",
                "template",
                "preview",
                "download",
              ];
              const currentIndex = steps.indexOf(state.currentStep);
              if (currentIndex < steps.length - 1) {
                handleStepNavigation(steps[currentIndex + 1]);
              }
            }}
            disabled={state.currentStep === "download"}
            className="btn-primary py-3 px-6 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
          >
            Next
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
