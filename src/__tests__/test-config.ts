/**
 * Comprehensive Test Configuration
 * 
 * This file provides configuration and utilities for the comprehensive test suite
 * ensuring consistent test execution across all test categories.
 */

import { vi } from 'vitest';

// Global test configuration
export const testConfig = {
    timeout: 10000, // 10 second timeout for complex tests
    retries: 2, // Retry failed tests twice
    coverage: {
        threshold: {
            global: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80
            }
        }
    }
};

// Mock implementations for external dependencies
export const mockImplementations = {
    // PDF generation mock
    pdfGenerator: {
        generate: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
        downloadPDF: vi.fn().mockResolvedValue(true),
        validateATSCompatibility: vi.fn().mockResolvedValue(true)
    },

    // File API mock
    fileAPI: {
        readAsText: vi.fn().mockResolvedValue('# Sample Resume\n\n## Contact\nJohn Doe'),
        validateFile: vi.fn().mockResolvedValue(true)
    },

    // Markdown parser mock
    markdownParser: {
        parse: vi.fn().mockResolvedValue({
            personalInfo: {
                fullName: 'John Doe',
                email: 'john@example.com',
                phone: '555-0123',
                location: 'New York, NY'
            },
            summary: 'Experienced developer',
            experience: [],
            education: [],
            skills: { technical: ['JavaScript', 'React'] }
        })
    }
};

// Test data fixtures
export const testFixtures = {
    validMarkdown: `# John Doe

## Contact Information
- Email: john.doe@example.com
- Phone: (555) 123-4567
- Location: New York, NY
- LinkedIn: linkedin.com/in/johndoe

## Professional Summary
Experienced software developer with 5+ years of experience.

## Work Experience

### Senior Developer | Tech Company | 2020-Present
- Developed web applications using React and Node.js
- Led team of 3 developers
- Improved application performance by 40%

## Education

### Bachelor of Science in Computer Science | University Name | 2018
- GPA: 3.8/4.0
- Relevant Coursework: Data Structures, Algorithms, Web Development

## Skills

### Technical Skills
- JavaScript, TypeScript, React, Node.js
- Python, Java, SQL
- AWS, Docker, Git

### Languages
- English (Native)
- Spanish (Conversational)`,

    invalidMarkdown: `# Incomplete Resume
This resume is missing required sections.`,

    resumeData: {
        personalInfo: {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            location: 'New York, NY',
            linkedin: 'linkedin.com/in/johndoe'
        },
        summary: 'Experienced software developer with 5+ years of experience.',
        experience: [
            {
                jobTitle: 'Senior Developer',
                company: 'Tech Company',
                duration: '2020-Present',
                accomplishments: [
                    'Developed web applications using React and Node.js',
                    'Led team of 3 developers',
                    'Improved application performance by 40%'
                ],
                isCurrentRole: true
            }
        ],
        education: [
            {
                degree: 'Bachelor of Science in Computer Science',
                institution: 'University Name',
                graduationDate: '2018',
                gpa: '3.8/4.0'
            }
        ],
        skills: {
            technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Git'],
            languages: ['English (Native)', 'Spanish (Conversational)']
        }
    }
};

// Test utilities
export const testUtils = {
    // Create a mock file
    createMockFile: (content: string, filename: string = 'resume.md', type: string = 'text/markdown') => {
        const file = new File([content], filename, { type });
        return file;
    },

    // Wait for async operations
    waitForAsync: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),

    // Create mock event
    createMockEvent: (type: string, data: any = {}) => ({
        type,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        ...data
    }),

    // Validate PDF structure
    validatePDFStructure: (pdfData: Uint8Array) => {
        // Basic PDF validation - check for PDF header
        const header = new TextDecoder().decode(pdfData.slice(0, 4));
        return header === '%PDF';
    },

    // Simulate user interaction delay
    simulateUserDelay: () => new Promise(resolve => setTimeout(resolve, 50))
};

// Test environment setup
export const setupTestEnvironment = () => {
    // Mock window.URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock window.open
    global.open = vi.fn();

    // Mock console methods to reduce noise in tests
    global.console.warn = vi.fn();
    global.console.error = vi.fn();

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }));

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }));
};

// Cleanup test environment
export const cleanupTestEnvironment = () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
};

// Test categories for organization
export const testCategories = {
    UNIT: 'unit',
    INTEGRATION: 'integration',
    E2E: 'e2e',
    ATS_COMPATIBILITY: 'ats-compatibility',
    PERFORMANCE: 'performance',
    ACCESSIBILITY: 'accessibility'
} as const;

// Test tags for filtering
export const testTags = {
    CRITICAL: 'critical',
    SLOW: 'slow',
    FLAKY: 'flaky',
    BROWSER_SPECIFIC: 'browser-specific'
} as const;

export default {
    testConfig,
    mockImplementations,
    testFixtures,
    testUtils,
    setupTestEnvironment,
    cleanupTestEnvironment,
    testCategories,
    testTags
};