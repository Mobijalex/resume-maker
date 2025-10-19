/**
 * Template registry for managing available resume templates
 */

import type { Template } from '../types';
import { professionalTemplate } from './professionalTemplate';
import { modernTemplate } from './modernTemplate';

export const templates: Template[] = [
    professionalTemplate,
    modernTemplate,
];

export const getTemplateById = (id: string): Template | undefined => {
    return templates.find(template => template.id === id);
};

export const getDefaultTemplate = (): Template => {
    return professionalTemplate;
};

export const getATSOptimizedTemplates = (): Template[] => {
    return templates.filter(template => template.atsOptimized);
};

// Template registry object for consistent interface
export const templateRegistry = {
    getTemplate: getTemplateById,
    getDefaultTemplate,
    getATSOptimizedTemplates,
    getAllTemplates: () => templates,
};