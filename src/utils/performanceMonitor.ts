/**
 * Performance monitoring utilities for tracking load times and bundle size
 */

interface PerformanceMetrics {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    cumulativeLayoutShift?: number;
    firstInputDelay?: number;
}

class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetrics = {
        loadTime: 0,
        domContentLoaded: 0,
    };

    private constructor() {
        this.initializeMetrics();
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    private initializeMetrics(): void {
        // Wait for page load to calculate metrics
        if (document.readyState === 'complete') {
            this.calculateMetrics();
        } else {
            window.addEventListener('load', () => this.calculateMetrics());
        }
    }

    private calculateMetrics(): void {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
            this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
            this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        }

        // Get Web Vitals if available
        this.getWebVitals();
    }

    private getWebVitals(): void {
        // First Contentful Paint
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
            this.metrics.firstContentfulPaint = fcpEntry.startTime;
        }

        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.largestContentfulPaint = lastEntry.startTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // Cumulative Layout Shift
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!(entry as any).hadRecentInput) {
                            clsValue += (entry as any).value;
                        }
                    }
                    this.metrics.cumulativeLayoutShift = clsValue;
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // First Input Delay
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (error) {
                // PerformanceObserver not supported or failed
                console.warn('Performance monitoring not fully supported:', error);
            }
        }
    }

    public getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    public logMetrics(): void {
        if (process.env.NODE_ENV === 'development') {
            console.group('Performance Metrics');
            console.log(`Load Time: ${this.metrics.loadTime.toFixed(2)}ms`);
            console.log(`DOM Content Loaded: ${this.metrics.domContentLoaded.toFixed(2)}ms`);

            if (this.metrics.firstContentfulPaint) {
                console.log(`First Contentful Paint: ${this.metrics.firstContentfulPaint.toFixed(2)}ms`);
            }

            if (this.metrics.largestContentfulPaint) {
                console.log(`Largest Contentful Paint: ${this.metrics.largestContentfulPaint.toFixed(2)}ms`);
            }

            if (this.metrics.cumulativeLayoutShift !== undefined) {
                console.log(`Cumulative Layout Shift: ${this.metrics.cumulativeLayoutShift.toFixed(4)}`);
            }

            if (this.metrics.firstInputDelay !== undefined) {
                console.log(`First Input Delay: ${this.metrics.firstInputDelay.toFixed(2)}ms`);
            }

            console.groupEnd();

            // Check if we meet the 2-second load time requirement
            if (this.metrics.loadTime > 2000) {
                console.warn(`⚠️ Load time (${this.metrics.loadTime.toFixed(2)}ms) exceeds 2-second target`);
            } else {
                console.log(`✅ Load time (${this.metrics.loadTime.toFixed(2)}ms) meets 2-second target`);
            }
        }
    }

    public measureComponentLoad(componentName: string): () => void {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const loadTime = endTime - startTime;

            if (process.env.NODE_ENV === 'development') {
                console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
            }
        };
    }

    public measureAsyncOperation<T>(
        operationName: string,
        operation: () => Promise<T>
    ): Promise<T> {
        const startTime = performance.now();

        return operation().finally(() => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            if (process.env.NODE_ENV === 'development') {
                console.log(`${operationName} completed in ${duration.toFixed(2)}ms`);
            }
        });
    }
}

export default PerformanceMonitor;