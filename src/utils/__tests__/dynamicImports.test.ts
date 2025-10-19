import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    cachedDynamicImport,
    importPDFGenerator,
    importMarkdownParser,
    importTemplate,
} from '../dynamicImports';

// Mock dynamic imports
vi.mock('jspdf', () => ({
    jsPDF: class MockJsPDF {
        constructor() { }
    }
}));

vi.mock('marked', () => ({
    marked: {
        parse: vi.fn()
    }
}));

vi.mock('../templates/professionalTemplate', () => ({
    default: { id: 'professional', name: 'Professional' }
}));

vi.mock('../templates/modernTemplate', () => ({
    default: { id: 'modern', name: 'Modern' }
}));

describe('dynamicImports', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('cachedDynamicImport', () => {
        it('should cache import results', async () => {
            const mockImport = vi.fn().mockResolvedValue({ test: 'value' });

            // First call
            const result1 = await cachedDynamicImport(mockImport, 'test-key');
            expect(result1).toEqual({ test: 'value' });
            expect(mockImport).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await cachedDynamicImport(mockImport, 'test-key');
            expect(result2).toEqual({ test: 'value' });
            expect(mockImport).toHaveBeenCalledTimes(1); // Still only called once
        });

        it('should handle different cache keys separately', async () => {
            const mockImport1 = vi.fn().mockResolvedValue({ test: 'value1' });
            const mockImport2 = vi.fn().mockResolvedValue({ test: 'value2' });

            const result1 = await cachedDynamicImport(mockImport1, 'key1');
            const result2 = await cachedDynamicImport(mockImport2, 'key2');

            expect(result1).toEqual({ test: 'value1' });
            expect(result2).toEqual({ test: 'value2' });
            expect(mockImport1).toHaveBeenCalledTimes(1);
            expect(mockImport2).toHaveBeenCalledTimes(1);
        });
    });

    describe('importPDFGenerator', () => {
        it('should successfully import jsPDF', async () => {
            const result = await importPDFGenerator();
            expect(result).toBeDefined();
            expect(result.jsPDF).toBeDefined();
        });

        it('should throw error with user-friendly message on failure', async () => {
            // Mock import failure
            vi.doMock('jspdf', () => {
                throw new Error('Module not found');
            });

            await expect(importPDFGenerator()).rejects.toThrow(
                'PDF generation is not available. Please try refreshing the page.'
            );
        });
    });

    describe('importMarkdownParser', () => {
        it('should successfully import marked', async () => {
            const result = await importMarkdownParser();
            expect(result).toBeDefined();
            expect(result.marked).toBeDefined();
        });

        it('should throw error with user-friendly message on failure', async () => {
            // Mock import failure
            vi.doMock('marked', () => {
                throw new Error('Module not found');
            });

            await expect(importMarkdownParser()).rejects.toThrow(
                'Markdown parsing is not available. Please try refreshing the page.'
            );
        });
    });

    describe('importTemplate', () => {
        it('should successfully import professional template', async () => {
            const result = await importTemplate('professional');
            expect(result).toBeDefined();
            expect(result.default).toEqual({ id: 'professional', name: 'Professional' });
        });

        it('should successfully import modern template', async () => {
            const result = await importTemplate('modern');
            expect(result).toBeDefined();
            expect(result.default).toEqual({ id: 'modern', name: 'Modern' });
        });

        it('should throw error for non-existent template', async () => {
            await expect(importTemplate('nonexistent')).rejects.toThrow(
                'Template nonexistent is not available.'
            );
        });
    });
});