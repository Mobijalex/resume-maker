/**
 * Example usage of MarkdownParser
 * This file demonstrates how to use the MarkdownParser in the application
 */

import { MarkdownParser } from '../MarkdownParser';

// Example usage function
export function parseResumeFromMarkdown(markdownContent: string) {
    try {
        // Create parser instance
        const parser = new MarkdownParser(markdownContent);

        // Validate structure first
        const validation = parser.validateStructure();
        if (!validation.isValid) {
            throw new Error(`Invalid resume structure: ${validation.errors.join(', ')}`);
        }

        // Parse the resume data
        const resumeData = parser.parseMarkdown();

        return {
            success: true,
            data: resumeData,
            errors: []
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            errors: [error instanceof Error ? error.message : 'Unknown parsing error']
        };
    }
}

// Example of how this would be used in a React component
export function useMarkdownParser() {
    const parseResume = (content: string) => {
        return parseResumeFromMarkdown(content);
    };

    return { parseResume };
}