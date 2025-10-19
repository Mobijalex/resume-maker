/**
 * Performance optimization utilities
 */

// Resource hints for critical resources
export function addResourceHints(): void {
    if (typeof document === 'undefined') return;

    // Preconnect to external resources if any
    const preconnectLinks: string[] = [
        // Add any external domains here
    ];

    preconnectLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        document.head.appendChild(link);
    });
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
): IntersectionObserver | null {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return null;
    }

    return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
    });
}

// Debounce utility for performance-sensitive operations
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Throttle utility for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Memory cleanup utility
export function cleanupMemory(): void {
    // Force garbage collection if available (development only)
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
        (window as any).gc();
    }
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Optimize images for better performance
export function optimizeImage(
    img: HTMLImageElement,
    maxWidth: number = 800,
    quality: number = 0.8
): Promise<string> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            resolve(img.src);
            return;
        }

        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxWidth / height);

        canvas.width = width * ratio;
        canvas.height = height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(URL.createObjectURL(blob));
                } else {
                    resolve(img.src);
                }
            },
            'image/jpeg',
            quality
        );
    });
}

// Critical CSS inlining utility
export function inlineCriticalCSS(css: string): void {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// Service Worker registration for caching
export function registerServiceWorker(): void {
    if (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        process.env.NODE_ENV === 'production'
    ) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Measure and log performance metrics
export function measurePerformance(name: string, fn: () => void): void {
    if (typeof performance === 'undefined') {
        fn();
        return;
    }

    const startTime = performance.now();
    fn();
    const endTime = performance.now();

    if (process.env.NODE_ENV === 'development') {
        console.log(`${name} took ${(endTime - startTime).toFixed(2)}ms`);
    }
}

// Async performance measurement
export async function measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>
): Promise<T> {
    if (typeof performance === 'undefined') {
        return fn();
    }

    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();

    if (process.env.NODE_ENV === 'development') {
        console.log(`${name} took ${(endTime - startTime).toFixed(2)}ms`);
    }

    return result;
}