/**
 * Integration tests for validation system with MarkdownParser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownParser } from '../MarkdownParser';
import { ResumeValidator } from '../validation';
import { ErrorHandler } from '../errorHandler';

describe('Validation Integration Tests', () => {
    let parser: MarkdownParser;
    let validator: ResumeValidator;
    let errorHandler: ErrorHandler;

    beforeEach(() => {
        validator = new ResumeValidator();
        errorHandler = new ErrorHandler();
    });

    describe('Complete Resume Validation Flow', () => {
        it('should validate a complete, well-formatted resume successfully', () => {
            const completeMarkdown = `# John Doe

**Email:** john.doe@example.com  
**Phone:** (555) 123-4567  
**Location:** New York, NY  
**LinkedIn:** https://linkedin.com/in/johndoe  
**Website:** https://johndoe.com

## Professional Summary

Experienced software engineer with 5+ years of expertise in full-stack development. Proven track record of delivering scalable applications and leading cross-functional teams to achieve business objectives.

## Work Experience

### Senior Software Engineer
**Tech Corp Inc** | _January 2020 - Present_

- Led development of microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored junior developers and conducted code reviews

### Software Engineer
**StartupXYZ** | _June 2018 - December 2019_

- Built responsive web applications using React and Node.js
- Collaborated with design team to implement pixel-perfect UIs
- Optimized database queries improving performance by 40%

## Education

### Bachelor of Science in Computer Science
**University of Technology** | _May 2018_

**GPA:** 3.8/4.0  
**Relevant Coursework:** Data Structures, Algorithms, Software Engineering

## Skills

### Technical Skills
- **Languages:** JavaScript, Python, Java, TypeScript
- **Frameworks:** React, Node.js, Express, Django
- **Databases:** PostgreSQL, MongoDB, Redis
- **Tools:** Git, Docker, AWS, Jenkins

### Soft Skills
- Leadership and team management
- Problem-solving and analytical thinking
- Communication and presentation skills

## Certifications

### AWS Certified Solutions Architect
**Amazon Web Services** | _Issued March 2023_

### Certified Scrum Master
**Scrum Alliance** | _Issued January 2022_

## Projects

### E-commerce Platform
**Personal Project** | _January 2023 - March 2023_

- Built full-stack e-commerce application with payment integration
- **Technologies:** React, Node.js, PostgreSQL, Stripe API
- Implemented real-time inventory management system
- Deployed on AWS with auto-scaling capabilities`;

            parser = new MarkdownParser(completeMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            expect(validationResult.isValid).toBe(true);
            expect(validationResult.errors).toHaveLength(0);
            expect(validationResult.warnings.length).toBeLessThanOrEqual(1); // May have minor warnings
        });

        it('should identify and report multiple validation errors in incomplete resume', () => {
            const incompleteMarkdown = `# 

**Email:** invalid-email  
**Phone:**   
**Location:**   

## Professional Summary

Short.

## Work Experience

### 
**Company** | _Invalid Date_

## Education

## Skills

### Technical Skills`;

            parser = new MarkdownParser(incompleteMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            expect(validationResult.isValid).toBe(false);
            expect(validationResult.errors.length).toBeGreaterThan(5);

            // Check for specific error types
            const errorFields = validationResult.errors.map(e => e.field);
            const errorMessages = validationResult.errors.map(e => e.message);



            // Check that we have errors for required fields based on the actual validation behavior
            const hasEmailError = errorFields.includes('email') ||
                errorMessages.some(m => m.toLowerCase().includes('email'));
            const hasPhoneError = errorFields.includes('phone') ||
                errorMessages.some(m => m.toLowerCase().includes('phone'));
            const hasLocationError = errorFields.includes('location') ||
                errorMessages.some(m => m.toLowerCase().includes('location'));
            const hasEducationError = errorFields.includes('education') ||
                errorMessages.some(m => m.toLowerCase().includes('education'));
            const hasTechnicalError = errorFields.includes('technical') ||
                errorMessages.some(m => m.toLowerCase().includes('technical'));

            // We should have validation errors for the incomplete/invalid data
            expect(hasEmailError).toBe(true);
            expect(hasPhoneError).toBe(true);
            expect(hasLocationError).toBe(true);
            expect(hasEducationError).toBe(true);
            expect(hasTechnicalError).toBe(true);

            // Should also have experience-related errors
            expect(errorFields.some(f => f?.includes('experience'))).toBe(true);
        });

        it('should handle missing required sections gracefully', () => {
            const minimalMarkdown = `# Jane Smith

**Email:** jane.smith@example.com  
**Phone:** (555) 987-6543  
**Location:** San Francisco, CA

## Professional Summary

Marketing professional with digital expertise.`;

            parser = new MarkdownParser(minimalMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            expect(validationResult.isValid).toBe(false);

            // Should have errors for missing required sections
            const sectionErrors = validationResult.errors.filter(e =>
                e.field === 'experience' || e.field === 'education' || e.field === 'technical'
            );
            expect(sectionErrors.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('Error Handler Integration', () => {
        it('should properly handle and categorize validation errors', () => {
            const problematicMarkdown = `# Test User

**Email:** bad-email  
**Phone:** 123  
**Location:** 

## Work Experience

### Job Title
**Company** | _Bad Date Format_

- No accomplishments listed

## Education

### 
**School** | _2020_

## Skills

### Technical Skills
- JavaScript`;

            parser = new MarkdownParser(problematicMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            // Process errors through error handler
            validationResult.errors.forEach(error => {
                errorHandler.handleValidationError(error);
            });

            // Check that we have validation errors from different sections
            const allErrors = errorHandler.getAllErrors();
            expect(allErrors.length).toBeGreaterThan(0);

            // Check that we have errors from personal info (email, phone, location issues)
            const personalInfoErrors = allErrors.filter(e =>
                e.section === 'Personal Information' ||
                (e.field && ['email', 'phone', 'location', 'fullName'].includes(e.field))
            );
            expect(personalInfoErrors.length).toBeGreaterThan(0);

            // Check that we have some validation errors (the test data should generate multiple errors)
            expect(allErrors.filter(e => e.type === 'VALIDATION').length).toBeGreaterThan(3);

            // Check error summary
            const summary = errorHandler.getErrorSummary();
            expect(summary.total).toBeGreaterThan(0);
            expect(summary.byType.VALIDATION).toBe(summary.total);
        });

        it('should create user-friendly error messages for validation issues', () => {
            const invalidMarkdown = `# 

**Email:** not-an-email  
**Phone:**   
**Location:**   

## Work Experience

## Education

## Skills`;

            parser = new MarkdownParser(invalidMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            validationResult.errors.forEach(error => {
                errorHandler.handleValidationError(error);
            });

            const allErrors = errorHandler.getAllErrors();
            const userFriendlyMessages = ErrorHandler.createUserFriendlyMessages(allErrors);

            expect(userFriendlyMessages.summary).toContain('issue(s)');
            expect(userFriendlyMessages.details.some(d => d.includes('validation issue(s)'))).toBe(true);
            expect(userFriendlyMessages.suggestions.some(s => s.includes('Complete all required fields') || s.includes('check formatting'))).toBe(true);
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle resume with optional sections correctly', () => {
            const resumeWithOptionals = `# Alice Johnson

**Email:** alice.johnson@example.com  
**Phone:** (555) 456-7890  
**Location:** Boston, MA  
**LinkedIn:** https://linkedin.com/in/alicejohnson

## Professional Summary

Data scientist with expertise in machine learning and statistical analysis.

## Work Experience

### Data Scientist
**DataCorp** | _March 2021 - Present_

- Developed predictive models improving accuracy by 25%
- Analyzed large datasets using Python and R

## Education

### Master of Science in Data Science
**MIT** | _June 2021_

## Skills

### Technical Skills
- **Languages:** Python, R, SQL
- **Tools:** TensorFlow, Pandas, Jupyter

## Certifications

### Google Cloud Professional Data Engineer
**Google** | _Issued September 2022_

## Projects

### Customer Churn Prediction
**Personal Project** | _January 2023 - February 2023_

- Built machine learning model to predict customer churn
- **Technologies:** Python, Scikit-learn, PostgreSQL
- Achieved 92% accuracy on test dataset`;

            parser = new MarkdownParser(resumeWithOptionals);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            expect(validationResult.isValid).toBe(true);
            expect(validationResult.errors).toHaveLength(0);

            // Should have valid optional sections
            expect(resumeData.certifications).toBeDefined();
            expect(resumeData.projects).toBeDefined();
            expect(resumeData.certifications!.length).toBeGreaterThan(0);
            expect(resumeData.projects!.length).toBeGreaterThan(0);
        });

        it('should provide helpful warnings for improvement opportunities', () => {
            const improvableMarkdown = `# Bob Wilson

**Email:** bob.wilson@example.com  
**Phone:** (555) 321-0987  
**Location:** Chicago, IL

## Professional Summary

Developer.

## Work Experience

### Developer
**Company** | _2020 - Present_

## Education

### Computer Science Degree
**University** | _2020_

## Skills

### Technical Skills
- JavaScript
- 
- Python`;

            parser = new MarkdownParser(improvableMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            expect(validationResult.warnings.length).toBeGreaterThan(0);

            // Should have warnings about short summary, empty accomplishments, empty skills
            const warningMessages = validationResult.warnings.map(w => w.userMessage);
            expect(warningMessages.some(m => m.includes('summary'))).toBe(true);
            expect(warningMessages.some(m => m.includes('accomplishments') || m.includes('skill'))).toBe(true);
        });

        it('should validate complex date formats correctly', () => {
            const dateVariationsMarkdown = `# Test User

**Email:** test@example.com  
**Phone:** (555) 123-4567  
**Location:** Test City

## Work Experience

### Current Role
**Current Company** | _January 2023 - Present_

- Current role accomplishment

### Previous Role
**Previous Company** | _June 2020 - December 2022_

- Previous role accomplishment

### Old Role
**Old Company** | _2018 - 2020_

- Old role accomplishment

## Education

### Recent Degree
**Recent University** | _May 2020_

### Older Degree
**Older University** | _2018_

### Very Old Degree
**Very Old University** | _December 2016_

## Skills

### Technical Skills
- JavaScript
- Python`;

            parser = new MarkdownParser(dateVariationsMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            expect(validationResult.isValid).toBe(true);
            expect(validationResult.errors).toHaveLength(0);

            // All date formats should be accepted
            expect(resumeData.experience).toHaveLength(3);
            expect(resumeData.education).toHaveLength(3);
        });
    });

    describe('Performance and Edge Cases', () => {
        it('should handle very large resume content efficiently', () => {
            const largeContent = `# Performance Test User

**Email:** performance@example.com  
**Phone:** (555) 999-8888  
**Location:** Performance City

## Professional Summary

${'Very detailed professional summary with lots of information. '.repeat(20)}

## Work Experience

${Array.from({ length: 10 }, (_, i) => `
### Job Title ${i + 1}
**Company ${i + 1}** | _January ${2010 + i} - December ${2010 + i}_

${Array.from({ length: 5 }, (_, j) => `- Accomplishment ${j + 1} for job ${i + 1}`).join('\n')}
`).join('\n')}

## Education

${Array.from({ length: 3 }, (_, i) => `
### Degree ${i + 1}
**University ${i + 1}** | _May ${2005 + i * 2}_
`).join('\n')}

## Skills

### Technical Skills
${Array.from({ length: 50 }, (_, i) => `- Skill ${i + 1}`).join('\n')}`;

            const startTime = Date.now();
            parser = new MarkdownParser(largeContent);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);
            const endTime = Date.now();

            // Should complete within reasonable time (less than 1 second)
            expect(endTime - startTime).toBeLessThan(1000);
            expect(validationResult.isValid).toBe(true);
            expect(resumeData.experience).toHaveLength(10);
            expect(resumeData.education).toHaveLength(3);
        });

        it('should handle malformed markdown gracefully', () => {
            const malformedMarkdown = `# Test User

**Email:** test@example.com
**Phone:** (555) 123-4567
**Location:** Test City

## Work Experience

### Job Title
**Company | _Date Range_

- Accomplishment without proper formatting

## Education

### Degree
**School | _Date

## Skills

### Technical
- Skill 1
- Skill 2`;

            parser = new MarkdownParser(malformedMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            // Should not crash and should provide meaningful validation results
            expect(validationResult).toBeDefined();
            expect(Array.isArray(validationResult.errors)).toBe(true);
            expect(Array.isArray(validationResult.warnings)).toBe(true);
        });

        it('should handle empty or whitespace-only content', () => {
            const emptyMarkdown = '   \n\n   \t   \n   ';

            parser = new MarkdownParser(emptyMarkdown);
            const resumeData = parser.parseMarkdown();
            const validationResult = validator.validateResumeData(resumeData);

            expect(validationResult.isValid).toBe(false);
            expect(validationResult.errors.length).toBeGreaterThan(0);

            // Should have errors for all required sections
            const errorFields = validationResult.errors.map(e => e.field);
            expect(errorFields).toContain('fullName');
            expect(errorFields).toContain('email');
            expect(errorFields).toContain('experience');
            expect(errorFields).toContain('education');
            expect(errorFields).toContain('technical');
        });
    });
});