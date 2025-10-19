import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFGenerator } from '../../utils/PDFGenerator';
import { MarkdownParser } from '../../utils/MarkdownParser';
import type { ResumeData } from '../../types/resume';

// Mock PDF text extraction (simulating ATS parsing)
class MockATSParser {
  private pdfContent: string;

  constructor(pdfContent: string) {
    this.pdfContent = pdfContent;
  }

  extractText(): string {
    // Simulate ATS text extraction with some limitations
    return this.pdfContent
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  extractSections(): Record<string, string> {
    const text = this.extractText();
    const sections: Record<string, string> = {};

    // Simulate section extraction based on common ATS patterns
    const sectionPatterns = {
      contact: /^(.*?)(?:PROFESSIONAL SUMMARY|SUMMARY|EXPERIENCE)/i,
      summary: /(?:PROFESSIONAL SUMMARY|SUMMARY)[:\s]*(.*?)(?:EXPERIENCE|EDUCATION|SKILLS)/i,
      experience: /EXPERIENCE[:\s]*(.*?)(?:EDUCATION|SKILLS|CERTIFICATIONS)/i,
      education: /EDUCATION[:\s]*(.*?)(?:SKILLS|CERTIFICATIONS|PROJECTS)/i,
      skills: /SKILLS[:\s]*(.*?)(?:CERTIFICATIONS|PROJECTS|$)/i,
      certifications: /CERTIFICATIONS[:\s]*(.*?)(?:PROJECTS|$)/i,
      projects: /PROJECTS[:\s]*(.*?)$/i,
    };

    Object.entries(sectionPatterns).forEach(([section, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        sections[section] = match[1].trim();
      }
    }