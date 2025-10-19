/**
 * Tests for template renderer functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultTemplateRenderer } from '../templateRenderer';
import { professionalTemplate } from '../professionalTemplate';
import { modernTemplate } from '../modernTemplate';
import type { ResumeData } from '../../types';

describe('DefaultTemplateRenderer', () => {
    let renderer: DefaultTemplateRenderer;
    let sampleResumeData: ResumeData;

    beforeEach(() => {
        renderer = new DefaultTemplateRenderer();
        sampleResumeData = {
            personalInfo: {
                fullName: 'John Doe',
                email: 'john.doe@email.com',
                phone: '(555) 123-4567',
                location: 'New York, NY',
                linkedin: 'https://linkedin.com/in/johndoe',
                website: 'https://johndoe.dev'
            },
            summary: 'Experienced software engineer with 5+ years of experience in full-stack development.',
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
                },
                {
                    jobTitle: 'Software Engineer',
                    company: 'StartupCo',
                    duration: '2018 - 2020',
                    accomplishments: [
                        'Built responsive web applications',
                        'Collaborated with cross-functional teams'
                    ],
                    isCurrentRole: false
                }
            ],
            education: [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    institution: 'University of Technology',
                    graduationDate: '2018',
                    gpa: '3.8',
                    relevantCoursework: ['Data Structures', 'Algorithms', 'Software Engineering']
                }
            ],
            skills: {
                technical: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
                languages: ['English (Native)', 'Spanish (Conversational)'],
                soft: ['Leadership', 'Communication', 'Problem Solving']
            },
            certifications: [
                {
                    name: 'AWS Certified Solutions Architect',
                    issuer: 'Amazon Web Services',
                    dateObtained: '2021',
                    credentialId: 'AWS-123456'
                }
            ],
            projects: [
                {
                    name: 'E-commerce Platform',
                    description: 'Full-stack e-commerce solution with React and Node.js',
                    technologies: ['React', 'Node.js', 'MongoDB'],
                    duration: '3 months',
                    url: 'https://github.com/johndoe/ecommerce',
                    accomplishments: [
                        'Implemented secure payment processing',
                        'Built admin dashboard for inventory management'
                    ]
                }
            ]
        };
    });

    describe('renderHTML', () => {
        it('should generate complete HTML document with professional template', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
            expect(html).toContain('<head>');
            expect(html).toContain('<body>');
            expect(html).toContain('John Doe');
            expect(html).toContain('john.doe@email.com');
        });

        it('should generate complete HTML document with modern template', () => {
            const html = renderer.renderHTML(sampleResumeData, modernTemplate);

            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
            expect(html).toContain('John Doe');
            expect(html).toContain('Senior Software Engineer');
        });

        it('should include all resume sections in HTML', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('Professional Summary');
            expect(html).toContain('Professional Experience');
            expect(html).toContain('Education');
            expect(html).toContain('Skills');
            expect(html).toContain('Certifications');
            expect(html).toContain('Projects');
        });
    });

    describe('renderPreview', () => {
        it('should generate preview HTML without full document structure', () => {
            const preview = renderer.renderPreview(sampleResumeData, professionalTemplate);

            expect(preview).toContain('<style>');
            expect(preview).toContain('resume-container preview');
            expect(preview).not.toContain('<!DOCTYPE html>');
            expect(preview).not.toContain('<html>');
            expect(preview).toContain('John Doe');
        });

        it('should include preview-specific styling', () => {
            const preview = renderer.renderPreview(sampleResumeData, professionalTemplate);

            expect(preview).toContain('transform: scale(0.7)');
            expect(preview).toContain('border: 1px solid #e0e0e0');
            expect(preview).toContain('box-shadow');
        });
    });

    describe('content rendering', () => {
        it('should render personal information correctly', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('John Doe');
            expect(html).toContain('john.doe@email.com');
            expect(html).toContain('(555) 123-4567');
            expect(html).toContain('New York, NY');
            expect(html).toContain('LinkedIn');
            expect(html).toContain('Portfolio');
        });

        it('should render work experience with accomplishments', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('Senior Software Engineer');
            expect(html).toContain('Tech Corp');
            expect(html).toContain('2020 - Present');
            expect(html).toContain('Led development of microservices architecture');
            expect(html).toContain('Improved system performance by 40%');
        });

        it('should render education with GPA and coursework', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('Bachelor of Science in Computer Science');
            expect(html).toContain('University of Technology');
            expect(html).toContain('2018');
            expect(html).toContain('GPA: 3.8');
            expect(html).toContain('Data Structures');
        });

        it('should render skills by category', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('Technical:');
            expect(html).toContain('JavaScript, React, Node.js, Python, AWS');
            expect(html).toContain('Languages:');
            expect(html).toContain('English (Native), Spanish (Conversational)');
            expect(html).toContain('Soft Skills:');
            expect(html).toContain('Leadership, Communication, Problem Solving');
        });

        it('should render certifications', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('AWS Certified Solutions Architect');
            expect(html).toContain('Amazon Web Services');
            expect(html).toContain('2021');
        });

        it('should render projects with technologies and accomplishments', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('E-commerce Platform');
            expect(html).toContain('React, Node.js, MongoDB');
            expect(html).toContain('3 months');
            expect(html).toContain('Implemented secure payment processing');
        });
    });

    describe('template-specific styling', () => {
        it('should apply professional template fonts', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('font-family: Arial');
            expect(html).toContain('Helvetica, sans-serif');
        });

        it('should apply modern template fonts', () => {
            const html = renderer.renderHTML(sampleResumeData, modernTemplate);

            expect(html).toContain('font-family: Calibri');
            expect(html).toContain('Helvetica, sans-serif');
        });

        it('should apply professional template colors', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('color: #000000');
        });

        it('should apply modern template colors', () => {
            const html = renderer.renderHTML(sampleResumeData, modernTemplate);

            expect(html).toContain('color: #2c3e50');
            expect(html).toContain('#3498db');
        });
    });

    describe('ATS optimization', () => {
        it('should generate clean HTML structure for ATS parsing', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            // Should not contain complex elements that ATS systems struggle with
            expect(html).not.toContain('<table');
            expect(html).not.toContain('<header');
            expect(html).not.toContain('<footer');
            expect(html).not.toContain('<img');

            // Should use semantic structure
            expect(html).toContain('<div class="section">');
            expect(html).toContain('<div class="section-header">');
        });

        it('should include print media queries for PDF generation', () => {
            const html = renderer.renderHTML(sampleResumeData, professionalTemplate);

            expect(html).toContain('@media print');
        });
    });

    describe('edge cases', () => {
        it('should handle missing optional sections gracefully', () => {
            const minimalData: ResumeData = {
                personalInfo: {
                    fullName: 'Jane Doe',
                    email: 'jane@email.com',
                    phone: '555-0123',
                    location: 'City, State'
                },
                summary: 'Professional summary',
                experience: [],
                education: [],
                skills: {
                    technical: ['JavaScript']
                }
            };

            const html = renderer.renderHTML(minimalData, professionalTemplate);

            expect(html).toContain('Jane Doe');
            expect(html).toContain('Professional summary');
            expect(html).not.toContain('Certifications');
            expect(html).not.toContain('Projects');
        });

        it('should handle empty accomplishments arrays', () => {
            const dataWithEmptyAccomplishments: ResumeData = {
                ...sampleResumeData,
                experience: [{
                    jobTitle: 'Developer',
                    company: 'Company',
                    duration: '2020-2021',
                    accomplishments: [],
                    isCurrentRole: false
                }]
            };

            const html = renderer.renderHTML(dataWithEmptyAccomplishments, professionalTemplate);

            expect(html).toContain('Developer');
            expect(html).toContain('Company');
        });
    });
});