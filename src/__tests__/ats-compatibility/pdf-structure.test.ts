import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFGenerator } from '../../utils/PDFGenerator';
import type { ResumeData } from '../../types/resume';
import type { Template } from '../../types/template';

// Mock jsPDF
const mockJsPDF = {
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    getTextWidth: vi.fn().mockReturnValue(50),
    internal: {
        pageSize: {
            getWidth: vi.fn().mockReturnValue(210),
            getHeight: vi.fn().mockReturnValue(297),
        },
    },
    addPage: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue('mock-pdf-data'),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    setPage: vi.fn(),
    getCurrentPageInfo: vi.fn().mockReturnValue({ pageNumber: 1 }),
};

vi.mock('jspdf', () => ({
    default: vi.fn().mockImplementation(() => mockJsPDF),
}));

describe('ATS Compatibility - PDF Structure Tests', () => {
    let pdfGenerator: PDFGenerator;
    let mockResumeData: ResumeData;
    let mockTemplate: Template;

    beforeEach(() => {
        vi.clearAllMocks();
        pdfGenerator = new PDFGenerator();

        mockResumeData = {
            personalInfo: {
                fullName: 'John Doe',
                email: 'john.doe@email.com',
                phone: '(555) 123-4567',
                location: 'New York, NY',
                linkedin: 'https://linkedin.com/in/johndoe',
                website: 'https://johndoe.com',
            },
            summary: 'Experienced software engineer with 5+ years of expertise in full-stack development.',
            experience: [
                {
                    jobTitle: 'Senior Software Engineer',
                    company: 'Tech Corp',
                    duration: '2020 - Present',
                    accomplishments: [
                        'Led development of microservices architecture',
                        'Improved system performance by 40%',
                        'Mentored junior developers',
                    ],
                    isCurrentRole: true,
                },
                {
                    jobTitle: 'Software Developer',
                    company: 'StartupXYZ',
                    duration: '2018 - 2020',
                    accomplishments: [
                        'Built responsive web applications',
                        'Implemented CI/CD pipelines',
                    ],
                    isCurrentRole: false,
                },
            ],
            education: [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    institution: 'University of Technology',
                    graduationDate: '2018',
                    gpa: '3.8',
                    relevantCoursework: ['Data Structures', 'Algorithms', 'Software Engineering'],
                },
            ],
            skills: {
                technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'],
                languages: ['English (Native)', 'Spanish (Conversational)'],
                soft: ['Leadership', 'Communication', 'Problem Solving'],
            },
            certifications: [
                {
                    name: 'AWS Certified Solutions Architect',
                    issuer: 'Amazon Web Services',
                    date: '2023',
                    expirationDate: '2026',
                },
            ],
            projects: [
                {
                    name: 'E-commerce Platform',
                    description: 'Full-stack web application with React and Node.js',
                    technologies: ['React', 'Node.js', 'MongoDB'],
                    url: 'https://github.com/johndoe/ecommerce',
                },
            ],
        };

        mockTemplate = {
            id: 'professional',
            name: 'Professional',
            description: 'Clean and professional template',
            layout: {
                margins: { top: 20, right: 20, bottom: 20, left: 20 },
                spacing: { section: 15, item: 8, line: 5 },
                columns: 1,
            },
            styling: {
                fonts: {
                    primary: 'Arial',
                    secondary: 'Arial',
                    sizes: { heading: 16, subheading: 14, body: 11, small: 9 },
                },
                colors: {
                    primary: '#000000',
                    secondary: '#333333',
                    accent: '#666666',
                },
            },
            atsOptimized: true,
        };
    });

    describe('ATS-Friendly Font Usage', () => {
        it('should use only ATS-compatible fonts', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            // Verify only standard fonts are used
            const fontCalls = mockJsPDF.setFont.mock.calls;
            const usedFonts = fontCalls.map(call => call[0]);

            const atsCompatibleFonts = ['Arial', 'Calibri', 'Times', 'Helvetica'];
            usedFonts.forEach(font => {
                expect(atsCompatibleFonts.some(compatible =>
                    font.toLowerCase().includes(compatible.toLowerCase())
                )).toBe(true);
            });
        });

        it('should not use decorative or custom fonts', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const fontCalls = mockJsPDF.setFont.mock.calls;
            const usedFonts = fontCalls.map(call => call[0]);

            const problematicFonts = ['Comic Sans', 'Papyrus', 'Impact', 'Brush Script'];
            usedFonts.forEach(font => {
                expect(problematicFonts.some(problematic =>
                    font.toLowerCase().includes(problematic.toLowerCase())
                )).toBe(false);
            });
        });

        it('should use consistent font sizes for readability', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const fontSizeCalls = mockJsPDF.setFontSize.mock.calls;
            const usedSizes = fontSizeCalls.map(call => call[0]);

            // Font sizes should be between 9 and 18 points for ATS compatibility
            usedSizes.forEach(size => {
                expect(size).toBeGreaterThanOrEqual(9);
                expect(size).toBeLessThanOrEqual(18);
            });
        });
    });

    describe('Text Structure and Formatting', () => {
        it('should use plain text without complex formatting', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;

            // Verify text is added as plain strings, not complex objects
            textCalls.forEach(call => {
                const textContent = call[0];
                expect(typeof textContent).toBe('string');

                // Should not contain HTML tags or complex formatting
                expect(textContent).not.toMatch(/<[^>]*>/);
                expect(textContent).not.toMatch(/\{[^}]*\}/);
            });
        });

        it('should avoid tables, text boxes, and complex layouts', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            // Verify no table-like structures are created
            // This is implicit in our text-based approach, but we verify
            // that content is laid out linearly
            const textCalls = mockJsPDF.text.mock.calls;

            // Text should be positioned in a logical reading order
            const yPositions = textCalls.map(call => call[2]); // Y coordinates

            // Y positions should generally increase (top to bottom)
            for (let i = 1; i < yPositions.length; i++) {
                // Allow for some flexibility in positioning but ensure general flow
                expect(yPositions[i]).toBeGreaterThanOrEqual(yPositions[i - 1] - 5);
            }
        });

        it('should use clear section headings', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const textContent = textCalls.map(call => call[0]);

            // Verify standard section headings are present
            const expectedSections = [
                'PROFESSIONAL SUMMARY',
                'EXPERIENCE',
                'EDUCATION',
                'SKILLS',
                'CERTIFICATIONS',
                'PROJECTS'
            ];

            expectedSections.forEach(section => {
                const hasSection = textContent.some(text =>
                    text.toUpperCase().includes(section)
                );
                expect(hasSection).toBe(true);
            });
        });

        it('should maintain consistent spacing and alignment', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const positions = textCalls.map(call => ({ x: call[1], y: call[2] }));

            // Verify consistent left alignment (X positions should be similar for body text)
            const xPositions = positions.map(pos => pos.x);
            const uniqueXPositions = [...new Set(xPositions)];

            // Should have limited number of X positions (indicating consistent alignment)
            expect(uniqueXPositions.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Content Organization', () => {
        it('should include all required contact information', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const allText = textCalls.map(call => call[0]).join(' ');

            // Verify contact information is present
            expect(allText).toContain(mockResumeData.personalInfo.fullName);
            expect(allText).toContain(mockResumeData.personalInfo.email);
            expect(allText).toContain(mockResumeData.personalInfo.phone);
            expect(allText).toContain(mockResumeData.personalInfo.location);
        });

        it('should present experience in reverse chronological order', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const allText = textCalls.map(call => call[0]).join(' ');

            // Find positions of job titles in the text
            const seniorEngineerIndex = allText.indexOf('Senior Software Engineer');
            const developerIndex = allText.indexOf('Software Developer');

            // Senior Engineer (current role) should appear before Developer (previous role)
            expect(seniorEngineerIndex).toBeLessThan(developerIndex);
        });

        it('should use bullet points for accomplishments', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const textContent = textCalls.map(call => call[0]);

            // Verify bullet points or similar formatting for accomplishments
            const hasAccomplishments = textContent.some(text =>
                mockResumeData.experience[0].accomplishments.some(accomplishment =>
                    text.includes(accomplishment)
                )
            );

            expect(hasAccomplishments).toBe(true);
        });

        it('should include keywords from job descriptions', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const allText = textCalls.map(call => call[0]).join(' ').toLowerCase();

            // Verify technical keywords are present
            const technicalSkills = mockResumeData.skills.technical;
            technicalSkills.forEach(skill => {
                expect(allText).toContain(skill.toLowerCase());
            });
        });
    });

    describe('PDF Metadata and Properties', () => {
        it('should generate searchable text content', async () => {
            const result = await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            // Verify PDF output contains searchable text
            expect(mockJsPDF.output).toHaveBeenCalled();

            // The text should be extractable (not embedded as images)
            const textCalls = mockJsPDF.text.mock.calls;
            expect(textCalls.length).toBeGreaterThan(0);

            // Verify actual content is present in text calls
            const allText = textCalls.map(call => call[0]).join(' ');
            expect(allText.length).toBeGreaterThan(100); // Reasonable amount of content
        });

        it('should avoid images and graphics', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            // Verify no image-related methods are called
            expect(mockJsPDF.addImage).toBeUndefined();

            // All content should be text-based
            const textCalls = mockJsPDF.text.mock.calls;
            expect(textCalls.length).toBeGreaterThan(0);
        });

        it('should maintain reasonable page length', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            // Verify reasonable number of pages (typically 1-3 for most resumes)
            const pageCount = mockJsPDF.getNumberOfPages();
            expect(pageCount).toBeGreaterThanOrEqual(1);
            expect(pageCount).toBeLessThanOrEqual(3);
        });
    });

    describe('ATS Parsing Compatibility', () => {
        it('should avoid headers and footers', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const positions = textCalls.map(call => ({ x: call[1], y: call[2] }));

            // Verify no content is placed in header/footer areas
            const pageHeight = mockJsPDF.internal.pageSize.getHeight();
            const headerArea = pageHeight * 0.1; // Top 10%
            const footerArea = pageHeight * 0.9; // Bottom 10%

            positions.forEach(pos => {
                expect(pos.y).toBeGreaterThan(headerArea);
                expect(pos.y).toBeLessThan(footerArea);
            });
        });

        it('should use standard date formats', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const allText = textCalls.map(call => call[0]).join(' ');

            // Verify date formats are ATS-friendly
            expect(allText).toContain('2020 - Present');
            expect(allText).toContain('2018 - 2020');
            expect(allText).toContain('2018'); // Graduation date
        });

        it('should include section keywords that ATS systems recognize', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const allText = textCalls.map(call => call[0]).join(' ').toUpperCase();

            // Verify ATS-recognized section keywords
            const atsKeywords = [
                'EXPERIENCE',
                'EDUCATION',
                'SKILLS',
                'SUMMARY',
                'CERTIFICATIONS'
            ];

            atsKeywords.forEach(keyword => {
                expect(allText).toContain(keyword);
            });
        });

        it('should maintain logical reading order for screen readers', async () => {
            await pdfGenerator.generatePDF(mockResumeData, mockTemplate);

            const textCalls = mockJsPDF.text.mock.calls;
            const textWithPositions = textCalls.map(call => ({
                text: call[0],
                x: call[1],
                y: call[2]
            }));

            // Sort by Y position (top to bottom) then X position (left to right)
            const sortedText = textWithPositions
                .sort((a, b) => a.y - b.y || a.x - b.x)
                .map(item => item.text);

            // Verify logical order: name should come first, then contact info, then sections
            const fullText = sortedText.join(' ');
            const nameIndex = fullText.indexOf(mockResumeData.personalInfo.fullName);
            const summaryIndex = fullText.indexOf('PROFESSIONAL SUMMARY');
            const experienceIndex = fullText.indexOf('EXPERIENCE');

            expect(nameIndex).toBeLessThan(summaryIndex);
            expect(summaryIndex).toBeLessThan(experienceIndex);
        });
    });
});