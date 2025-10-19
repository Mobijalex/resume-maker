/**
 * Usage examples for PDFGenerator
 * This file demonstrates how to use the PDFGenerator class in real applications
 */

import { PDFGenerator, PDFGeneratorOptions } from '../PDFGenerator';
import { professionalTemplate } from '../../templates/professionalTemplate';
import { modernTemplate } from '../../templates/modernTemplate';
import { ResumeData } from '../../types/resume';

// Example resume data
const sampleResumeData: ResumeData = {
    personalInfo: {
        fullName: 'Alex Johnson',
        email: 'alex.johnson@email.com',
        phone: '(555) 123-4567',
        location: 'Seattle, WA',
        linkedin: 'linkedin.com/in/alexjohnson',
        website: 'alexjohnson.dev'
    },
    summary: 'Experienced software engineer with expertise in full-stack development and cloud technologies.',
    experience: [
        {
            jobTitle: 'Senior Software Engineer',
            company: 'Tech Solutions Inc.',
            duration: '2022 - Present',
            accomplishments: [
                'Led development of scalable microservices architecture',
                'Improved system performance by 45% through optimization',
                'Mentored junior developers and established best practices'
            ],
            isCurrentRole: true
        }
    ],
    education: [
        {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of Washington',
            graduationDate: '2020',
            gpa: '3.8'
        }
    ],
    skills: {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker'],
        languages: ['English', 'Spanish'],
        soft: ['Leadership', 'Problem Solving', 'Communication']
    }
};

/**
 * Example 1: Basic PDF generation with professional template
 */
export async function generateBasicPDF(): Promise<void> {
    const options: PDFGeneratorOptions = {
        template: professionalTemplate,
        resumeData: sampleResumeData,
        atsOptimized: true
    };

    const generator = new PDFGenerator(options);
    const result = await generator.generatePDF();

    if (result.success && result.pdf) {
        // Download the PDF
        generator.downloadPDF();
        console.log('PDF generated successfully!');

        if (result.warnings) {
            console.warn('Warnings:', result.warnings);
        }
    } else {
        console.error('PDF generation failed:', result.error);
    }
}

/**
 * Example 2: PDF generation with modern template and custom filename
 */
export async function generateModernPDF(): Promise<void> {
    const options: PDFGeneratorOptions = {
        template: modernTemplate,
        resumeData: sampleResumeData,
        atsOptimized: true
    };

    const generator = new PDFGenerator(options);
    const result = await generator.generatePDF();

    if (result.success && result.pdf) {
        // Download with custom filename
        const customFilename = 'Alex_Johnson_Resume_2024.pdf';
        generator.downloadPDF(customFilename);
        console.log(`PDF saved as: ${customFilename}`);
    } else {
        console.error('PDF generation failed:', result.error);
    }
}

/**
 * Example 3: Handling PDF generation with error checking
 */
export async function generatePDFWithErrorHandling(): Promise<boolean> {
    try {
        const options: PDFGeneratorOptions = {
            template: professionalTemplate,
            resumeData: sampleResumeData,
            atsOptimized: true
        };

        const generator = new PDFGenerator(options);
        const result = await generator.generatePDF();

        if (result.success) {
            generator.downloadPDF();

            // Log any warnings
            if (result.warnings && result.warnings.length > 0) {
                console.warn('PDF generated with warnings:');
                result.warnings.forEach(warning => console.warn(`- ${warning}`));
            }

            return true;
        } else {
            console.error('PDF generation failed:', result.error);
            return false;
        }
    } catch (error) {
        console.error('Unexpected error during PDF generation:', error);
        return false;
    }
}

/**
 * Example 4: Generating PDF with minimal data
 */
export async function generateMinimalPDF(): Promise<void> {
    const minimalData: ResumeData = {
        personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '555-0123',
            location: 'City, State'
        },
        summary: '',
        experience: [],
        education: [],
        skills: { technical: [] }
    };

    const options: PDFGeneratorOptions = {
        template: professionalTemplate,
        resumeData: minimalData,
        atsOptimized: true
    };

    const generator = new PDFGenerator(options);
    const result = await generator.generatePDF();

    if (result.success) {
        generator.downloadPDF('Minimal_Resume.pdf');
        console.log('Minimal PDF generated successfully!');
    } else {
        console.error('Failed to generate minimal PDF:', result.error);
    }
}

/**
 * Example 5: Generating PDF with all optional sections
 */
export async function generateCompletePDF(): Promise<void> {
    const completeData: ResumeData = {
        ...sampleResumeData,
        certifications: [
            {
                name: 'AWS Certified Solutions Architect',
                issuer: 'Amazon Web Services',
                dateObtained: '2023-06-15',
                expirationDate: '2026-06-15',
                credentialId: 'AWS-SAA-789012'
            }
        ],
        projects: [
            {
                name: 'E-commerce Platform',
                description: 'Full-stack e-commerce solution with payment integration',
                technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
                duration: '4 months',
                url: 'https://github.com/alexjohnson/ecommerce',
                accomplishments: [
                    'Processed over $100K in transactions',
                    'Achieved 99.9% uptime'
                ]
            }
        ]
    };

    const options: PDFGeneratorOptions = {
        template: modernTemplate,
        resumeData: completeData,
        atsOptimized: true
    };

    const generator = new PDFGenerator(options);
    const result = await generator.generatePDF();

    if (result.success) {
        generator.downloadPDF('Complete_Resume.pdf');
        console.log('Complete PDF with all sections generated successfully!');
    } else {
        console.error('Failed to generate complete PDF:', result.error);
    }
}

/**
 * Example 6: Performance monitoring during PDF generation
 */
export async function generatePDFWithPerformanceMonitoring(): Promise<void> {
    const startTime = performance.now();

    const options: PDFGeneratorOptions = {
        template: professionalTemplate,
        resumeData: sampleResumeData,
        atsOptimized: true
    };

    const generator = new PDFGenerator(options);
    const result = await generator.generatePDF();

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (result.success) {
        generator.downloadPDF();
        console.log(`PDF generated successfully in ${duration.toFixed(2)}ms`);

        // Check if it meets the 3-second requirement
        if (duration > 3000) {
            console.warn('PDF generation took longer than 3 seconds');
        }
    } else {
        console.error(`PDF generation failed after ${duration.toFixed(2)}ms:`, result.error);
    }
}

// Export all examples for easy testing
export const examples = {
    generateBasicPDF,
    generateModernPDF,
    generatePDFWithErrorHandling,
    generateMinimalPDF,
    generateCompletePDF,
    generatePDFWithPerformanceMonitoring
};