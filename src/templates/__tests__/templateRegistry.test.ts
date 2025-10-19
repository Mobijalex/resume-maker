/**
 * Tests for template registry functionality
 */

import { describe, it, expect } from 'vitest';
import {
    templates,
    getTemplateById,
    getDefaultTemplate,
    getATSOptimizedTemplates
} from '../templateRegistry';
import { professionalTemplate } from '../professionalTemplate';


describe('Template Registry', () => {
    describe('templates array', () => {
        it('should contain exactly 2 templates', () => {
            expect(templates).toHaveLength(2);
        });

        it('should include professional and modern templates', () => {
            const templateIds = templates.map(t => t.id);
            expect(templateIds).toContain('professional');
            expect(templateIds).toContain('modern');
        });

        it('should have all templates ATS optimized', () => {
            templates.forEach(template => {
                expect(template.atsOptimized).toBe(true);
            });
        });
    });

    describe('getTemplateById', () => {
        it('should return professional template by id', () => {
            const template = getTemplateById('professional');
            expect(template).toBeDefined();
            expect(template?.id).toBe('professional');
            expect(template?.name).toBe('Professional');
        });

        it('should return modern template by id', () => {
            const template = getTemplateById('modern');
            expect(template).toBeDefined();
            expect(template?.id).toBe('modern');
            expect(template?.name).toBe('Modern');
        });

        it('should return undefined for non-existent template', () => {
            const template = getTemplateById('non-existent');
            expect(template).toBeUndefined();
        });
    });

    describe('getDefaultTemplate', () => {
        it('should return professional template as default', () => {
            const defaultTemplate = getDefaultTemplate();
            expect(defaultTemplate.id).toBe('professional');
            expect(defaultTemplate).toEqual(professionalTemplate);
        });
    });

    describe('getATSOptimizedTemplates', () => {
        it('should return all templates since all are ATS optimized', () => {
            const atsTemplates = getATSOptimizedTemplates();
            expect(atsTemplates).toHaveLength(2);
            expect(atsTemplates.every(t => t.atsOptimized)).toBe(true);
        });
    });
});