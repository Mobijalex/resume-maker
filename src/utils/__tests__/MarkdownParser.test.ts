import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../MarkdownParser';
import type { ResumeData } from '../../types/resume';

describe('MarkdownParser', () => {
    const sampleMarkdown = `# John Doe

**Email:** john.doe@email.com  
**Phone:** (555) 123-4567  
**Location:** San Francisco, CA  
**LinkedIn:** linkedin.com/in/johndoe  
**Website:** johndoe.dev

## Professional Summary

Experienced software engineer with 5+ years of expertise in full-stack development.

## Work Experience

### Senior Software Engineer

**Tech Solutions Inc.** | _January 2022 - Present_

- Led development of customer-facing web application
- Architected microservices infrastructure
- Mentored 3 junior developers

### Software Engineer

**Digital Innovations LLC** | _June 2019 - December 2021_

- Developed responsive web applications
- Optimized database queries

## Education

### Bachelor of Science in Computer Science

**University of California, Berkeley** | _Graduated May 2018_

**GPA:** 3.7/4.0  
**Relevant Coursework:** Data Structures, Algorithms, Database Systems

## Skills

### Technical Skills

- **Languages:** JavaScript, TypeScript, Python
- **Frontend:** React, Vue.js, HTML5

### Soft Skills

- Team Leadership
- Project Management

## Certifications

### AWS Certified Solutions Architect

**Amazon Web Services** | _Issued March 2023_

## Projects

### E-commerce Platform

**Personal Project** | _2023_

- Built full-stack e-commerce application
- Implemented secure payment processing
- **Technologies:** React, Node.js, PostgreSQL`;

    describe('parseMarkdown', () => {
        it('should parse complete resume data correctly', () => {
            const parser = new MarkdownParser(sampleMarkdown);
            const result = parser.parseMarkdown();

            expect(result).toBeDefined();
            expect(result.personalInfo.fullName).toBe('John Doe');
            expect(result.personalInfo.email).toBe('john.doe@email.com');
            expect(result.personalInfo.phone).toBe('(555) 123-4567');
            expect(result.personalInfo.location).toBe('San Francisco, CA');
            expect(result.personalInfo.linkedin).toBe('linkedin.com/in/johndoe');
            expect(result.personalInfo.website).toBe('johndoe.dev');
        });

        it('should extract professional summary', () => {
            const parser = new MarkdownParser(sampleMarkdown);
            const result = parser.parseMarkdown();

            expect(result.summary).toBe('Experienced software engineer with 5+ years of expertise in full-stack development.');
        });

        it('should extract work experience correctly', () => {
            const parser = new MarkdownParser(sampleMarkdown);
            const result = parser.parseMarkdown();

            expect(result.experience).toHaveLength(2);

            const firstJob = result.experience[0];
            expect(firstJob.jobTitle).toBe('Senior Software Engineer');
            expect(firstJob.company).toBe('Tech Solutions Inc.');
            expect(firstJob.duration).toBe('January 2022 - Present');
            expect(firstJob.isCurrentRole).toBe(true);
            expect(firstJob.accomplishments).toHaveLength(3);
            expect(firstJob.accomplishments[0]).toBe('Led development of customer-facing web application');

            const secondJob = result.experience[1];
            expect(secondJob.jobTitle).toBe('Software Engineer');
            expect(secondJob.company).toBe('Digital Innovations LLC');
            expect(secondJob.isCurrentRole).toBe(false);
        });

        it('should extract education correctly', () => {
            const parser = new MarkdownParser(sampleMarkdown);
            const result = parser.parseMarkdown();

            expect(result.education).toHaveLength(1);

            const education = result.education[0];
            expect(education.degree).toBe('Bachelor of Science in Computer Science');
            expect(education.institution).toBe('University of California, Berkeley');
            expect(education.graduationDate).toBe('Graduated May 2018');
            expect(education.gpa).toBe('3.7/4.0');
            expect(education.relevantCoursework).toEqual(['Data Structures', 'Algorithms', 'Database Systems']);
        });

        it('should extract skills correctly', () => {
            const parser = new MarkdownParser(sampleMarkdown);
            const result = parser.parseMarkdown();

            expect(result.skills.technical).toContain('JavaScript');
            expect(result.skills.technical).toContain('TypeScript');
            expect(result.skills.technical).toContain('Python');
            expect(result.skills.technical).toContain('React');
            expect(result.skills.technical).toContain('Vue.js');
            expect(result.skills.technical).toContain('HTML5');

            expect(result.skills.soft).toContain('Team Leadership');
            expect(result.skills.soft).toContain('Project Management');
        });

        it('should extract certifications correctly', () => {
            const parser = new MarkdownParser(sampleMarkdown);
            const result = parser.parseMarkdown();

            expect(result.certifications).toBeDefined();
            expect(result.certifications).toHaveLength(1);

            const cert = result.certifications![0];
            expect(cert.name).toBe('AWS Certified Solutions Architect');
            expect(cert.issuer).toBe('Amazon Web Services');
            expect(cert.dateObtained).toBe('March 2023');
        });

        it('should extract projects correctly', () => {
            const parser = new MarkdownParser(sampleMarkdown);
            const result = parser.parseMarkdown();

            expect(result.projects).toBeDefined();
            expect(result.projects).toHaveLength(1);

            const project = result.projects![0];
            expect(project.name).toBe('E-commerce Platform');
            expect(project.duration).toBe('2023');
            expect(project.accomplishments).toHaveLength(2);
            expect(project.accomplishments[0]).toBe('Built full-stack e-commerce application');
            expect(project.technologies).toEqual(['React', 'Node.js', 'PostgreSQL']);
        });
    });

    describe('validateStructure', () => {
        it('should validate complete resume as valid', () => {
            const parser = new MarkdownParser(sampleMarkdown);
            const validation = parser.validateStructure();

            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should detect missing required sections', () => {
            const incompleteMarkdown = `# John Doe

**Email:** john.doe@email.com

## Professional Summary

Some summary text.`;

            const parser = new MarkdownParser(incompleteMarkdown);
            const validation = parser.validateStructure();

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Missing required Work Experience section');
            expect(validation.errors).toContain('Missing required Education section');
        });

        it('should detect missing email', () => {
            const noEmailMarkdown = `# John Doe

**Phone:** (555) 123-4567

## Work Experience

### Software Engineer

**Company** | _2020 - Present_

- Did stuff

## Education

### Bachelor Degree

**University** | _2018_`;

            const parser = new MarkdownParser(noEmailMarkdown);
            const validation = parser.validateStructure();

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Missing required email address');
        });

        it('should detect missing name', () => {
            const noNameMarkdown = `**Email:** john.doe@email.com

## Work Experience

### Software Engineer

**Company** | _2020 - Present_

- Did stuff

## Education

### Bachelor Degree

**University** | _2018_`;

            const parser = new MarkdownParser(noNameMarkdown);
            const validation = parser.validateStructure();

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Missing required name (first heading)');
        });
    });

    describe('edge cases', () => {
        it('should handle empty markdown', () => {
            const parser = new MarkdownParser('');
            const result = parser.parseMarkdown();

            expect(result.personalInfo.fullName).toBe('');
            expect(result.personalInfo.email).toBe('');
            expect(result.experience).toHaveLength(0);
            expect(result.education).toHaveLength(0);
            expect(result.skills.technical).toHaveLength(0);
        });

        it('should handle markdown with only name', () => {
            const parser = new MarkdownParser('# Jane Smith');
            const result = parser.parseMarkdown();

            expect(result.personalInfo.fullName).toBe('Jane Smith');
            expect(result.personalInfo.email).toBe('');
            expect(result.summary).toBe('');
        });

        it('should handle alternative section names', () => {
            const altMarkdown = `# John Doe

**Email:** john@example.com

## Summary

Brief summary here.

## Experience

### Developer

**Company** | _2020 - Present_

- Worked on things

## Education

### Degree

**School** | _2018_`;

            const parser = new MarkdownParser(altMarkdown);
            const result = parser.parseMarkdown();

            expect(result.summary).toBe('Brief summary here.');
            expect(result.experience).toHaveLength(1);
            expect(result.experience[0].jobTitle).toBe('Developer');
        });

        it('should handle missing optional sections', () => {
            const minimalMarkdown = `# John Doe

**Email:** john@example.com

## Work Experience

### Developer

**Company** | _2020 - Present_

- Did work

## Education

### Degree

**School** | _2018_

## Skills

### Technical Skills

- JavaScript
- React`;

            const parser = new MarkdownParser(minimalMarkdown);
            const result = parser.parseMarkdown();

            expect(result.certifications).toBeUndefined();
            expect(result.projects).toBeUndefined();
            expect(result.skills.technical).toContain('JavaScript');
            expect(result.skills.technical).toContain('React');
        });
    });
});