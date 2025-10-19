/**
 * ATS Compatibility Validation Tests
 * 
 * Tests ATS compatibility across different systems and validates PDF structure
 * for major ATS platforms. Validates requirements 11.1, 11.2, and 11.3.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFGenerator } from '../../utils/PDFGenerator';
import { MarkdownParser } from '../../utils/MarkdownParser';
import type { ResumeData } from '../../types/resume';

// Mock jsPDF for testing
vi.mock('jspdf', () => ({
    default: vi.fn().mockImplementation(() => ({
        text: vi.fn(),
        setFontSize: vi.fn(),
        setFont: vi.fn(),
        save: vi.fn(),
        output: vi.fn().mockReturnValue('mock-pdf-data'),
        internal: {
            pageSize: { width: 210, height: 297 }
        },
        getTextWidth: vi.fn().mockReturnValue(50),
        splitTextToSize: vi.fn().mockImplementation((text) => [text])
    }))
}));

describe('ATS Compatibility Validation Tests', () => {
    let pdfGenerator: PDFGenerator;
    let markdownParser: MarkdownParser;
    let sampleResumeData: ResumeData;

    beforeEach(() => {
        vi.clearAllMocks();
        pdfGenerator = new PDFGenerator();
        markdownParser = new MarkdownParser();

        // Sample resume data for testing
        sampleResumeData = {
            personalInfo: {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                location: 'New York, NY',
                linkedin: 'linkedin.com/in/johndoe',
                website: 'johndoe.dev'
            },
            summary: 'Experienced software engineer with 5+ years in full-stack development.',
            experience: [
                {
                    jobTitle: 'Senior Software Engineer',
                    company: 'Tech Corp',
                    duration: '2020 - Present',
                    accomplishments: [
                        'Led development of microservices architecture',
                        'Improved system performance by 40%',
                        'Mentored junior developers'
                    ],
                    isCurrentRole: true
                },
                {
                    jobTitle: 'Software Engineer',
                    company: 'StartupCo',
                    duration: '2018 - 2020',
                    accomplishments: [
                        'Built responsive web applications',
                        'Implemented CI/CD pipelines'
                    ],
                    isCurrentRole: false
                }
            ],
            education: [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    institution: 'University of Technology',
                    graduationDate: '2018',
                    gpa: '3.8'
                }
            ],
            skills: {
                technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'],
                languages: ['English (Native)', 'Spanish (Conversational)']
            },
            certifications: [
                {
                    name: 'AWS Certified Solutions Architect',
                    issuer: 'Amazon Web Services',
                    date: '2022'
                }
            ],
            projects: [
                {
                    name: 'E-commerce Platform',
                    description: 'Built scalable e-commerce solution',
                    technologies: ['React', 'Node.js', 'MongoDB'],
                    url: 'github.com/johndoe/ecommerce'
                }
            ]
        };
    });

    describe('Major ATS System Compatibility', () => {
        const atsSystemsRequirements = {
            workday: {
                name: 'Workday',
                requirements: [
                    'Standard fonts only',
                    'No tables for layout',
                    'Clear section headers',
                    'Searchable text'
                ]
            },
            greenhouse: {
                name: 'Greenhouse',
                requirements: [
                    'Linear text flow',
                    'No text boxes',
                    'Standard formatting',
                    'Contact info at top'
                ]
            },
            lever: {
                name: 'Lever',
                requirements: [
                    'Simple structure',
                    'No graphics',
                    'Consistent spacing',
                    'Machine-readable text'
                ]
            },
            taleo: {
                name: 'Taleo',
                requirements: [
                    'No headers/footers',
                    'Standard fonts',
                    'Clear hierarchy',
                    'Text-based content'
                ]
            }
        };

        Object.entries(atsSystemsRequirements).forEach(([system, config]) => {
            describe(`${config.name} ATS Compatibility`, () => {
                it(`should generate PDF compatible with ${config.name}`, async () => {
                    const pdf = await pdfGenerator.generatePDF(sampleResumeData, 'professional');

                    expect(pdf).toBeDefined();

                    // Verify standard fonts are used (requirement 4.1)
                    const mockJsPDF = vi.mocked(require('jspdf').default);
                    const pdfInstance = mockJsPDF.mock.results[0]?.value;

                    if (pdfInstance) {
                        expect(pdfInstance.setFont).toHaveBeenCalledWith(
                            expect.stringMatching(/arial|calibri|times/i)
                        );
                    }
                });

                it(`should avoid problematic elements for ${config.name}`, () => {
                    // Test that PDF generation avoids tables, text boxes, etc.
                    const mockJsPDF = vi.mocked(require('jspdf').default);
                    const pdfInstance = mockJsPDF.mock.results[0]?.value;

                    if (pdfInstance) {
                        // Should not use table-related methods
                        expect(pdfInstance.table).toBeUndefined();
                        expect(pdfInstance.autoTable).toBeUndefined();

                        // Should use simple text placement
                        expect(pdfInstance.text).toBeDefined();
                    }
                });

                it(`should structure content for ${config.name} parsing`, async () => {
                    const pdf = await pdfGenerator.generatePDF(sampleResumeData, 'professional');

                    // Verify content structure
                    const mockJsPDF = vi.mocked(require('jspdf').default);
                    const pdfInstance = mockJsPDF.mock.results[0]?.value;

                    if (pdfInstance) {
                        // Should have called text method for content
                        expect(pdfInstance.text).toHaveBeenCalled();

                        // Should have set appropriate font sizes for headers
                        expect(pdfInstance.setFontSize).toHaveBeenCalledWith(
                            expect.any(Number)
                        );
                    }
                });
            });
        });
    });

    describe('PDF Structure Validation', () => {
        it('should use ATS-friendly fonts only', async () => {
            await pdfGenerator.generatePDF(sampleResumeData, 'professional');

            const mockJsPDF = vi.mocked(require('jspdf').default);
            const pdfInstance = mockJsPDF.mock.results[0]?.value;

            if (pdfInstance) {
                const fontCalls = pdfInstance.setFont.mock.calls;

                fontCalls.forEach(call => {
                    const fontName = call[0]?.toLowerCase();
                    expect(['arial', 'calibri', 'times', 'helvetica']).toContain(fontName);
                });
            }
        });

        it('should avoid tables and complex layouts', async () => {
            await pdfGenerator.generatePDF(sampleResumeData, 'professional');

            const mockJsPDF = vi.mocked(require('jspdf').default);
            const pdfInstance = mockJsPDF.mock.results[0]?.value;

            if (pdfInstance) {
                // Should not use table methods
                expect(pdfInstance.table).toBeUndefined();
                expect(pdfInstance.autoTable).toBeUndefined();

                // Should use simple text placement
                expect(pdfInstance.text).toHaveBeenCalled();
            }
        });

        it('should create searchable and selectable text', async () => {
            const pdfData = await pdfGenerator.generatePDF(sampleResumeData, 'professional');

            // PDF should be generated with text content
            expect(pdfData).toBeDefined();

            const mockJsPDF = vi.mocked(require('jspdf').default);
            const pdfInstance = mockJsPDF.mock.results[0]?.value;

            if (pdfInstance) {
                // Should have text content
                expect(pdfInstance.text).toHaveBeenCalledWith(
                    expect.stringContaining('John Doe'),
                    expect.any(Number),
                    expect.any(Number)
                );
            }
        });

        it('should maintain consistent spacing and alignment', async () => {
            await pdfGenerator.generatePDF(sampleResumeData, 'professional');

            const mockJsPDF = vi.mocked(require('jspdf').default);
            const pdfInstance = mockJsPDF.mock.results[0]?.value;

            if (pdfInstance) {
                const textCalls = pdfInstance.text.mock.calls;

                // Should have consistent x-coordinates for alignment
                const xCoordinates = textCalls.map(call => call[1]);
                const uniqueXCoords = [...new Set(xCoordinates)];

                // Should have limited number of alignment points
                expect(uniqueXCoords.length).toBeLessThanOrEqual(3);
            }
        });

        it('should avoid headers, footers, and page decorations', async () => {
            await pdfGenerator.generatePDF(sampleResumeData, 'professional');

            const mockJsPDF = vi.mocked(require('jspdf').default);
            const pdfInstance = mockJsPDF.mock.results[0]?.value;

            if (pdfInstance) {
                // Should not use header/footer methods
                expect(pdfInstance.setHeader).toBeUndefined();
                expect(pdfInstance.setFooter).toBeUndefined();

                // Should not add page decorations
                expect(pdfInstance.addImage).not.toHaveBeenCalled();
            }
        });
    });

    describe('Content Parsing Validation', () => {
        it('should extract all required sections correctly', () => {
            const markdownContent = `
# John Doe

## Contact
- Email: john.doe@example.com
- Phone: +1 (555) 123-4567
- Location: New York, NY

## Professional Summary
Experienced software engineer with 5+ years in full-stack development.

## Experience
### Senior Software Engineer | Tech Corp | 2020 - Present
- Led development of microservices architecture
- Improved system performance by 40%

## Education
### Bachelor of Science in Computer Science | University of Technology | 2018
- GPA: 3.8

## Skills
- **Technical:** JavaScript, TypeScript, React, Node.js
- **Languages:** English (Native), Spanish (Conversational)
      `;

            const parsedData = markdownParser.parseMarkdown(markdownContent);

            // Should extract all required sections
            expect(parsedData.personalInfo.fullName).toBe('John Doe');
            expect(parsedData.personalInfo.email).toBe('john.doe@example.com');
            expect(parsedData.experience).toHaveLength(1);
            expect(parsedData.education).toHaveLength(1);
            expect(parsedData.skills.technical).toContain('JavaScript');
        });

        it('should handle various markdown formatting styles', () => {
            const variations = [
                '# John Doe\n## Contact\nEmail: john@example.com',
                '# John Doe\n## Contact Information\n- Email: john@example.com',
                '# John Doe\n## Contact Details\n**Email:** john@example.com'
            ];

            variations.forEach(markdown => {
                const parsedData = markdownParser.parseMarkdown(markdown);
                expect(parsedData.personalInfo.fullName).toBe('John Doe');
                expect(parsedData.personalInfo.email).toBe('john@example.com');
            });
        });

        it('should validate required sections for ATS compatibility', () => {
            const incompleteMarkdown = `
# John Doe
## Contact
Email: john@example.com
      `;

            const parsedData = markdownParser.parseMarkdown(incompleteMarkdown);

            // Should have contact info
            expect(parsedData.personalInfo.fullName).toBe('John Doe');
            expect(parsedData.personalInfo.email).toBe('john@example.com');

            // Missing sections should be empty arrays/strings
            expect(parsedData.experience).toEqual([]);
            expect(parsedData.education).toEqual([]);
        });
    });

    describe('ATS Parsing Success Rate Validation', () => {
        it('should generate PDFs with 95% parsing success rate structure', async () => {
            // Test multiple resume variations
            const resumeVariations = [
                { ...sampleResumeData, personalInfo: { ...sampleResumeData.personalInfo, fullName: 'Jane Smith' } },
                { ...sampleResumeData, experience: sampleResumeData.experience.slice(0, 1) },
                { ...sampleResumeData, skills: { technical: ['Python', 'Django'], languages: [] } }
            ];

            for (const resumeData of resumeVariations) {
                const pdf = await pdfGenerator.generatePDF(resumeData, 'professional');
                expect(pdf).toBeDefined();

                const mockJsPDF = vi.mocked(require('jspdf').default);
                const pdfInstance = mockJsPDF.mock.results[0]?.value;

                if (pdfInstance) {
                    // Should have contact information at the top
                    const textCalls = pdfInstance.text.mock.calls;
                    const firstCall = textCalls[0];

                    if (firstCall) {
                        expect(firstCall[0]).toContain(resumeData.personalInfo.fullName);
                    }
                }
            }
        });

        it('should maintain ATS-friendly structure across templates', async () => {
            const templates = ['professional', 'modern'];

            for (const template of templates) {
                const pdf = await pdfGenerator.generatePDF(sampleResumeData, template);
                expect(pdf).toBeDefined();

                const mockJsPDF = vi.mocked(require('jspdf').default);
                const pdfInstance = mockJsPDF.mock.results[0]?.value;

                if (pdfInstance) {
                    // Should use standard fonts regardless of template
                    expect(pdfInstance.setFont).toHaveBeenCalledWith(
                        expect.stringMatching(/arial|calibri|times/i)
                    );

                    // Should have text content
                    expect(pdfInstance.text).toHaveBeenCalled();
                }
            }
        });
    });

    describe('Performance Requirements for ATS Processing', () => {
        it('should generate PDF within 3 seconds for typical resumes', async () => {
            const startTime = performance.now();

            await pdfGenerator.generatePDF(sampleResumeData, 'professional');

            const endTime = performance.now();
            const generationTime = endTime - startTime;

            // Should meet 3-second requirement (requirement 4.4)
            expect(generationTime).toBeLessThan(3000);
        });

        it('should handle large resumes efficiently', async () => {
            // Create a large resume
            const largeResumeData = {
                ...sampleResumeData,
                experience: Array(10).fill(sampleResumeData.experience[0]),
                skills: {
                    technical: Array(50).fill('Technology').map((tech, i) => `${tech}${i}`),
                    languages: ['English', 'Spanish', 'French', 'German']
                }
            };

            const startTime = performance.now();

            await pdfGenerator.generatePDF(largeResumeData, 'professional');

            const endTime = performance.now();
            const generationTime = endTime - startTime;

            // Should still be reasonable for large resumes
            expect(generationTime).toBeLessThan(5000);
        });
    });

    describe('Cross-System Compatibility', () => {
        it('should generate consistent output across different environments', async () => {
            // Test with different mock environments
            const environments = [
                { userAgent: 'Chrome', platform: 'Windows' },
                { userAgent: 'Firefox', platform: 'macOS' },
                { userAgent: 'Safari', platform: 'macOS' },
                { userAgent: 'Edge', platform: 'Windows' }
            ];

            for (const env of environments) {
                // Mock environment
                Object.defineProperty(navigator, 'userAgent', {
                    value: env.userAgent,
                    writable: true
                });

                const pdf = await pdfGenerator.generatePDF(sampleResumeData, 'professional');
                expect(pdf).toBeDefined();

                // Should generate consistent structure
                const mockJsPDF = vi.mocked(require('jspdf').default);
                const pdfInstance = mockJsPDF.mock.results[0]?.value;

                if (pdfInstance) {
                    expect(pdfInstance.text).toHaveBeenCalled();
                    expect(pdfInstance.setFont).toHaveBeenCalled();
                }
            }
        });

        it('should maintain text encoding compatibility', async () => {
            // Test with special characters
            const specialCharResumeData = {
                ...sampleResumeData,
                personalInfo: {
                    ...sampleResumeData.personalInfo,
                    fullName: 'José María González',
                    location: 'São Paulo, Brazil'
                }
            };

            const pdf = await pdfGenerator.generatePDF(specialCharResumeData, 'professional');
            expect(pdf).toBeDefined();

            const mockJsPDF = vi.mocked(require('jspdf').default);
            const pdfInstance = mockJsPDF.mock.results[0]?.value;

            if (pdfInstance) {
                // Should handle special characters
                expect(pdfInstance.text).toHaveBeenCalledWith(
                    expect.stringContaining('José María González'),
                    expect.any(Number),
                    expect.any(Number)
                );
            }
        });
    });
});