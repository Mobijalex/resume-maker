/**
 * Dynamic import utilities for code splitting and lazy loading
 */

// Cache for dynamic imports to avoid re-importing
const importCache = new Map<string, Promise<any>>();

/**
 * Dynamic import with caching
 */
export function cachedDynamicImport<T>(
    importFn: () => Promise<T>,
    cacheKey: string
): Promise<T> {
    if (importCache.has(cacheKey)) {
        return importCache.get(cacheKey)!;
    }

    const importPromise = importFn();
    importCache.set(cacheKey, importPromise);
    return importPromise;
}

/**
 * Preload critical dependencies
 */
export async function preloadCriticalDependencies(): Promise<void> {
    // Preload PDF generation library when user is likely to need it
    const preloadPDF = () => cachedDynamicImport(
        () => import('jspdf'),
        'jspdf'
    );

    // Preload Markdown parser
    const preloadMarkdown = () => cachedDynamicImport(
        () => import('marked'),
        'marked'
    );

    // Start preloading but don't wait for completion
    Promise.all([
        preloadPDF().catch(() => { }), // Silently handle failures
        preloadMarkdown().catch(() => { }),
    ]);
}

/**
 * Dynamic import for PDF generation with fallback
 */
export async function importPDFGenerator() {
    try {
        return await cachedDynamicImport(
            () => import('jspdf'),
            'jspdf'
        );
    } catch (error) {
        console.error('Failed to load PDF generator:', error);
        throw new Error('PDF generation is not available. Please try refreshing the page.');
    }
}

/**
 * Dynamic import for Markdown parser with fallback
 */
export async function importMarkdownParser() {
    try {
        return await cachedDynamicImport(
            () => import('marked'),
            'marked'
        );
    } catch (error) {
        console.error('Failed to load Markdown parser:', error);
        throw new Error('Markdown parsing is not available. Please try refreshing the page.');
    }
}

/**
 * Dynamic import for templates
 */
export async function importTemplate(templateName: string) {
    try {
        return await cachedDynamicImport(
            () => import(`../templates/${templateName}Template`),
            `template-${templateName}`
        );
    } catch (error) {
        console.error(`Failed to load template ${templateName}:`, error);
        throw new Error(`Template ${templateName} is not available.`);
    }
}

/**
 * Preload templates based on user interaction
 */
export function preloadTemplates(): void {
    // Preload both templates
    Promise.all([
        importTemplate('professional').catch(() => { }),
        importTemplate('modern').catch(() => { }),
    ]);
}