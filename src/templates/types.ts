/**
 * Template system types
 */

import type { ResumeData, Template } from '../types';

export interface TemplateRenderer {
    renderHTML(resumeData: ResumeData, template: Template): string;
    renderPreview(resumeData: ResumeData, template: Template): string;
}

export interface TemplatePreviewProps {
    template: Template;
    resumeData?: ResumeData;
    isSelected?: boolean;
    onClick?: () => void;
}