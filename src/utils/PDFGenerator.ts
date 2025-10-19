/**
 * PDF Generation Engine for ATS-Friendly Resume Creation
 * 
 * This class generates ATS-optimized PDF documents from resume data using jsPDF.
 * It ensures compatibility with Applicant Tracking Systems by:
 * - Using standard fonts (Arial, Calibri, Times New Roman)
 * - Avoiding tables, text boxes, headers/footers, and images
 * - Maintaining clean, searchable text structure
 * - Following consistent spacing and alignment
 */

import { jsPDF } from 'jspdf';
import type { ResumeData } from '../types/resume';
import type { Template } from '../types/template';

export interface PDFGeneratorOptions {
    template: Template;
    resumeData: ResumeData;
    atsOptimized: boolean;
}

export interface PDFGenerationResult {
    success: boolean;
    pdf?: jsPDF;
    error?: string;
    warnings?: string[];
    generationTime?: number;
    pageCount?: number;
}

export class PDFGenerator {
    private pdf: jsPDF;
    private currentY: number = 0;
    private pageHeight: number;
    private pageWidth: number;
    private margins: { top: number; bottom: number; left: number; right: number };
    private options: PDFGeneratorOptions;
    private warnings: string[] = [];

    // ATS-friendly font mappings
    private static readonly ATS_FONTS = {
        'Arial': 'helvetica',
        'Calibri': 'helvetica', // Fallback to helvetica for ATS compatibility
        'Times New Roman': 'times'
    } as const;

    constructor(options: PDFGeneratorOptions) {
        this.options = options;
        this.pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        // Set page dimensions
        this.pageHeight = this.pdf.internal.pageSize.height;
        this.pageWidth = this.pdf.internal.pageSize.width;

        // Set margins from template (convert inches to points)
        this.margins = {
            top: options.template.layout.margins.top * 72,
            bottom: options.template.layout.margins.bottom * 72,
            left: options.template.layout.margins.left * 72,
            right: options.template.layout.margins.right * 72
        };
        this.currentY = this.margins.top;

        // Configure ATS-friendly font
        this.setupATSFont();
    }

