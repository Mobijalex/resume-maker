/**
 * Template renderer for converting resume data to HTML using template configurations
 */

import type { ResumeData, Template } from '../types';
import type { TemplateRenderer } from './types';

export class DefaultTemplateRenderer implements TemplateRenderer {
  renderHTML(resumeData: ResumeData, template: Template): string {
    const styles = this.generateStyles(template);
    const content = this.generateContent(resumeData, template);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${resumeData.personalInfo.fullName}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="resume-container">
          ${content}
        </div>
      </body>
      </html>
    `;
  }

  renderPreview(resumeData: ResumeData, template: Template): string {
    const styles = this.generateStyles(template);
    const content = this.generateContent(resumeData, template);

    return `
      <style>${styles}</style>
      <div class="resume-container preview">
        ${content}
      </div>
    `;
  }

  private generateStyles(template: Template): string {
    const { layout, styling } = template;

    return `
      .resume-container {
        max-width: 8.5in;
        width: 8.5in;
        min-height: 11in;
        margin: 0 auto;
        padding: ${layout.margins.top}in ${layout.margins.right}in ${layout.margins.bottom}in ${layout.margins.left}in;
        font-family: ${styling.fonts.primary}, ${styling.fonts.fallback.join(', ')};
        font-size: ${styling.sizes.bodyFont}pt;
        line-height: ${layout.spacing.lineHeight};
        color: ${styling.colors.text};
        background: white;
        box-sizing: border-box;
        page-break-inside: avoid;
      }
      
      .resume-container.preview {
        border: 1px solid #e0e0e0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin: 20px auto;
      }
      
      .section {
        margin-bottom: ${layout.spacing.sectionGap}pt;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .section:last-child {
        margin-bottom: 0;
      }
      
      .experience-item, .education-item, .project-item {
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: ${layout.spacing.itemGap}pt;
      }
      
      .section-header {
        font-size: ${styling.sizes.headerFont}pt;
        font-weight: ${styling.formatting.boldHeaders ? 'bold' : 'normal'};
        text-decoration: ${styling.formatting.underlineHeaders ? 'underline' : 'none'};
        color: ${styling.colors.primary};
        margin-bottom: ${layout.spacing.itemGap}pt;
        text-transform: uppercase;
        letter-spacing: 0.5pt;
      }
      
      .personal-info {
        text-align: center;
        margin-bottom: ${layout.spacing.sectionGap * 1.5}pt;
      }
      
      .name {
        font-size: ${styling.sizes.headerFont + 4}pt;
        font-weight: bold;
        color: ${styling.colors.primary};
        margin-bottom: 4pt;
      }
      
      .contact-info {
        font-size: ${styling.sizes.bodyFont}pt;
        color: ${styling.colors.secondary};
        line-height: 1.3;
      }
      
      .contact-info a {
        color: ${styling.colors.accent || styling.colors.primary};
        text-decoration: none;
      }
      
      .summary {
        font-size: ${styling.sizes.bodyFont}pt;
        line-height: ${layout.spacing.lineHeight};
        text-align: justify;
      }
      

      
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 2pt;
      }
      
      .job-title, .degree, .project-name {
        font-size: ${styling.sizes.subHeaderFont}pt;
        font-weight: bold;
        color: ${styling.colors.primary};
      }
      
      .company, .institution {
        font-size: ${styling.sizes.bodyFont}pt;
        font-style: ${styling.formatting.italicEmphasis ? 'italic' : 'normal'};
        color: ${styling.colors.secondary};
      }
      
      .duration {
        font-size: ${styling.sizes.smallFont}pt;
        color: ${styling.colors.secondary};
        white-space: nowrap;
      }
      
      .accomplishments {
        margin: 4pt 0 0 0;
        padding-left: 16pt;
      }
      
      .accomplishments li {
        margin-bottom: 2pt;
        font-size: ${styling.sizes.bodyFont}pt;
        line-height: ${layout.spacing.lineHeight};
      }
      
      .skills-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4pt 12pt;
        align-items: start;
      }
      
      .skill-category {
        font-weight: bold;
        color: ${styling.colors.primary};
        font-size: ${styling.sizes.bodyFont}pt;
      }
      
      .skill-list {
        font-size: ${styling.sizes.bodyFont}pt;
        line-height: 1.3;
      }
      
