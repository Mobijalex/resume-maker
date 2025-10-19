/**
 * Bundle size analysis and optimization utilities
 */

interface BundleInfo {
    totalSize: number;
    gzippedSize?: number;
    chunks: ChunkInfo[];
}

interface ChunkInfo {
    name: string;
    size: number;
    modules: string[];
}

class BundleAnalyzer {
    private static instance: BundleAnalyzer;

    private constructor() { }

    public static getInstance(): BundleAnalyzer {
        if (!BundleAnalyzer.instance) {
            BundleAnalyzer.instance = new BundleAnalyzer();
        }
        return BundleAnalyzer.instance;
    }

    /**
     * Analyze current bundle size using Resource Timing API
     */
    public analyzeBundleSize(): Promise<BundleInfo> {
        return new Promise((resolve) => {
            // Wait for all resources to load
            window.addEventListener('load', () => {
                const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

                let totalSize = 0;
                const chunks: ChunkInfo[] = [];

                resources.forEach((resource) => {
                    if (resource.name.includes('.js') || resource.name.includes('.css')) {
                        const size = resource.transferSize || resource.encodedBodySize || 0;
                        totalSize += size;

                        // Extract chunk name from URL
                        const urlParts = resource.name.split('/');
                        const fileName = urlParts[urlParts.length - 1];

                        chunks.push({
                            name: fileName,
                            size: size,
                            modules: [], // Can't determine modules from Resource Timing API
                        });
                    }
                });

                resolve({
                    totalSize,
                    chunks,
                });
            });
        });
    }

    /**
     * Check if bundle size meets performance targets
     */
    public async checkBundleTargets(): Promise<{
        meetsTarget: boolean;
        totalSize: number;
        targetSize: number;
        recommendations: string[];
    }> {
        const bundleInfo = await this.analyzeBundleSize();
        const targetSize = 1000 * 1024; // 1MB target
        const meetsTarget = bundleInfo.totalSize <= targetSize;

        const recommendations: string[] = [];

        if (!meetsTarget) {
            recommendations.push('Consider code splitting for large components');
            recommendations.push('Enable tree shaking for unused code elimination');
            recommendations.push('Use dynamic imports for non-critical features');

            // Analyze large chunks
            const largeChunks = bundleInfo.chunks.filter(chunk => chunk.size > 100 * 1024);
            if (largeChunks.length > 0) {
                recommendations.push(`Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}`);
            }
        }

        return {
            meetsTarget,
            totalSize: bundleInfo.totalSize,
            targetSize,
            recommendations,
        };
    }

    /**
     * Log bundle analysis results
     */
    public async logBundleAnalysis(): Promise<void> {
        if (process.env.NODE_ENV === 'development') {
            try {
                const analysis = await this.checkBundleTargets();

                console.group('Bundle Analysis');
                console.log(`Total Bundle Size: ${(analysis.totalSize / 1024).toFixed(2)} KB`);
                console.log(`Target Size: ${(analysis.targetSize / 1024).toFixed(2)} KB`);
                console.log(`Meets Target: ${analysis.meetsTarget ? '✅' : '❌'}`);

                if (analysis.recommendations.length > 0) {
                    console.log('Recommendations:');
                    analysis.recommendations.forEach(rec => console.log(`  • ${rec}`));
                }

                console.groupEnd();
            } catch (error) {
                console.warn('Bundle analysis failed:', error);
            }
        }
    }

    /**
     * Monitor chunk loading performance
     */
    public monitorChunkLoading(): void {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        const resource = entry as PerformanceResourceTiming;

                        if (resource.name.includes('.js') && resource.name.includes('chunk')) {
                            const loadTime = resource.responseEnd - resource.requestStart;

                            if (process.env.NODE_ENV === 'development') {
                                console.log(`Chunk loaded: ${resource.name.split('/').pop()} in ${loadTime.toFixed(2)}ms`);
                            }
                        }
                    }
                });

                observer.observe({ entryTypes: ['resource'] });
            } catch (error) {
                console.warn('Chunk loading monitoring not supported:', error);
            }
        }
    }
}

export default BundleAnalyzer;