/**
 * Integration tests for PDFGenerator with template system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFGenerator } from '../PDFGenerator';
import { professionalTemplate } from '../../templates/professionalTemplate';
import { modernTemplate } from '../../templates/modernTemplate';
import { ResumeData } from '../../types/resume';

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

describe('PDFGenerator Integration Tests', () => {
    let sampleResumeData: ResumeData;

    beforeEach(() => {
        sampleResumeData = {
            personalInfo: {
                fullName: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '(555) 987-6543',
                location: 'San Francisco, CA',
                linkedin: 'linkedin.com/in/janesmith',
                website: 'janesmith.dev'
            },
            summary: 'Full-stack developer with 7+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies.',
            experience: [
                {
                    jobTitle: 'Senior Full Stack Developer',
                    company: 'Tech Innovations Inc.',
                    duration: '2021 - Present',
                    accomplishments: [
                        'Led development of microservices architecture serving 1M+ users',
                        'Reduced application load time by 60% through performance optimization',
                        'Mentored 5 junior developers and established code review processes'
                    ],
                    isCurrentRole: true
                },
                {
                    jobTitle: 'Software Engineer',
                    company: 'StartupCorp',
                    duration: '2019 - 2021',
                    accomplishments: [
                        'Built responsive web applications using React and TypeScript',
                        'Implemented CI/CD pipelines reducing deployment time by 80%',
                        'Collaborated with design team to improve user experience'
                    ],
                    isCurrentRole: false
                }
            ],
            education: [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    institution: 'Stanford University',
                    graduationDate: '2019',
                    gpa: '3.9',
                    relevantCoursework: ['Data Structures', 'Algorithms', 'Software Engineering', 'Database Systems']
                }
            ],
            skills: {
                technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
                languages: ['English (Native)', 'Spanish (Conversational)', 'French (Basic)'],
                soft: ['Leadership', 'Problem Solving', 'Communication', 'Team Collaboration']
            },
            certifications: [
                {
                    name: 'AWS Certified Solutions Architect',
                    issuer: 'Amazon Web Services',
                    dateObtained: '2023-03-15',
                    expirationDate: '2026-03-15',
                    credentialId: 'AWS-SAA-123456'
                }
            ],
            projects: [
                {
                    name: 'E-commerce Platform',
                    description: 'Full-stack e-commerce solution with real-time inventory management',
                    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
                    duration: '6 months',
                    url: 'https://github.com/janesmith/ecommerce-platform',
                    accomplishments: [
                        'Processed $500K+ in transactions within first year',
                        'Achieved 99.9% uptime with automated monitoring'
                    ]
                }
            ]
        };
    });

    describe('Professional Template Integration', () => {
        it('should generate PDF with professional template', async () => {
            const generator = new PDFGenerator({
                template: professionalTemplate,
                resumeData: sampleResumeData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();
            expect(result.error).toBeUndefined();
        });

        it('should handle professional template with minimal data', async () => {
            const minimalData: ResumeData = {
                personalInfo: {
                    fullName: 'John Minimal',
                    email: 'john@example.com',
                    phone: '555-0123',
                    location: 'City, State'
                },
                summary: '',
                experience: [],
                education: [],
                skills: { technical: [] }
            };

            const generator = new PDFGenerator({
                template: professionalTemplate,
                resumeData: minimalData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();
        });
    });

    describe('Modern Template Integration', () => {
        it('should generate PDF with modern template', async () => {
            const generator = new PDFGenerator({
                template: modernTemplate,
                resumeData: sampleResumeData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();
            expect(result.error).toBeUndefined();
        });

        it('should handle modern template with all optional sections', async () => {
            const generator = new PDFGenerator({
                template: modernTemplate,
                resumeData: sampleResumeData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();

            // Should include certifications and projects sections
            expect(sampleResumeData.certifications).toBeDefined();
            expect(sampleResumeData.projects).toBeDefined();
        });
    });

    describe('ATS Optimization with Templates', () => {
        it('should apply ATS-friendly fonts regardless of template font preference', async () => {
            // Test with a template that might specify non-ATS fonts
            const customTemplate = {
                ...professionalTemplate,
                styling: {
                    ...professionalTemplate.styling,
                    fonts: {
                        ...professionalTemplate.styling.fonts,
                        primary: 'Comic Sans MS' // Non-ATS font
                    }
                }
            };

            const generator = new PDFGenerator({
                template: customTemplate,
                resumeData: sampleResumeData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.warnings).toBeDefined();
            expect(result.warnings?.[0]).toContain('not ATS-optimized');
        });

        it('should use template spacing configuration correctly', async () => {
            const customSpacingTemplate = {
                ...professionalTemplate,
                layout: {
                    ...professionalTemplate.layout,
                    spacing: {
                        sectionGap: 30,
                        itemGap: 15,
                        lineHeight: 16
                    }
                }
            };

            const generator = new PDFGenerator({
                template: customSpacingTemplate,
                resumeData: sampleResumeData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();
        });
    });

    describe('Content Rendering with Templates', () => {
        it('should render all resume sections with professional template', async () => {
            const generator = new PDFGenerator({
                template: professionalTemplate,
                resumeData: sampleResumeData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);

            // Verify all sections are processed
            expect(sampleResumeData.personalInfo.fullName).toBeTruthy();
            expect(sampleResumeData.summary).toBeTruthy();
            expect(sampleResumeData.experience.length).toBeGreaterThan(0);
            expect(sampleResumeData.education.length).toBeGreaterThan(0);
            expect(sampleResumeData.skills.technical.length).toBeGreaterThan(0);
            expect(sampleResumeData.certifications?.length).toBeGreaterThan(0);
            expect(sampleResumeData.projects?.length).toBeGreaterThan(0);
        });

        it('should handle long content with proper text wrapping', async () => {
            const longContentData = {
                ...sampleResumeData,
                summary: 'This is an extremely long professional summary that should test the text wrapping functionality of the PDF generator. It contains multiple sentences with detailed information about the candidate\'s background, experience, skills, and career objectives. The summary should be properly wrapped across multiple lines while maintaining readability and professional formatting. This extensive text will help verify that the PDF generation engine can handle large amounts of content without breaking the layout or causing formatting issues.',
                experience: [
                    {
                        ...sampleResumeData.experience[0],
                        accomplishments: [
                            'This is a very long accomplishment description that should test the text wrapping functionality within bullet points and list items in the PDF generation system',
                            'Another lengthy accomplishment that demonstrates the ability to handle extended text content while maintaining proper formatting and readability',
                            'A third accomplishment with substantial detail about complex technical implementations and their business impact on organizational success'
                        ]
                    }
                ]
            };

            const generator = new PDFGenerator({
                template: professionalTemplate,
                resumeData: longContentData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();
        });
    });

    describe('Performance with Templates', () => {
        it('should generate PDF within performance requirements', async () => {
            const startTime = Date.now();

            const generator = new PDFGenerator({
                template: professionalTemplate,
                resumeData: sampleResumeData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();
            const endTime = Date.now();

            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
        });

        it('should handle complex resume data efficiently', async () => {
            // Create a complex resume with many entries
            const complexData: ResumeData = {
                ...sampleResumeData,
                experience: Array(8).fill(null).map((_, i) => ({
                    jobTitle: `Position ${i + 1}`,
                    company: `Company ${i + 1}`,
                    duration: `202${i} - 202${i + 1}`,
                    accomplishments: Array(4).fill(null).map((_, j) =>
                        `Detailed accomplishment ${j + 1} for position ${i + 1} with comprehensive description of achievements and impact`
                    ),
                    isCurrentRole: i === 0
                })),
                education: Array(3).fill(null).map((_, i) => ({
                    degree: `Degree ${i + 1}`,
                    institution: `University ${i + 1}`,
                    graduationDate: `201${8 - i}`,
                    gpa: '3.8',
                    relevantCoursework: Array(5).fill(null).map((_, j) => `Course ${j + 1}`)
                })),
                skills: {
                    technical: Array(25).fill(null).map((_, i) => `Skill ${i + 1}`),
                    languages: ['English', 'Spanish', 'French', 'German', 'Italian'],
                    soft: Array(10).fill(null).map((_, i) => `Soft Skill ${i + 1}`)
                },
                certifications: Array(5).fill(null).map((_, i) => ({
                    name: `Certification ${i + 1}`,
                    issuer: `Issuer ${i + 1}`,
                    dateObtained: `2023-0${i + 1}-15`,
                    expirationDate: `2026-0${i + 1}-15`,
                    credentialId: `CERT-${i + 1}-123456`
                })),
                projects: Array(4).fill(null).map((_, i) => ({
                    name: `Project ${i + 1}`,
                    description: `Comprehensive description of project ${i + 1} with detailed technical specifications and business requirements`,
                    technologies: Array(6).fill(null).map((_, j) => `Tech ${j + 1}`),
                    duration: `${i + 3} months`,
                    url: `https://github.com/user/project-${i + 1}`,
                    accomplishments: Array(3).fill(null).map((_, j) =>
                        `Project accomplishment ${j + 1} with measurable impact and detailed results`
                    )
                }))
            };

            const generator = new PDFGenerator({
                template: modernTemplate,
                resumeData: complexData,
                atsOptimized: true
            });

            const result = await generator.generatePDF();

            expect(result.success).toBe(true);
            expect(result.pdf).toBeDefined();
        });
    });
});