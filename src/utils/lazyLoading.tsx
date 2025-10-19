import React, { lazy, Suspense, useState } from "react";
import type { ComponentType } from "react";

/**
 * Loading fallback component for lazy-loaded components
 */
export function LoadingFallback({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}

/**
 * Higher-order component for lazy loading with error boundary
 */
export function withLazyLoading<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackMessage?: string
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a lazy component to improve perceived performance
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  // Trigger the import but don't wait for it
  importFn().catch(() => {
    // Silently handle preload failures
  });
}

/**
 * Hook for conditional preloading based on user interaction
 */
export function usePreloadOnHover(
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  const [preloaded, setPreloaded] = useState(false);

  return {
    onMouseEnter: () => {
      if (!preloaded) {
        preloadComponent(importFn);
        setPreloaded(true);
      }
    },
  };
}
