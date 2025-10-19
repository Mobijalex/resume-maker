import { marked } from 'marked';
import type {
    ResumeData,
    PersonalInfo,
    WorkExperience,
    Education,
    Skills,
    Certification,
    Project
} from '../types/resume';
import { importMarkdownParser } from './dynamicImports';

/**
 * MarkdownParser class for extracting structured resume data from Markdown content
 */
export class MarkdownParser {
    private markdownContent: string;
    private rawText: string;

    constructor(markdownContent: string) {
        this.markdownContent = markdownContent.trim();
        this.rawText = this.markdownContent;
    }

    /**
     * Parse the Markdown content and extract structured resume data
     */
    public async parseMarkdown(): Promise<ResumeData> {
        // Dynamically import marked library for better code splitting
        const { marked } = await importMarkdownParser();

        const sections = this.extractSections();

        return {
            personalInfo: this.extractPersonalInfo(sections),
            summary: this.extractSummary(sections),
            experience: this.extractWorkExperience(sections),
            education: this.extractEducation(sections),
            skills: this.extractSkills(sections),
            certifications: this.extractCertifications(sections),
            projects: this.extractProjects(sections)
        };
    }

    /**
     * Extract sections from the Markdown content using regex
     */
    private extractSections(): Map<string, string> {
        const sections = new Map<string, string>();

        // Split content by headers (## or ###)
        const sectionRegex = /^(#{1,3})\s+(.+?)$/gm;
        const matches = [...this.rawText.matchAll(sectionRegex)];

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const headerLevel = match[1].length;
            const sectionTitle = match[2].trim();
            const startIndex = match.index! + match[0].length;

            // Find the end of this section (next header of same or higher level)
            let endIndex = this.rawText.length;
            for (let j = i + 1; j < matches.length; j++) {
                const nextMatch = matches[j];
                const nextHeaderLevel = nextMatch[1].length;
                if (nextHeaderLevel <= headerLevel) {
                    endIndex = nextMatch.index!;
                    break;
                }
            }

            const sectionContent = this.rawText.substring(startIndex, endIndex).trim();
            sections.set(sectionTitle.toLowerCase(), sectionContent);
        }

        return sections;
    }

