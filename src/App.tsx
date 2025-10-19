import { useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import { Layout, StepRouter } from "./components";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorNotification } from "./components/ErrorNotification";
import { initializeGlobalErrorHandling } from "./utils/globalErrorHandler";
import { BrowserCompatibility } from "./utils/browserCompatibility";
import { AccessibilityManager } from "./utils/accessibility";
import PerformanceMonitor from "./utils/performanceMonitor";
import BundleAnalyzer from "./utils/bundleAnalyzer";
import {
  addResourceHints,
  registerServiceWorker,
} from "./utils/performanceOptimizer";
import { preloadCriticalDependencies } from "./utils/dynamicImports";
import "./styles/accessibility.css";

function App() {
  useEffect(() => {
    // Add resource hints for better performance
    addResourceHints();

    // Register service worker for caching
    registerServiceWorker();

    // Preload critical dependencies
    preloadCriticalDependencies();

    // Initialize accessibility manager
    AccessibilityManager.getInstance();

    // Initialize performance monitoring
    const performanceMonitor = PerformanceMonitor.getInstance();
    const bundleAnalyzer = BundleAnalyzer.getInstance();

    // Initialize global error handling
    const globalErrorHandler = initializeGlobalErrorHandling({
      enableConsoleLogging: process.env.NODE_ENV === "development",
      enableUserNotifications: true,
      enableErrorReporting: false, // Set to true when you have an error reporting service
      onError: (error) => {
        // Custom error handling logic can go here
        if (process.env.NODE_ENV === "development") {
          console.log("Custom error handler:", error);
        }
      },
    });

    // Check browser compatibility on app start
    const compatibility = BrowserCompatibility.checkFeatureSupport("fileAPI");
    if (!compatibility.supported) {
      console.error("Browser compatibility issues:", compatibility.fallback);
    }

    // Start performance monitoring
    if (process.env.NODE_ENV === "development") {
      // Log performance metrics after a short delay to ensure all resources are loaded
      setTimeout(() => {
        performanceMonitor.logMetrics();
        bundleAnalyzer.logBundleAnalysis();
      }, 1000);

      // Monitor chunk loading
      bundleAnalyzer.monitorChunkLoading();
    }

    // Cleanup on unmount
    return () => {
      globalErrorHandler.cleanup();
    };
  }, []);

  return (
    <ErrorBoundary level="app">
      <AppProvider>
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Layout>
          <ErrorBoundary level="feature">
            <StepRouter />
          </ErrorBoundary>
        </Layout>
        <ErrorNotification />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
