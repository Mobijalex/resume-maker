/**
 * Comprehensive tests for resume validation functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ResumeValidator, VALIDATION_RULES } from '../validation';
import type { ResumeData, PersonalInfo, WorkExperience, Education, Skills } from '../../types/resume';

describe('ResumeValidator', () => {
    let validator: ResumeValidator;

    beforeEach(() => {
        validator = new ResumeValidator();
    });

    describe('Personal Information Validation', () => {
        it('should validate complete personal info successfully', () => {
            const personalInfo: PersonalInfo = {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                phone: '(555) 123-4567',
                location: 'New York, NY',
                linkedin: 'https://linkedin.com/in/johndoe',
                website: 'https://johndoe.com'
            };

            const result = validator.validatePersonalInfo(personalInfo);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for missing required fields', () => {
            const personalInfo: PersonalInfo = {
                fullName: '',
                email: '',
                phone: '',
                location: ''
            };

            const result = validator.validatePersonalInfo(personalInfo);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(4); // fullName, email, phone, location

            const errorFields = result.errors.map(e => e.field);
            expect(errorFields).toContain('fullName');
            expect(errorFields).toContain('email');
            expect(errorFields).toContain('phone');
            expect(errorFields).toContain('location');
        });

        it('should validate email format correctly', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.org',
                'user123@test-domain.com'
            ];

            const invalidEmails = [
                'invalid-email',
                '@example.com',
                'user@',
                'user@.com',
                'user space@example.com'
            ];

            validEmails.forEach(email => {
                const personalInfo: PersonalInfo = {
                    fullName: 'Test User',
                    email,
                    phone: '(555) 123-4567',
                    location: 'Test City'
                };
                const result = validator.validatePersonalInfo(personalInfo);
                expect(result.isValid).toBe(true);
            });

            invalidEmails.forEach(email => {
                const personalInfo: PersonalInfo = {
                    fullName: 'Test User',
                    email,
                    phone: '(555) 123-4567',
                    location: 'Test City'
                };
                const result = validator.validatePersonalInfo(personalInfo);
                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.field === 'email')).toBe(true);
            });
        });

        it('should validate phone format correctly', () => {
            const validPhones = [
                '(555) 123-4567',
                '555-123-4567',
                '555.123.4567',
                '5551234567',
                '+1 555 123 4567'
            ];

            const invalidPhones = [
                '123',
                'abc-def-ghij',
                '555-123',
                '(555) 123-456'
            ];

            validPhones.forEach(phone => {
                const personalInfo: PersonalInfo = {
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone,
                    location: 'Test City'
                };
                const result = validator.validatePersonalInfo(personalInfo);
                expect(result.isValid).toBe(true);
            });

            invalidPhones.forEach(phone => {
                const personalInfo: PersonalInfo = {
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone,
                    location: 'Test City'
                };
                const result = validator.validatePersonalInfo(personalInfo);
                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.field === 'phone')).toBe(true);
            });
        });

        it('should validate LinkedIn URL format', () => {
            const validLinkedInUrls = [
                'https://linkedin.com/in/johndoe',
                'https://www.linkedin.com/in/johndoe',
                'linkedin.com/in/johndoe',
                'https://linkedin.com/in/john-doe-123'
            ];

            const invalidLinkedInUrls = [
                'https://facebook.com/johndoe',
                'linkedin.com/johndoe',
                'https://linkedin.com/company/test'
            ];

            validLinkedInUrls.forEach(linkedin => {
                const personalInfo: PersonalInfo = {
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '(555) 123-4567',
                    location: 'Test City',
                    linkedin
                };
                const result = validator.validatePersonalInfo(personalInfo);
                expect(result.isValid).toBe(true);
            });

            invalidLinkedInUrls.forEach(linkedin => {
                const personalInfo: PersonalInfo = {
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '(555) 123-4567',
                    location: 'Test City',
                    linkedin
                };
                const result = validator.validatePersonalInfo(personalInfo);
                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.field === 'linkedin')).toBe(true);
            });
        });

        it('should validate field length constraints', () => {
            // Test minimum length
            const shortName: PersonalInfo = {
                fullName: 'A', // Too short
                email: 'test@example.com',
                phone: '(555) 123-4567',
                location: 'Test City'
            };
            const shortNameResult = validator.validatePersonalInfo(shortName);
            expect(shortNameResult.isValid).toBe(false);
            expect(shortNameResult.errors.some(e => e.field === 'fullName')).toBe(true);

            // Test maximum length
            const longName: PersonalInfo = {
                fullName: 'A'.repeat(101), // Too long
                email: 'test@example.com',
                phone: '(555) 123-4567',
                location: 'Test City'
            };
            const longNameResult = validator.validatePersonalInfo(longName);
            expect(longNameResult.isValid).toBe(false);
            expect(longNameResult.errors.some(e => e.field === 'fullName')).toBe(true);
        });
    });

    describe('Work Experience Validation', () => {
        it('should validate complete work experience successfully', () => {
            const experience: WorkExperience[] = [
                {
                    jobTitle: 'Software Engineer',
                    company: 'Tech Corp',
                    duration: 'January 2020 - Present',
                    accomplishments: ['Built scalable applications', 'Led team of 5 developers'],
                    isCurrentRole: true
                }
            ];

            const result = validator.validateWorkExperience(experience);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for empty experience array', () => {
            const result = validator.validateWorkExperience([]);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toBe('experience');
        });

        it('should validate required fields in experience entries', () => {
            const incompleteExperience: WorkExperience[] = [
                {
                    jobTitle: '',
                    company: '',
                    duration: '',
                    accomplishments: [],
                    isCurrentRole: false
                }
            ];

            const result = validator.validateWorkExperience(incompleteExperience);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);

            const errorFields = result.errors.map(e => e.field);
            expect(errorFields.some(f => f?.includes('jobTitle'))).toBe(true);
            expect(errorFields.some(f => f?.includes('company'))).toBe(true);
            expect(errorFields.some(f => f?.includes('duration'))).toBe(true);
            expect(errorFields.some(f => f?.includes('accomplishments'))).toBe(true);
        });

        it('should validate date range formats', () => {
            const validDateRanges = [
                'January 2020 - Present',
                'Jan 2020 - Dec 2022',
                '2020 - 2022',
                'Present',
                'Current'
            ];

            validDateRanges.forEach(duration => {
                const experience: WorkExperience[] = [
                    {
                        jobTitle: 'Software Engineer',
                        company: 'Tech Corp',
                        duration,
                        accomplishments: ['Test accomplishment'],
                        isCurrentRole: duration.toLowerCase().includes('present')
                    }
                ];
                const result = validator.validateWorkExperience(experience);
                expect(result.isValid).toBe(true);
            });
        });

        it('should warn about empty accomplishments', () => {
            const experience: WorkExperience[] = [
                {
                    jobTitle: 'Software Engineer',
                    company: 'Tech Corp',
                    duration: 'January 2020 - Present',
                    accomplishments: [],
                    isCurrentRole: true
                }
            ];

            const result = validator.validateWorkExperience(experience);
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings.some(w => w.field?.includes('accomplishments'))).toBe(true);
        });
    });

    describe('Education Validation', () => {
        it('should validate complete education successfully', () => {
            const education: Education[] = [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    institution: 'University of Technology',
                    graduationDate: 'May 2020',
                    gpa: '3.8',
                    relevantCoursework: ['Data Structures', 'Algorithms']
                }
            ];

            const result = validator.validateEducation(education);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for empty education array', () => {
            const result = validator.validateEducation([]);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toBe('education');
        });

        it('should validate required fields in education entries', () => {
            const incompleteEducation: Education[] = [
                {
                    degree: '',
                    institution: '',
                    graduationDate: ''
                }
            ];

            const result = validator.validateEducation(incompleteEducation);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);

            const errorFields = result.errors.map(e => e.field);
            expect(errorFields.some(f => f?.includes('degree'))).toBe(true);
            expect(errorFields.some(f => f?.includes('institution'))).toBe(true);
            expect(errorFields.some(f => f?.includes('graduationDate'))).toBe(true);
        });

        it('should validate graduation date formats', () => {
            const validDates = [
                'May 2020',
                'December 2019',
                '2020',
                '05/2020',
                '2020-05'
            ];

            const invalidDates = [
                'Invalid Date',
                '13/2020',
                'Tomorrow',
                '2020-13'
            ];

            validDates.forEach(graduationDate => {
                const education: Education[] = [
                    {
                        degree: 'Bachelor of Science',
                        institution: 'Test University',
                        graduationDate
                    }
                ];
                const result = validator.validateEducation(education);
                expect(result.isValid).toBe(true);
            });

            invalidDates.forEach(graduationDate => {
                const education: Education[] = [
                    {
                        degree: 'Bachelor of Science',
                        institution: 'Test University',
                        graduationDate
                    }
                ];
                const result = validator.validateEducation(education);
                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.field?.includes('graduationDate'))).toBe(true);
            });
        });
    });

    describe('Skills Validation', () => {
        it('should validate complete skills successfully', () => {
            const skills: Skills = {
                technical: ['JavaScript', 'Python', 'React'],
                languages: ['English', 'Spanish'],
                soft: ['Leadership', 'Communication']
            };

            const result = validator.validateSkills(skills);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for empty technical skills', () => {
            const skills: Skills = {
                technical: []
            };

            const result = validator.validateSkills(skills);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toBe('technical');
        });

        it('should warn about empty skill entries', () => {
            const skills: Skills = {
                technical: ['JavaScript', '', 'Python', '   ']
            };

            const result = validator.validateSkills(skills);
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings.some(w => w.field === 'technical')).toBe(true);
        });
    });

    describe('Summary Validation', () => {
        it('should validate appropriate summary length', () => {
            const goodSummary = 'Experienced software engineer with 5+ years of experience in full-stack development. Proven track record of delivering scalable applications.';

            const result = validator.validateSummary(goodSummary);
            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(0);
        });

        it('should warn about missing summary', () => {
            const result = validator.validateSummary('');
            expect(result.isValid).toBe(true); // Not required, but warning
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].field).toBe('summary');
        });

        it('should warn about too short summary', () => {
            const shortSummary = 'Short summary';

            const result = validator.validateSummary(shortSummary);
            expect(result.isValid).toBe(true); // Not required, but warning
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].field).toBe('summary');
        });

        it('should warn about too long summary', () => {
            const longSummary = 'A'.repeat(301);

            const result = validator.validateSummary(longSummary);
            expect(result.isValid).toBe(true); // Not required, but warning
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].field).toBe('summary');
        });
    });

    describe('Complete Resume Validation', () => {
        it('should validate complete resume data successfully', () => {
            const resumeData: ResumeData = {
                personalInfo: {
                    fullName: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '(555) 123-4567',
                    location: 'New York, NY'
                },
                summary: 'Experienced software engineer with expertise in full-stack development.',
                experience: [
                    {
                        jobTitle: 'Software Engineer',
                        company: 'Tech Corp',
                        duration: 'January 2020 - Present',
                        accomplishments: ['Built scalable applications'],
                        isCurrentRole: true
                    }
                ],
                education: [
                    {
                        degree: 'Bachelor of Science in Computer Science',
                        institution: 'University of Technology',
                        graduationDate: 'May 2020'
                    }
                ],
                skills: {
                    technical: ['JavaScript', 'Python', 'React']
                }
            };

            const result = validator.validateResumeData(resumeData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should collect all validation errors from all sections', () => {
            const incompleteResumeData: ResumeData = {
                personalInfo: {
                    fullName: '',
                    email: 'invalid-email',
                    phone: '',
                    location: ''
                },
                summary: '',
                experience: [],
                education: [],
                skills: {
                    technical: []
                }
            };

            const result = validator.validateResumeData(incompleteResumeData);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(5); // Multiple validation errors

            // Should have errors from all sections
            const sections = result.errors.map(e => e.section);
            expect(sections).toContain('Personal Information');
            expect(sections).toContain('Work Experience');
            expect(sections).toContain('Education');
            expect(sections).toContain('Skills');
        });
    });

    describe('Validation Rules Configuration', () => {
        it('should have correct validation rules structure', () => {
            expect(VALIDATION_RULES).toBeDefined();
            expect(VALIDATION_RULES.personalInfo).toBeDefined();
            expect(VALIDATION_RULES.experience).toBeDefined();
            expect(VALIDATION_RULES.education).toBeDefined();
            expect(VALIDATION_RULES.skills).toBeDefined();

            // Check that required sections are marked as required
            expect(VALIDATION_RULES.personalInfo.required).toBe(true);
            expect(VALIDATION_RULES.experience.required).toBe(true);
            expect(VALIDATION_RULES.education.required).toBe(true);
            expect(VALIDATION_RULES.skills.required).toBe(true);
        });

        it('should have proper field rules for each section', () => {
            // Personal info rules
            const personalInfoRules = VALIDATION_RULES.personalInfo.rules;
            expect(personalInfoRules.find(r => r.field === 'fullName')?.required).toBe(true);
            expect(personalInfoRules.find(r => r.field === 'email')?.required).toBe(true);
            expect(personalInfoRules.find(r => r.field === 'phone')?.required).toBe(true);
            expect(personalInfoRules.find(r => r.field === 'location')?.required).toBe(true);
            expect(personalInfoRules.find(r => r.field === 'linkedin')?.required).toBe(false);
            expect(personalInfoRules.find(r => r.field === 'website')?.required).toBe(false);

            // Experience rules
            const experienceRules = VALIDATION_RULES.experience.rules;
            expect(experienceRules.find(r => r.field === 'jobTitle')?.required).toBe(true);
            expect(experienceRules.find(r => r.field === 'company')?.required).toBe(true);
            expect(experienceRules.find(r => r.field === 'duration')?.required).toBe(true);
            expect(experienceRules.find(r => r.field === 'accomplishments')?.required).toBe(true);

            // Education rules
            const educationRules = VALIDATION_RULES.education.rules;
            expect(educationRules.find(r => r.field === 'degree')?.required).toBe(true);
            expect(educationRules.find(r => r.field === 'institution')?.required).toBe(true);
            expect(educationRules.find(r => r.field === 'graduationDate')?.required).toBe(true);

            // Skills rules
            const skillsRules = VALIDATION_RULES.skills.rules;
            expect(skillsRules.find(r => r.field === 'technical')?.required).toBe(true);
        });
    });
});