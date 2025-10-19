import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../MarkdownParser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('MarkdownParser Integration Tests', () => {
    it('should parse the sample resume template correctly', async () => {
        // Read the actual sample resume template
        const sampleResumePath = join(process.cwd(), 'public', 'sample-resume-template.md');
        const sampleResumeContent = readFileSync(sampleResumePath, 'utf-8');

        const parser = new MarkdownParser(sampleResumeContent);
        const result = parser.parseMarkdown();

        // Test personal info
        expect(result.personalInfo.fullName).toBe('John Doe');
        expect(result.personalInfo.email).toBe('john.doe@email.com');
        expect(result.personalInfo.phone).toBe('(555) 123-4567');
        expect(result.personalInfo.location).toBe('San Francisco, CA');
        expect(result.personalInfo.linkedin).toBe('linkedin.com/in/johndoe');
        expect(result.personalInfo.website).toBe('johndoe.dev');

        // Test summary
        expect(result.summary).toContain('Experienced software engineer');

        // Test work experience
        expect(result.experience).toHaveLength(3);
        expect(result.experience[0].jobTitle).toBe('Senior Software Engineer');
        expect(result.experience[0].company).toBe('Tech Solutions Inc.');
        expect(result.experience[0].isCurrentRole).toBe(true);
        expect(result.experience[0].accomplishments.length).toBeGreaterThan(0);

        // Test education
        expect(result.education).toHaveLength(1);
        expect(result.education[0].degree).toBe('Bachelor of Science in Computer Science');
        expect(result.education[0].institution).toBe('University of California, Berkeley');
        expect(result.education[0].gpa).toBe('3.7/4.0');

        // Test skills
        expect(result.skills.technical.length).toBeGreaterThan(0);
        expect(result.skills.soft).toBeDefined();
        expect(result.skills.soft!.length).toBeGreaterThan(0);

        // Test certifications
        expect(result.certifications).toBeDefined();
        expect(result.certifications!.length).toBeGreaterThan(0);
        expect(result.certifications![0].name).toBe('AWS Certified Solutions Architect');

        // Test projects
        expect(result.projects).toBeDefined();
        expect(result.projects!.length).toBeGreaterThan(0);
        expect(result.projects![0].name).toBe('E-commerce Platform');
        expect(result.projects![0].technologies.length).toBeGreaterThan(0);
    });

    it('should validate the sample resume template as valid', () => {
        const sampleResumePath = join(process.cwd(), 'public', 'sample-resume-template.md');
        const sampleResumeContent = readFileSync(sampleResumePath, 'utf-8');

        const parser = new MarkdownParser(sampleResumeContent);
        const validation = parser.validateStructure();

        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });
});