    /**
     * Generate PDF from resume data
     */
    public async generatePDF(): Promise<PDFGenerationResult> {
        const startTime = performance.now();

        try {
            const { resumeData } = this.options;

            // Generate PDF content in ATS-friendly order
            this.addPersonalInfo(resumeData.personalInfo);
            this.addSummary(resumeData.summary);
            this.addWorkExperience(resumeData.experience);
            this.addEducation(resumeData.education);
            this.addSkills(resumeData.skills);

            // Optional sections
            if (resumeData.certifications && resumeData.certifications.length > 0) {
                this.addCertifications(resumeData.certifications);
            }

            if (resumeData.projects && resumeData.projects.length > 0) {
                this.addProjects(resumeData.projects);
            }

            const endTime = performance.now();
            const generationTime = Math.round(endTime - startTime);
            const pageCount = this.pdf.getNumberOfPages();

            return {
                success: true,
                pdf: this.pdf,
                warnings: this.warnings.length > 0 ? this.warnings : undefined,
                generationTime,
                pageCount
            };
        } catch (error) {
            const endTime = performance.now();
            const generationTime = Math.round(endTime - startTime);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred during PDF generation',
                generationTime
            };
        }
    }

    /**
     * Download the generated PDF
     */
    public downloadPDF(filename?: string): void {
        const { personalInfo } = this.options.resumeData;
        const defaultFilename = this.generateFilename(personalInfo.fullName);
        this.pdf.save(filename || defaultFilename);
    }

    /**
     * Setup ATS-friendly font configuration
     */
    private setupATSFont(): void {
        const { styling } = this.options.template;
        const primaryFont = styling.fonts.primary;

        // Map to ATS-friendly font or use fallback
        const atsFont = PDFGenerator.ATS_FONTS[primaryFont as keyof typeof PDFGenerator.ATS_FONTS] || 'helvetica';

        if (!PDFGenerator.ATS_FONTS[primaryFont as keyof typeof PDFGenerator.ATS_FONTS]) {
            this.warnings.push(`Font "${primaryFont}" is not ATS-optimized. Using Helvetica as fallback.`);
        }

        // Set default font
        this.pdf.setFont(atsFont, 'normal');
        this.pdf.setFontSize(styling.sizes.bodyFont);
    }

    /**
     * Add personal information section
     */
    private addPersonalInfo(personalInfo: ResumeData['personalInfo']): void {
        const { styling } = this.options.template;

        // Name (largest font)
        this.pdf.setFontSize(styling.sizes.headerFont);
        this.pdf.setFont(this.getCurrentFont(), 'bold');
        this.addText(personalInfo.fullName, { align: 'center' });
        this.addVerticalSpace(this.options.template.layout.spacing.itemGap);

        // Contact information (smaller font, normal weight)
        this.pdf.setFontSize(styling.sizes.bodyFont);
        this.pdf.setFont(this.getCurrentFont(), 'normal');

        const contactInfo = [
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            personalInfo.linkedin,
            personalInfo.website
        ].filter(Boolean);

        const contactLine = contactInfo.join(' | ');
        this.addText(contactLine, { align: 'center' });
        this.addVerticalSpace(this.options.template.layout.spacing.sectionGap);
    }

    /**
     * Add professional summary section
     */
    private addSummary(summary: string): void {
        if (!summary.trim()) return;

        this.addSectionHeader('PROFESSIONAL SUMMARY');
        this.addText(summary);
        this.addVerticalSpace(this.options.template.layout.spacing.sectionGap);
    }

    /**
     * Add work experience section
     */
    private addWorkExperience(experience: ResumeData['experience']): void {
        if (!experience || experience.length === 0) return;

        this.addSectionHeader('PROFESSIONAL EXPERIENCE');

        experience.forEach((job, index) => {
            // Job title and company
            this.pdf.setFont(this.getCurrentFont(), 'bold');
            this.addText(`${job.jobTitle} | ${job.company}`);

            // Duration
            this.pdf.setFont(this.getCurrentFont(), 'normal');
            this.addText(job.duration);
            this.addVerticalSpace(this.options.template.layout.spacing.itemGap / 2);

            // Accomplishments
            job.accomplishments.forEach(accomplishment => {
                this.addText(`• ${accomplishment}`);
            });

            // Add space between jobs (except for the last one)
            if (index < experience.length - 1) {
                this.addVerticalSpace(this.options.template.layout.spacing.itemGap);
            }
        });

        this.addVerticalSpace(this.options.template.layout.spacing.sectionGap);
    }

    /**
     * Add education section
     */
    private addEducation(education: ResumeData['education']): void {
        if (!education || education.length === 0) return;

        this.addSectionHeader('EDUCATION');

        education.forEach((edu, index) => {
            // Degree and institution
            this.pdf.setFont(this.getCurrentFont(), 'bold');
            this.addText(`${edu.degree} | ${edu.institution}`);

            // Graduation date
            this.pdf.setFont(this.getCurrentFont(), 'normal');
            this.addText(edu.graduationDate);

            // GPA if provided
            if (edu.gpa) {
                this.addText(`GPA: ${edu.gpa}`);
            }

            // Relevant coursework if provided
            if (edu.relevantCoursework && edu.relevantCoursework.length > 0) {
                this.addText(`Relevant Coursework: ${edu.relevantCoursework.join(', ')}`);
            }

            // Add space between education entries (except for the last one)
            if (index < education.length - 1) {
                this.addVerticalSpace(this.options.template.layout.spacing.itemGap);
            }
        });

        this.addVerticalSpace(this.options.template.layout.spacing.sectionGap);
    }

    /**
     * Add skills section
     */
    private addSkills(skills: ResumeData['skills']): void {
        this.addSectionHeader('SKILLS');

        if (skills.technical && skills.technical.length > 0) {
            this.pdf.setFont(this.getCurrentFont(), 'bold');
            this.addText('Technical Skills:');
            this.pdf.setFont(this.getCurrentFont(), 'normal');
            this.addText(skills.technical.join(', '));
            this.addVerticalSpace(this.options.template.layout.spacing.itemGap / 2);
        }

        if (skills.languages && skills.languages.length > 0) {
            this.pdf.setFont(this.getCurrentFont(), 'bold');
            this.addText('Languages:');
            this.pdf.setFont(this.getCurrentFont(), 'normal');
            this.addText(skills.languages.join(', '));
            this.addVerticalSpace(this.options.template.layout.spacing.itemGap / 2);
        }

        if (skills.soft && skills.soft.length > 0) {
            this.pdf.setFont(this.getCurrentFont(), 'bold');
            this.addText('Soft Skills:');
            this.pdf.setFont(this.getCurrentFont(), 'normal');
            this.addText(skills.soft.join(', '));
        }

        this.addVerticalSpace(this.options.template.layout.spacing.sectionGap);
    }

    /**
     * Add certifications section
     */
    private addCertifications(certifications: NonNullable<ResumeData['certifications']>): void {
        this.addSectionHeader('CERTIFICATIONS');

        certifications.forEach((cert, index) => {
            this.pdf.setFont(this.getCurrentFont(), 'bold');
            this.addText(`${cert.name} | ${cert.issuer}`);

            this.pdf.setFont(this.getCurrentFont(), 'normal');
            let certDetails = cert.dateObtained;
            if (cert.expirationDate) {
                certDetails += ` - ${cert.expirationDate}`;
            }
            if (cert.credentialId) {
                certDetails += ` | ID: ${cert.credentialId}`;
            }
            this.addText(certDetails);

            // Add space between certifications (except for the last one)
            if (index < certifications.length - 1) {
                this.addVerticalSpace(this.options.template.layout.spacing.itemGap);
            }
        });

        this.addVerticalSpace(this.options.template.layout.spacing.sectionGap);
    }

    /**
     * Add projects section
     */
    private addProjects(projects: NonNullable<ResumeData['projects']>): void {
        this.addSectionHeader('PROJECTS');

        projects.forEach((project, index) => {
            // Project name
            this.pdf.setFont(this.getCurrentFont(), 'bold');
            let projectHeader = project.name;
            if (project.url) {
                projectHeader += ` | ${project.url}`;
            }
            this.addText(projectHeader);

            // Duration and technologies
            this.pdf.setFont(this.getCurrentFont(), 'normal');
            let projectDetails = project.technologies.join(', ');
            if (project.duration) {
                projectDetails = `${project.duration} | ${projectDetails}`;
            }
            this.addText(projectDetails);

            // Description
            this.addText(project.description);

            // Accomplishments
            project.accomplishments.forEach(accomplishment => {
                this.addText(`• ${accomplishment}`);
            });

            // Add space between projects (except for the last one)
            if (index < projects.length - 1) {
                this.addVerticalSpace(this.options.template.layout.spacing.itemGap);
            }
        });
    }

    /**
     * Add a section header with consistent formatting
     */
    private addSectionHeader(title: string): void {
        const { styling } = this.options.template;

        this.pdf.setFontSize(styling.sizes.subHeaderFont);
        this.pdf.setFont(this.getCurrentFont(), 'bold');
        this.addText(title);
        this.addVerticalSpace(this.options.template.layout.spacing.itemGap / 2);

        // Reset to body font
        this.pdf.setFontSize(styling.sizes.bodyFont);
        this.pdf.setFont(this.getCurrentFont(), 'normal');
    }

    /**
     * Add text with automatic line wrapping and page breaks
     */
    private addText(text: string, options: { align?: 'left' | 'center' | 'right' } = {}): void {
        const { align = 'left' } = options;
        const maxWidth = this.pageWidth - this.margins.left - this.margins.right;
        const fontSize = this.pdf.getFontSize();
        const lineHeight = fontSize * this.options.template.layout.spacing.lineHeight;

        // Split text into lines that fit within the page width
        const lines = this.pdf.splitTextToSize(text, maxWidth);

        for (const line of lines) {
            // Check if we need a new page
            if (this.currentY + lineHeight > this.pageHeight - this.margins.bottom) {
                this.addNewPage();
            }

            // Calculate x position based on alignment
            let x = this.margins.left;
            if (align === 'center') {
                const textWidth = this.pdf.getTextWidth(line);
                x = (this.pageWidth - textWidth) / 2;
            } else if (align === 'right') {
                const textWidth = this.pdf.getTextWidth(line);
                x = this.pageWidth - this.margins.right - textWidth;
            }

            this.pdf.text(line, x, this.currentY);
            this.currentY += lineHeight;
        }
    }

    /**
     * Add vertical space
     */
    private addVerticalSpace(space: number): void {
        this.currentY += space;

        // Check if we need a new page after adding space
        if (this.currentY > this.pageHeight - this.margins.bottom) {
            this.addNewPage();
        }
    }

    /**
     * Add a new page
     */
    private addNewPage(): void {
        this.pdf.addPage();
        this.currentY = this.margins.top;
    }

    /**
     * Get current font name
     */
    private getCurrentFont(): string {
        const { styling } = this.options.template;
        const primaryFont = styling.fonts.primary;
        return PDFGenerator.ATS_FONTS[primaryFont as keyof typeof PDFGenerator.ATS_FONTS] || 'helvetica';
    }

    /**
     * Generate filename for PDF download
     */
    private generateFilename(fullName: string): string {
        const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        return `Resume_${cleanName}_${date}.pdf`;
    }
}