    /**
     * Extract personal information from the header section
     */
    private extractPersonalInfo(sections: Map<string, string>): PersonalInfo {
        // Extract name from the first line (should be # Name)
        const nameMatch = this.rawText.match(/^#\s+(.+?)$/m);
        const fullName = nameMatch ? nameMatch[1].trim() : '';

        // Look for contact info in the beginning of the document
        const contactInfo = this.extractContactInfo();

        return {
            fullName,
            email: contactInfo.email || '',
            phone: contactInfo.phone || '',
            location: contactInfo.location || '',
            linkedin: contactInfo.linkedin,
            website: contactInfo.website
        };
    }

    /**
     * Extract contact information from the beginning of the document
     */
    private extractContactInfo(): Partial<PersonalInfo> {
        const contactInfo: Partial<PersonalInfo> = {};

        // Get the first few lines after the name
        const lines = this.rawText.split('\n').slice(0, 10);
        const contactText = lines.join('\n');

        // Extract email
        const emailMatch = contactText.match(/\*\*Email:\*\*\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (emailMatch) contactInfo.email = emailMatch[1];

        // Extract phone
        const phoneMatch = contactText.match(/\*\*Phone:\*\*\s*(\([0-9]{3}\)\s?[0-9]{3}-[0-9]{4}|[0-9]{3}-[0-9]{3}-[0-9]{4}|\+?[0-9\s\-\(\)]{10,})/i);
        if (phoneMatch) contactInfo.phone = phoneMatch[1];

        // Extract location
        const locationMatch = contactText.match(/\*\*Location:\*\*\s*([A-Za-z\s,]+(?:,\s*[A-Z]{2})?)/i);
        if (locationMatch) contactInfo.location = locationMatch[1].trim();

        // Extract LinkedIn
        const linkedinMatch = contactText.match(/\*\*LinkedIn:\*\*\s*((?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+|linkedin\.com\/in\/[a-zA-Z0-9-]+)/i);
        if (linkedinMatch) contactInfo.linkedin = linkedinMatch[1];

        // Extract website
        const websiteMatch = contactText.match(/\*\*Website:\*\*\s*((?:https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
        if (websiteMatch && !websiteMatch[1].includes('linkedin.com')) {
            contactInfo.website = websiteMatch[1];
        }

        return contactInfo;
    }

    /**
     * Extract professional summary
     */
    private extractSummary(sections: Map<string, string>): string {
        const summarySection = sections.get('professional summary') || sections.get('summary') || sections.get('about');
        if (!summarySection) return '';

        // Return the first paragraph of the summary section
        const paragraphs = summarySection.split('\n\n');
        return paragraphs[0]?.trim() || '';
    }

    /**
     * Extract work experience
     */
    private extractWorkExperience(sections: Map<string, string>): WorkExperience[] {
        const experienceSection = sections.get('work experience') || sections.get('experience') || sections.get('employment');
        if (!experienceSection) return [];

        const experiences: WorkExperience[] = [];

        // Split by job titles (### headers)
        const jobSections = experienceSection.split(/^###\s+/m).filter(section => section.trim());

        for (const jobSection of jobSections) {
            const lines = jobSection.split('\n').filter(line => line.trim());
            if (lines.length === 0) continue;

            const jobTitle = lines[0].trim();
            let company = '';
            let duration = '';
            let isCurrentRole = false;
            const accomplishments: string[] = [];

            // Look for company and duration line
            const companyLine = lines.find(line => line.includes('**') && line.includes('|'));
            if (companyLine) {
                const companyMatch = companyLine.match(/\*\*(.+?)\*\*\s*\|\s*_(.+?)_/);
                if (companyMatch) {
                    company = companyMatch[1].trim();
                    duration = companyMatch[2].trim();
                    isCurrentRole = duration.toLowerCase().includes('present');
                }
            }

            // Extract accomplishments (bullet points)
            for (const line of lines) {
                if (line.trim().startsWith('-')) {
                    accomplishments.push(line.trim().substring(1).trim());
                }
            }

            if (jobTitle) {
                experiences.push({
                    jobTitle,
                    company,
                    duration,
                    accomplishments,
                    isCurrentRole
                });
            }
        }

        return experiences;
    }

    /**
     * Extract education information
     */
    private extractEducation(sections: Map<string, string>): Education[] {
        const educationSection = sections.get('education');
        if (!educationSection) return [];

        const educationEntries: Education[] = [];

        // Split by degree titles (### headers)
        const degreeSections = educationSection.split(/^###\s+/m).filter(section => section.trim());

        for (const degreeSection of degreeSections) {
            const lines = degreeSection.split('\n').filter(line => line.trim());
            if (lines.length === 0) continue;

            const degree = lines[0].trim();
            let institution = '';
            let graduationDate = '';
            let gpa: string | undefined;
            let relevantCoursework: string[] | undefined;

            // Look for institution and graduation date line
            const institutionLine = lines.find(line => line.includes('**') && line.includes('|'));
            if (institutionLine) {
                const institutionMatch = institutionLine.match(/\*\*(.+?)\*\*\s*\|\s*_(.+?)_/);
                if (institutionMatch) {
                    institution = institutionMatch[1].trim();
                    graduationDate = institutionMatch[2].trim();
                }
            }

            // Look for GPA
            const gpaLine = lines.find(line => line.toLowerCase().includes('gpa'));
            if (gpaLine) {
                const gpaMatch = gpaLine.match(/\*\*GPA:\*\*\s*([0-9.\/]+)/i);
                if (gpaMatch) {
                    gpa = gpaMatch[1];
                }
            }

            // Look for relevant coursework
            const courseworkLine = lines.find(line => line.toLowerCase().includes('relevant coursework'));
            if (courseworkLine) {
                const courseworkMatch = courseworkLine.match(/\*\*Relevant Coursework:\*\*\s*(.+)/i);
                if (courseworkMatch) {
                    relevantCoursework = courseworkMatch[1]
                        .split(',')
                        .map(course => course.trim());
                }
            }

            if (degree) {
                educationEntries.push({
                    degree,
                    institution,
                    graduationDate,
                    gpa,
                    relevantCoursework
                });
            }
        }

        return educationEntries;
    }

    /**
     * Extract skills information
     */
    private extractSkills(sections: Map<string, string>): Skills {
        const skillsSection = sections.get('skills');
        if (!skillsSection) return { technical: [] };

        const skills: Skills = { technical: [] };

        // Split by skill categories (### headers)
        const skillCategories = skillsSection.split(/^###\s+/m).filter(section => section.trim());

        for (const categorySection of skillCategories) {
            const lines = categorySection.split('\n').filter(line => line.trim());
            if (lines.length === 0) continue;

            const categoryName = lines[0].trim().toLowerCase();
            const skillItems: string[] = [];

            // Extract skills from bullet points and bold items
            for (const line of lines.slice(1)) {
                if (line.trim().startsWith('-')) {
                    // Handle bullet points with categories like "- **Languages:** JavaScript, Python"
                    const bulletContent = line.trim().substring(1).trim();
                    const colonIndex = bulletContent.indexOf(':');
                    if (colonIndex > -1) {
                        // Remove markdown formatting and extract skills after colon
                        const skillsText = bulletContent.substring(colonIndex + 1).trim();
                        const cleanSkillsText = skillsText.replace(/\*\*/g, ''); // Remove bold formatting
                        const individualSkills = cleanSkillsText.split(',').map(s => s.trim()).filter(Boolean);
                        skillItems.push(...individualSkills);
                    } else {
                        const cleanBulletContent = bulletContent.replace(/\*\*/g, ''); // Remove bold formatting
                        skillItems.push(cleanBulletContent);
                    }
                }
            }

            // Categorize skills
            if (categoryName.includes('technical') || categoryName.includes('tech')) {
                skills.technical.push(...skillItems);
            } else if (categoryName.includes('language')) {
                skills.languages = (skills.languages || []).concat(skillItems);
            } else if (categoryName.includes('soft')) {
                skills.soft = (skills.soft || []).concat(skillItems);
            } else {
                // Default to technical if category is unclear
                skills.technical.push(...skillItems);
            }
        }

        return skills;
    }

    /**
     * Extract certifications (optional section)
     */
    private extractCertifications(sections: Map<string, string>): Certification[] | undefined {
        const certificationsSection = sections.get('certifications') || sections.get('certificates');
        if (!certificationsSection) return undefined;

        const certifications: Certification[] = [];

        // Split by certification titles (### headers)
        const certSections = certificationsSection.split(/^###\s+/m).filter(section => section.trim());

        for (const certSection of certSections) {
            const lines = certSection.split('\n').filter(line => line.trim());
            if (lines.length === 0) continue;

            const name = lines[0].trim();
            let issuer = '';
            let dateObtained = '';

            // Look for issuer and date line
            const issuerLine = lines.find(line => line.includes('**') && line.includes('|'));
            if (issuerLine) {
                const issuerMatch = issuerLine.match(/\*\*(.+?)\*\*\s*\|\s*_(.+?)_/);
                if (issuerMatch) {
                    issuer = issuerMatch[1].trim();
                    dateObtained = issuerMatch[2].replace(/^Issued\s+/i, '').trim();
                }
            }

            if (name) {
                certifications.push({
                    name,
                    issuer,
                    dateObtained,
                    expirationDate: undefined,
                    credentialId: undefined
                });
            }
        }

        return certifications.length > 0 ? certifications : undefined;
    }

    /**
     * Extract projects (optional section)
     */
    private extractProjects(sections: Map<string, string>): Project[] | undefined {
        const projectsSection = sections.get('projects');
        if (!projectsSection) return undefined;

        const projects: Project[] = [];

        // Split by project titles (### headers)
        const projectSections = projectsSection.split(/^###\s+/m).filter(section => section.trim());

        for (const projectSection of projectSections) {
            const lines = projectSection.split('\n').filter(line => line.trim());
            if (lines.length === 0) continue;

            const name = lines[0].trim();
            let duration: string | undefined;
            let description = '';
            const accomplishments: string[] = [];
            let technologies: string[] = [];

            // Look for project type and duration line
            const typeLine = lines.find(line => line.includes('**') && line.includes('|'));
            if (typeLine) {
                const typeMatch = typeLine.match(/\*\*(.+?)\*\*\s*\|\s*_(.+?)_/);
                if (typeMatch) {
                    duration = typeMatch[2].trim();
                }
            }

            // Extract accomplishments and technologies
            for (const line of lines) {
                if (line.trim().startsWith('-')) {
                    const bulletContent = line.trim().substring(1).trim();
                    // Check if this line contains technologies
                    if (bulletContent.toLowerCase().includes('technologies:')) {
                        const techMatch = bulletContent.match(/\*\*Technologies:\*\*\s*(.+)/i);
                        if (techMatch) {
                            technologies = techMatch[1].split(',').map(tech => tech.trim());
                        }
                    } else {
                        accomplishments.push(bulletContent);
                    }
                } else if (line.includes('**Technologies:**')) {
                    const techMatch = line.match(/\*\*Technologies:\*\*\s*(.+)/i);
                    if (techMatch) {
                        technologies = techMatch[1].split(',').map(tech => tech.trim());
                    }
                }
            }

            if (name) {
                projects.push({
                    name,
                    description,
                    technologies,
                    duration,
                    url: undefined,
                    accomplishments
                });
            }
        }

        return projects.length > 0 ? projects : undefined;
    }

    /**
     * Validate that required sections are present
     */
    public validateStructure(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const sections = this.extractSections();

        // Check for required sections
        if (!sections.has('work experience') && !sections.has('experience') && !sections.has('employment')) {
            errors.push('Missing required Work Experience section');
        }

        if (!sections.has('education')) {
            errors.push('Missing required Education section');
        }

        // Check for contact information
        const contactInfo = this.extractContactInfo();
        if (!contactInfo.email) {
            errors.push('Missing required email address');
        }

        // Check for name (first heading)
        const nameMatch = this.rawText.match(/^#\s+(.+?)$/m);
        if (!nameMatch) {
            errors.push('Missing required name (first heading)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}