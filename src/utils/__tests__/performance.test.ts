import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PerformanceMonitor from '../performanceMonitor';
import BundleAnalyzer from '../bundleAnalyzer';

// Mock performance API
const mockPerformance = {
    now: vi.fn(() => Date.now()),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
};

// Mock PerformanceObserver
class MockPerformanceObserver {
    private callback: (list: any) => void;

    constructor(callback: (list: any) => void) {
        this.callback = callback;
    }

    observe() {
        // Mock implementation
    }

    disconnect() {
        // Mock implementation
    }
}

describe('PerformanceMonitor', () => {
    let performanceMonitor: PerformanceMonitor;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Mock NODE_ENV for development mode
        process.env.NODE_ENV = 'development';

        // Mock global performance with default empty arrays
        mockPerformance.getEntriesByType.mockReturnValue([]);
        mockPerformance.getEntriesByName.mockReturnValue([]);

        global.performance = mockPerformance as any;
        global.PerformanceObserver = MockPerformanceObserver as any;

        // Mock window and document
        global.window = {
            addEventListener: vi.fn(),
        } as any;

        global.document = {
            readyState: 'complete',
        } as any;

        // Clear singleton instance for clean tests
        (PerformanceMonitor as any).instance = undefined;
        performanceMonitor = PerformanceMonitor.getInstance();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should be a singleton', () => {
        const instance1 = PerformanceMonitor.getInstance();
        const instance2 = PerformanceMonitor.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should measure component load time', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        // Mock performance.now to return increasing values
        let timeCounter = 0;
        mockPerformance.now.mockImplementation(() => timeCounter += 100);

        const endMeasurement = performanceMonitor.measureComponentLoad('TestComponent');
        endMeasurement();

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('TestComponent loaded in')
        );

        consoleSpy.mockRestore();
    });

    it('should measure async operations', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        // Mock performance.now to return increasing values
        let timeCounter = 0;
        mockPerformance.now.mockImplementation(() => timeCounter += 50);

        const mockOperation = vi.fn().mockResolvedValue('result');

        const result = await performanceMonitor.measureAsyncOperation(
            'TestOperation',
            mockOperation
        );

        expect(result).toBe('result');
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('TestOperation completed in')
        );

        consoleSpy.mockRestore();
    });

    it('should get performance metrics', () => {
        // Mock navigation timing
        mockPerformance.getEntriesByType.mockReturnValue([
            {
                fetchStart: 0,
                loadEventEnd: 1500,
                domContentLoadedEventEnd: 1000,
            }
        ]);

        const metrics = performanceMonitor.getMetrics();

        expect(metrics).toHaveProperty('loadTime');
        expect(metrics).toHaveProperty('domContentLoaded');
    });
});

describe('BundleAnalyzer', () => {
    let bundleAnalyzer: BundleAnalyzer;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Mock NODE_ENV for development mode
        process.env.NODE_ENV = 'development';

        // Mock global performance with default empty arrays
        mockPerformance.getEntriesByType.mockReturnValue([]);
        mockPerformance.getEntriesByName.mockReturnValue([]);

        global.performance = mockPerformance as any;
        global.PerformanceObserver = MockPerformanceObserver as any;
        global.window = {
            addEventListener: vi.fn(),
        } as any;

        // Clear singleton instance for clean tests
        (BundleAnalyzer as any).instance = undefined;
        bundleAnalyzer = BundleAnalyzer.getInstance();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should be a singleton', () => {
        const instance1 = BundleAnalyzer.getInstance();
        const instance2 = BundleAnalyzer.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should analyze bundle size', async () => {
        // Mock resource timing entries
        mockPerformance.getEntriesByType.mockReturnValue([
            {
                name: 'https://example.com/app.js',
                transferSize: 500 * 1024, // 500KB
            },
            {
                name: 'https://example.com/vendor.js',
                transferSize: 300 * 1024, // 300KB
            },
            {
                name: 'https://example.com/styles.css',
                transferSize: 50 * 1024, // 50KB
            },
        ]);

        // Mock window.addEventListener to immediately call the callback
        global.window.addEventListener = vi.fn((event, callback) => {
            if (event === 'load') {
                setTimeout(callback, 0);
            }
        });

        const bundleInfo = await bundleAnalyzer.analyzeBundleSize();

        expect(bundleInfo.totalSize).toBe(850 * 1024); // 850KB total
        expect(bundleInfo.chunks).toHaveLength(3);
    });

    it('should check bundle targets and provide recommendations', async () => {
        // Mock a large bundle that exceeds target
        mockPerformance.getEntriesByType.mockReturnValue([
            {
                name: 'https://example.com/large-app.js',
                transferSize: 1200 * 1024, // 1.2MB - exceeds 1MB target
            },
        ]);

        global.window.addEventListener = vi.fn((event, callback) => {
            if (event === 'load') {
                setTimeout(callback, 0);
            }
        });

        const analysis = await bundleAnalyzer.checkBundleTargets();

        expect(analysis.meetsTarget).toBe(false);
        expect(analysis.totalSize).toBe(1200 * 1024);
        expect(analysis.recommendations.length).toBeGreaterThan(0);



        expect(analysis.recommendations).toContain(
            'Consider code splitting for large components'
        );
    });

    it('should pass bundle targets for small bundles', async () => {
        // Mock a small bundle that meets target
        mockPerformance.getEntriesByType.mockReturnValue([
            {
                name: 'https://example.com/small-app.js',
                transferSize: 500 * 1024, // 500KB - under 1MB target
            },
        ]);

        global.window.addEventListener = vi.fn((event, callback) => {
            if (event === 'load') {
                setTimeout(callback, 0);
            }
        });

        const analysis = await bundleAnalyzer.checkBundleTargets();

        expect(analysis.meetsTarget).toBe(true);
        expect(analysis.totalSize).toBe(500 * 1024);
        expect(analysis.recommendations).toHaveLength(0);
    });
});

describe('Performance Requirements', () => {
    it('should meet 2-second load time requirement', () => {
        // Mock NODE_ENV for development mode
        process.env.NODE_ENV = 'development';

        // Mock navigation timing that meets the requirement
        mockPerformance.getEntriesByType.mockReturnValue([
            {
                fetchStart: 0,
                loadEventEnd: 1800, // 1.8 seconds - under 2 second target
                domContentLoadedEventEnd: 1200,
            }
        ]);

        // Clear singleton instance for clean test
        (PerformanceMonitor as any).instance = undefined;
        const performanceMonitor = PerformanceMonitor.getInstance();
        const metrics = performanceMonitor.getMetrics();

        // Verify load time is under 2 seconds (2000ms)
        expect(metrics.loadTime).toBeLessThan(2000);
    });

    it('should warn when load time exceeds 2 seconds', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        // Mock NODE_ENV for development mode
        process.env.NODE_ENV = 'development';

        // Mock navigation timing that exceeds the requirement
        mockPerformance.getEntriesByType.mockReturnValue([
            {
                fetchStart: 0,
                loadEventEnd: 2500, // 2.5 seconds - exceeds 2 second target
                domContentLoadedEventEnd: 1500,
            }
        ]);

        // Clear singleton instance for clean test
        (PerformanceMonitor as any).instance = undefined;
        const performanceMonitor = PerformanceMonitor.getInstance();
        performanceMonitor.logMetrics();

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Load time')
        );
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('exceeds 2-second target')
        );

        consoleSpy.mockRestore();
    });
});