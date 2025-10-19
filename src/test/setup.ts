import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock File and FileReader for cross-browser testing
global.File = class MockFile {
    name: string;
    size: number;
    type: string;
    content: string;

    constructor(content: string[], filename: string, options: any = {}) {
        this.name = filename;
        this.size = options.size || content.join('').length;
        this.type = options.type || 'text/plain';
        this.content = content.join('');
    }
} as any;

global.FileReader = class MockFileReader {
    result: string | null = null;
    onload: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;

    readAsText(file: any) {
        setTimeout(() => {
            this.result = file.content;
            if (this.onload) {
                this.onload({ target: { result: this.result } });
            }
        }, 10);
    }
} as any;