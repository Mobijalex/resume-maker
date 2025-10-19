import { describe, it, expect } from 'vitest';
import { ErrorType, ErrorSeverity } from '../../types/errors';
import type { FileError } from '../../types/errors';

// Helper function to create a mock file
const createMockFile = (name: string, size: number, type: string = 'text/markdown'): File => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
};

// File validation function (extracted from component for unit testing)
const validateFile = (
    file: File,
    acceptedTypes: string[] = ['.md'],
    maxSizeBytes: number = 5 * 1024 * 1024
): FileError | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
        return {
            id: `file-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: ErrorType.FILE_UPLOAD,
            severity: ErrorSeverity.HIGH,
            message: `File size ${file.size} bytes exceeds maximum allowed size of ${maxSizeBytes} bytes`,
            userMessage: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit. Please choose a smaller file.`,
            timestamp: new Date(),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        };
    }

    // Check file extension
    const nameParts = file.name.split('.');
    const fileExtension = nameParts.length > 1 ? '.' + nameParts.pop()?.toLowerCase() : '';
    if (!acceptedTypes.includes(fileExtension)) {
        return {
            id: `file-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: ErrorType.FILE_UPLOAD,
            severity: ErrorSeverity.HIGH,
            message: `File type ${fileExtension} is not supported. Accepted types: ${acceptedTypes.join(', ')}`,
            userMessage: `Please select a Markdown file (.md). Other file types are not supported.`,
            timestamp: new Date(),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        };
    }

    return null;
};

describe('File Upload Validation Logic', () => {
    describe('File Size Validation', () => {
        it('accepts files under the size limit', () => {
            const file = createMockFile('resume.md', 1024 * 1024); // 1MB
            const result = validateFile(file);

            expect(result).toBeNull();
        });

        it('accepts files exactly at the size limit', () => {
            const file = createMockFile('resume.md', 5 * 1024 * 1024); // Exactly 5MB
            const result = validateFile(file);

            expect(result).toBeNull();
        });

        it('rejects files over the size limit', () => {
            const file = createMockFile('resume.md', 5 * 1024 * 1024 + 1); // 5MB + 1 byte
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.type).toBe(ErrorType.FILE_UPLOAD);
            expect(result?.severity).toBe(ErrorSeverity.HIGH);
            expect(result?.userMessage).toContain('exceeds the 5MB limit');
            expect(result?.fileName).toBe('resume.md');
            expect(result?.fileSize).toBe(5 * 1024 * 1024 + 1);
        });

        it('handles custom size limits', () => {
            const file = createMockFile('resume.md', 2048); // 2KB
            const customLimit = 1024; // 1KB
            const result = validateFile(file, ['.md'], customLimit);

            expect(result).not.toBeNull();
            expect(result?.message).toContain(`exceeds maximum allowed size of ${customLimit} bytes`);
        });

        it('formats file size correctly in user message', () => {
            const file = createMockFile('resume.md', 6.5 * 1024 * 1024); // 6.5MB
            const result = validateFile(file);

            expect(result?.userMessage).toContain('6.5MB');
        });

        it('handles zero-byte files', () => {
            const file = createMockFile('resume.md', 0);
            const result = validateFile(file);

            expect(result).toBeNull(); // Zero-byte files should be allowed
        });

        it('handles very large files', () => {
            const file = createMockFile('resume.md', 100 * 1024 * 1024); // 100MB
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.userMessage).toContain('100.0MB');
        });
    });

    describe('File Type Validation', () => {
        it('accepts .md files', () => {
            const file = createMockFile('resume.md', 1024);
            const result = validateFile(file);

            expect(result).toBeNull();
        });

        it('accepts .MD files (case insensitive)', () => {
            const file = createMockFile('resume.MD', 1024);
            const result = validateFile(file);

            expect(result).toBeNull();
        });

        it('rejects .txt files', () => {
            const file = createMockFile('resume.txt', 1024, 'text/plain');
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.type).toBe(ErrorType.FILE_UPLOAD);
            expect(result?.severity).toBe(ErrorSeverity.HIGH);
            expect(result?.userMessage).toContain('Please select a Markdown file (.md)');
            expect(result?.fileName).toBe('resume.txt');
        });

        it('rejects .pdf files', () => {
            const file = createMockFile('resume.pdf', 1024, 'application/pdf');
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.userMessage).toContain('Please select a Markdown file (.md)');
        });

        it('rejects .docx files', () => {
            const file = createMockFile('resume.docx', 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.userMessage).toContain('Please select a Markdown file (.md)');
        });

        it('handles files without extensions', () => {
            const file = createMockFile('resume', 1024);
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.message).toContain('File type  is not supported');
        });

        it('handles custom accepted types', () => {
            const file = createMockFile('resume.txt', 1024, 'text/plain');
            const result = validateFile(file, ['.txt', '.md']);

            expect(result).toBeNull();
        });

        it('handles multiple custom accepted types', () => {
            const customTypes = ['.md', '.txt', '.markdown'];

            const mdFile = createMockFile('resume.md', 1024);
            const txtFile = createMockFile('resume.txt', 1024, 'text/plain');
            const markdownFile = createMockFile('resume.markdown', 1024);
            const pdfFile = createMockFile('resume.pdf', 1024, 'application/pdf');

            expect(validateFile(mdFile, customTypes)).toBeNull();
            expect(validateFile(txtFile, customTypes)).toBeNull();
            expect(validateFile(markdownFile, customTypes)).toBeNull();
            expect(validateFile(pdfFile, customTypes)).not.toBeNull();
        });

        it('includes accepted types in error message', () => {
            const file = createMockFile('resume.pdf', 1024, 'application/pdf');
            const customTypes = ['.md', '.txt'];
            const result = validateFile(file, customTypes);

            expect(result?.message).toContain('Accepted types: .md, .txt');
        });
    });

    describe('Combined Validation', () => {
        it('prioritizes size validation over type validation', () => {
            const file = createMockFile('resume.txt', 6 * 1024 * 1024, 'text/plain'); // Wrong type AND too large
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.userMessage).toContain('exceeds the 5MB limit'); // Size error comes first
        });

        it('validates type when size is acceptable', () => {
            const file = createMockFile('resume.txt', 1024, 'text/plain'); // Right size, wrong type
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.userMessage).toContain('Please select a Markdown file');
        });

        it('passes validation when both size and type are correct', () => {
            const file = createMockFile('resume.md', 1024);
            const result = validateFile(file);

            expect(result).toBeNull();
        });
    });

    describe('Error Object Structure', () => {
        it('creates properly structured FileError objects', () => {
            const file = createMockFile('resume.txt', 1024, 'text/plain');
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('type', ErrorType.FILE_UPLOAD);
            expect(result).toHaveProperty('severity', ErrorSeverity.HIGH);
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('userMessage');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('fileName', 'resume.txt');
            expect(result).toHaveProperty('fileSize', 1024);
            expect(result).toHaveProperty('fileType', 'text/plain');

            expect(result?.id).toMatch(/^file-error-\d+-[a-z0-9]+$/);
            expect(result?.timestamp).toBeInstanceOf(Date);
        });

        it('generates unique error IDs', () => {
            const file1 = createMockFile('resume1.txt', 1024, 'text/plain');
            const file2 = createMockFile('resume2.txt', 1024, 'text/plain');

            const result1 = validateFile(file1);
            const result2 = validateFile(file2);

            expect(result1?.id).not.toBe(result2?.id);
        });

        it('includes correct file metadata in error', () => {
            const fileName = 'my-special-resume.pdf';
            const fileSize = 2048;
            const fileType = 'application/pdf';

            const file = createMockFile(fileName, fileSize, fileType);
            const result = validateFile(file);

            expect(result?.fileName).toBe(fileName);
            expect(result?.fileSize).toBe(fileSize);
            expect(result?.fileType).toBe(fileType);
        });
    });

    describe('Edge Cases', () => {
        it('handles files with multiple dots in name', () => {
            const file = createMockFile('my.resume.v2.md', 1024);
            const result = validateFile(file);

            expect(result).toBeNull();
        });

        it('handles files with no extension but ending with dot', () => {
            const file = createMockFile('resume.', 1024);
            const result = validateFile(file);

            expect(result).not.toBeNull();
            expect(result?.message).toContain('File type . is not supported');
        });

        it('handles very long file names', () => {
            const longName = 'a'.repeat(200) + '.md';
            const file = createMockFile(longName, 1024);
            const result = validateFile(file);

            expect(result).toBeNull();
            expect(result).toBeNull();
        });

        it('handles special characters in file names', () => {
            const file = createMockFile('résumé-ñoël_2024.md', 1024);
            const result = validateFile(file);

            expect(result).toBeNull();
        });

        it('handles empty accepted types array', () => {
            const file = createMockFile('resume.md', 1024);
            const result = validateFile(file, []);

            expect(result).not.toBeNull();
            expect(result?.message).toContain('Accepted types: ');
        });
    });
});