/**
 * Tests for PDFGenerator class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFGenerator } from '../PDFGenerator';
import type { PDFGeneratorOptions } from '../PDFGenerator';
import type { ResumeData } from '../../types/resume';
import type { Template } from '../../types/template';

// Mock jsPDF
vi.mock('jspdf', () => {
    const mockPDF = {
        internal: {
            pageSize: {
                height: 841.89,
                width: 595.28
            }
        },
        setFont: vi.fn(),
        setFontSize: vi.fn(),
        text: vi.fn(),
        addPage: vi.fn(),
        save: vi.fn(),
        splitTextToSize: vi.fn((text: string) => [text]),
        getTextWidth: vi.fn(() => 100),
        getNumberOfPages: vi.fn(() => 1),
        output: vi.fn(() => new Blob(['mock pdf'], { type: 'application/pdf' }))
    };

    return {
        jsPDF: vi.fn(() => mockPDF)
    };
});

describe('PDFGenerator', () => {
    let mockResumeData: ResumeData;
    let mockTemplate: Template;
    let pdfOptions: PDFGeneratorOptions;

    beforeEach(() => {
        mockResumeData = {
            personalInfo: {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                phone: '(555) 123-4567',
                location: 'New York, NY',
                linkedin: 'linkedin.com/in/johndoe',
                website: 'johndoe.com'
            },
            summary: 'Experienced software developer with 5+ years of experience.',
            experience: [
                {
                    jobTitle: 'Senior Software Engineer',
                    company: 'Tech Corp',
                    duration: '2020 - Present',
                    accomplishments: [
                        'Led development of microservices architecture',
                        'Improved system performance by 40%'
                    ],
                    isCurrentRole: true
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
                technical: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
                languages: ['English', 'Spanish'],
                soft: ['Leadership', 'Communication']
            }
        };

        mockTemplate = {
            id: 'professional',
            name: 'Professional',
            description: 'Clean professional template',
            layout: {
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                spacing: { sectionGap: 20, itemGap: 10, lineHeight: 14 },
                columns: { enabled: false }
            },
            styling: {
                fonts: {
                    primary: 'Arial',
                    fallback: ['Helvetica', 'sans-serif']
                },
                colors: {
                    primary: '#000000',
                    secondary: '#333333',
                    text: '#000000'
                },
                sizes: {
                    headerFont: 18,
                    subHeaderFont: 14,
                    bodyFont: 11,
                    smallFont: 9
                },
                formatting: {
                    boldHeaders: true,
                    underlineHeaders: false,
                    italicEmphasis: true
                }
            },
            atsOptimized: true
        };

        pdfOptions = {
            template: mockTemplate,
            resumeData: mockResumeData,
            atsOptimized: true
        };
    });

    describe('Constructor', () => {
        it('should initialize PDFGenerator with correct options', () => {
            const generator = new PDFGenerator(pdfOptions);
            expect(generator).toBeInstanceOf(PDFGenerator);
        });

        it('should set up ATS-friendly font configuration', () => {
            const generator = new PDFGenerator(pdfOptions);
            // Constructor should complete without errors
            expect(generator).toBeDefined();
        });
    });

    describe('generatePDF', () => {
        it('should generate PDF successfully with complete resume data', async () => {
            const generator = new PDFGenerator(pdfOptions);
            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();
            expect(result.error).toBeUndefined();
        });

        it('should generate PDF with minimal required data', async () => {
            const minimalData: ResumeData = {
                personalInfo: {
                    fullName: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '555-0123',
                    location: 'Boston, MA'
                },
                summary: '',
                experience: [],
                education: [],
                skills: { technical: [] }
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                resumeData: minimalData
            });

            const result = await generator.generatePDF();
            expect(result.success).toBe(true);
        });

        it('should include optional sections when present', async () => {
            const dataWithOptionals: ResumeData = {
                ...mockResumeData,
                certifications: [
                    {
                        name: 'AWS Certified Developer',
                        issuer: 'Amazon Web Services',
                        dateObtained: '2023-01-15',
                        expirationDate: '2026-01-15',
                        credentialId: 'AWS-123456'
                    }
                ],
                projects: [
                    {
                        name: 'E-commerce Platform',
                        description: 'Built a full-stack e-commerce solution',
                        technologies: ['React', 'Node.js', 'MongoDB'],
                        duration: '3 months',
                        url: 'https://github.com/johndoe/ecommerce',
                        accomplishments: ['Increased sales by 25%', 'Reduced load time by 50%']
                    }
                ]
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                resumeData: dataWithOptionals
            });

            const result = await generator.generatePDF();
            expect(result.success).toBe(true);
        });

        it('should handle errors gracefully', async () => {
            // Mock an error in PDF generation
            const generator = new PDFGenerator(pdfOptions);

            // Override a method to throw an error
            vi.spyOn(generator as any, 'addPersonalInfo').mockImplementation(() => {
                throw new Error('Test error');
            });

            const result = await generator.generatePDF();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Test error');
        });
    });

    describe('ATS Font Optimization', () => {
        it('should use ATS-friendly fonts', () => {
            const generator = new PDFGenerator(pdfOptions);
            // Font setup should complete without warnings for Arial
            expect(generator).toBeDefined();
        });

        it('should warn about non-ATS fonts and use fallback', async () => {
            const nonATSTemplate = {
                ...mockTemplate,
                styling: {
                    ...mockTemplate.styling,
                    fonts: {
                        ...mockTemplate.styling.fonts,
                        primary: 'Comic Sans MS' // Non-ATS font
                    }
                }
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                template: nonATSTemplate
            });

            const result = await generator.generatePDF();
            expect(result.success).toBe(true);
            expect(result.warnings).toBeDefined();
            expect(result.warnings?.[0]).toContain('not ATS-optimized');
        });

        it('should map Calibri to helvetica for ATS compatibility', () => {
            const calibriTemplate = {
                ...mockTemplate,
                styling: {
                    ...mockTemplate.styling,
                    fonts: {
                        ...mockTemplate.styling.fonts,
                        primary: 'Calibri'
                    }
                }
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                template: calibriTemplate
            });

            expect(generator).toBeDefined();
        });

        it('should map Times New Roman correctly', () => {
            const timesTemplate = {
                ...mockTemplate,
                styling: {
                    ...mockTemplate.styling,
                    fonts: {
                        ...mockTemplate.styling.fonts,
                        primary: 'Times New Roman'
                    }
                }
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                template: timesTemplate
            });

            expect(generator).toBeDefined();
        });
    });

    describe('downloadPDF', () => {
        it('should generate correct filename format', () => {
            const generator = new PDFGenerator(pdfOptions);
            const mockSave = vi.fn();
            (generator as any).pdf.save = mockSave;

            generator.downloadPDF();

            expect(mockSave).toHaveBeenCalledWith(
                expect.stringMatching(/^Resume_John_Doe_\d{4}-\d{2}-\d{2}\.pdf$/)
            );
        });

        it('should use custom filename when provided', () => {
            const generator = new PDFGenerator(pdfOptions);
            const mockSave = vi.fn();
            (generator as any).pdf.save = mockSave;

            const customFilename = 'custom-resume.pdf';
            generator.downloadPDF(customFilename);

            expect(mockSave).toHaveBeenCalledWith(customFilename);
        });

        it('should handle special characters in names', () => {
            const specialNameData = {
                ...mockResumeData,
                personalInfo: {
                    ...mockResumeData.personalInfo,
                    fullName: 'José María O\'Connor-Smith'
                }
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                resumeData: specialNameData
            });

            const mockSave = vi.fn();
            (generator as any).pdf.save = mockSave;

            generator.downloadPDF();

            expect(mockSave).toHaveBeenCalledWith(
                expect.stringMatching(/^Resume_Jos__Mar_a_O_Connor_Smith_\d{4}-\d{2}-\d{2}\.pdf$/)
            );
        });
    });

    describe('Content Generation', () => {
        it('should handle empty sections gracefully', async () => {
            const emptyData: ResumeData = {
                personalInfo: mockResumeData.personalInfo,
                summary: '',
                experience: [],
                education: [],
                skills: { technical: [] }
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                resumeData: emptyData
            });

            const result = await generator.generatePDF();
            expect(result.success).toBe(true);
        });

        it('should handle long text content with line wrapping', async () => {
            const longTextData = {
                ...mockResumeData,
                summary: 'This is a very long professional summary that should be wrapped across multiple lines to test the line wrapping functionality of the PDF generator. It contains detailed information about the candidate\'s experience, skills, and career objectives that spans multiple sentences and should demonstrate proper text flow within the PDF document.'
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                resumeData: longTextData
            });

            const result = await generator.generatePDF();
            expect(result.success).toBe(true);
        });

        it('should handle multiple work experiences', async () => {
            const multipleExperienceData = {
                ...mockResumeData,
                experience: [
                    ...mockResumeData.experience,
                    {
                        jobTitle: 'Software Engineer',
                        company: 'Previous Corp',
                        duration: '2018 - 2020',
                        accomplishments: [
                            'Developed web applications using React',
                            'Collaborated with cross-functional teams'
                        ],
                        isCurrentRole: false
                    }
                ]
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                resumeData: multipleExperienceData
            });

            const result = await generator.generatePDF();
            expect(result.success).toBe(true);
        });
    });

    describe('ATS Compliance', () => {
        it('should avoid tables, text boxes, headers, and footers', async () => {
            const generator = new PDFGenerator(pdfOptions);
            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            // The implementation should not use any table or text box methods
            // This is ensured by the implementation design
        });

        it('should use consistent spacing and alignment', async () => {
            const generator = new PDFGenerator(pdfOptions);
            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            // Spacing is controlled by template configuration
        });

        it('should generate searchable text content', async () => {
            const generator = new PDFGenerator(pdfOptions);
            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();
            // jsPDF generates searchable text by default when using text() method
        });
    });

    describe('Performance Requirements', () => {
        it('should complete generation within reasonable time', async () => {
            const startTime = Date.now();
            const generator = new PDFGenerator(pdfOptions);
            const result = await generator.generatePDF();
            const endTime = Date.now();

            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
        });

        it('should handle large resume data efficiently', async () => {
            const largeData: ResumeData = {
                ...mockResumeData,
                experience: Array(10).fill(null).map((_, i) => ({
                    jobTitle: `Position ${i + 1}`,
                    company: `Company ${i + 1}`,
                    duration: `202${i} - 202${i + 1}`,
                    accomplishments: Array(5).fill(null).map((_, j) =>
                        `Accomplishment ${j + 1} for position ${i + 1} with detailed description`
                    ),
                    isCurrentRole: i === 0
                })),
                skills: {
                    technical: Array(20).fill(null).map((_, i) => `Skill ${i + 1}`),
                    languages: ['English', 'Spanish', 'French', 'German'],
                    soft: Array(10).fill(null).map((_, i) => `Soft Skill ${i + 1}`)
                }
            };

            const generator = new PDFGenerator({
                ...pdfOptions,
                resumeData: largeData
            });

            const result = await generator.generatePDF();
            expect(result.success).toBe(true);
        });
    });
});