      .certifications-list, .projects-list {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      
      .certification-item {
        margin-bottom: ${layout.spacing.itemGap}pt;
      }
      
      .cert-name {
        font-weight: bold;
        color: ${styling.colors.primary};
      }
      
      .cert-details {
        font-size: ${styling.sizes.smallFont}pt;
        color: ${styling.colors.secondary};
      }
      
      @media print {
        .resume-container {
          margin: 0;
          padding: ${layout.margins.top}in ${layout.margins.right}in ${layout.margins.bottom}in ${layout.margins.left}in;
          box-shadow: none;
          border: none;
        }
        
        .resume-container.preview {
          transform: none;
          width: auto;
          height: auto;
        }
      }
    `;
  }

  private generateContent(resumeData: ResumeData, _template: Template): string {
    const sections = [];

    // Personal Information
    sections.push(this.renderPersonalInfo(resumeData.personalInfo));

    // Professional Summary
    if (resumeData.summary) {
      sections.push(this.renderSummary(resumeData.summary));
    }

    // Work Experience
    if (resumeData.experience.length > 0) {
      sections.push(this.renderExperience(resumeData.experience));
    }

    // Education
    if (resumeData.education.length > 0) {
      sections.push(this.renderEducation(resumeData.education));
    }

    // Skills
    if (resumeData.skills) {
      sections.push(this.renderSkills(resumeData.skills));
    }

    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      sections.push(this.renderCertifications(resumeData.certifications));
    }

    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      sections.push(this.renderProjects(resumeData.projects));
    }

    return sections.join('\n');
  }

  private renderPersonalInfo(personalInfo: any): string {
    const contactItems = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location,
    ];

    if (personalInfo.linkedin) {
      contactItems.push(`<a href="${personalInfo.linkedin}">LinkedIn</a>`);
    }

    if (personalInfo.website) {
      contactItems.push(`<a href="${personalInfo.website}">Portfolio</a>`);
    }

    return `
      <div class="personal-info">
        <div class="name">${personalInfo.fullName}</div>
        <div class="contact-info">${contactItems.join(' • ')}</div>
      </div>
    `;
  }

  private renderSummary(summary: string): string {
    return `
      <div class="section">
        <div class="section-header">Professional Summary</div>
        <div class="summary">${summary}</div>
      </div>
    `;
  }

  private renderExperience(experience: any[]): string {
    const experienceItems = experience.map(exp => `
      <div class="experience-item">
        <div class="item-header">
          <div>
            <div class="job-title">${exp.jobTitle}</div>
            <div class="company">${exp.company}</div>
          </div>
          <div class="duration">${exp.duration}</div>
        </div>
        <ul class="accomplishments">
          ${exp.accomplishments.map((acc: string) => `<li>${acc}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    return `
      <div class="section">
        <div class="section-header">Professional Experience</div>
        ${experienceItems}
      </div>
    `;
  }

  private renderEducation(education: any[]): string {
    const educationItems = education.map(edu => `
      <div class="education-item">
        <div class="item-header">
          <div>
            <div class="degree">${edu.degree}</div>
            <div class="institution">${edu.institution}</div>
          </div>
          <div class="duration">${edu.graduationDate}</div>
        </div>
        ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ''}
        ${edu.relevantCoursework && edu.relevantCoursework.length > 0 ?
        `<div class="coursework">Relevant Coursework: ${edu.relevantCoursework.join(', ')}</div>` : ''}
      </div>
    `).join('');

    return `
      <div class="section">
        <div class="section-header">Education</div>
        ${educationItems}
      </div>
    `;
  }

  private renderSkills(skills: any): string {
    const skillRows = [];

    if (skills.technical && skills.technical.length > 0) {
      skillRows.push(`
        <div class="skill-category">Technical:</div>
        <div class="skill-list">${skills.technical.join(', ')}</div>
      `);
    }

    if (skills.languages && skills.languages.length > 0) {
      skillRows.push(`
        <div class="skill-category">Languages:</div>
        <div class="skill-list">${skills.languages.join(', ')}</div>
      `);
    }

    if (skills.soft && skills.soft.length > 0) {
      skillRows.push(`
        <div class="skill-category">Soft Skills:</div>
        <div class="skill-list">${skills.soft.join(', ')}</div>
      `);
    }

    return `
      <div class="section">
        <div class="section-header">Skills</div>
        <div class="skills-grid">
          ${skillRows.join('')}
        </div>
      </div>
    `;
  }

  private renderCertifications(certifications: any[]): string {
    const certItems = certifications.map(cert => `
      <div class="certification-item">
        <div class="cert-name">${cert.name}</div>
        <div class="cert-details">${cert.issuer} • ${cert.dateObtained}</div>
      </div>
    `).join('');

    return `
      <div class="section">
        <div class="section-header">Certifications</div>
        ${certItems}
      </div>
    `;
  }

  private renderProjects(projects: any[]): string {
    const projectItems = projects.map(project => `
      <div class="project-item">
        <div class="item-header">
          <div>
            <div class="project-name">${project.name}</div>
            <div class="company">${project.technologies.join(', ')}</div>
          </div>
          ${project.duration ? `<div class="duration">${project.duration}</div>` : ''}
        </div>
        <div class="summary">${project.description}</div>
        ${project.accomplishments && project.accomplishments.length > 0 ? `
          <ul class="accomplishments">
            ${project.accomplishments.map((acc: string) => `<li>${acc}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('');

    return `
      <div class="section">
        <div class="section-header">Projects</div>
        ${projectItems}
      </div>
    `;
  }
}

export const templateRenderer = new DefaultTemplateRenderer();