/**
 * Tests for professional template configuration
 */

import { describe, it, expect } from 'vitest';
import { professionalTemplate } from '../professionalTemplate';

describe('Professional Template', () => {
    it('should have correct basic properties', () => {
        expect(professionalTemplate.id).toBe('professional');
        expect(professionalTemplate.name).toBe('Professional');
        expect(professionalTemplate.atsOptimized).toBe(true);
        expect(professionalTemplate.description).toContain('ATS-friendly');
    });

    it('should have ATS-friendly layout configuration', () => {
        const { layout } = professionalTemplate;

        // Standard margins for ATS compatibility
        expect(layout.margins.top).toBe(0.75);
        expect(layout.margins.bottom).toBe(0.75);
        expect(layout.margins.left).toBe(0.75);
        expect(layout.margins.right).toBe(0.75);

        // Single column layout for ATS
        expect(layout.columns.enabled).toBe(false);

        // Reasonable spacing
        expect(layout.spacing.sectionGap).toBeGreaterThan(0);
        expect(layout.spacing.itemGap).toBeGreaterThan(0);
        expect(layout.spacing.lineHeight).toBeGreaterThanOrEqual(1.2);
    });

    it('should use ATS-friendly fonts', () => {
        const { styling } = professionalTemplate;

        // Arial is highly ATS-compatible
        expect(styling.fonts.primary).toBe('Arial');
        expect(styling.fonts.fallback).toContain('Helvetica');
        expect(styling.fonts.fallback).toContain('sans-serif');
    });

    it('should have appropriate font sizes', () => {
        const { styling } = professionalTemplate;

        // Font sizes should be readable but not too large
        expect(styling.sizes.headerFont).toBeGreaterThanOrEqual(14);
        expect(styling.sizes.headerFont).toBeLessThanOrEqual(18);
        expect(styling.sizes.bodyFont).toBeGreaterThanOrEqual(10);
        expect(styling.sizes.bodyFont).toBeLessThanOrEqual(12);
    });

    it('should use conservative colors for ATS compatibility', () => {
        const { styling } = professionalTemplate;

        // Should use black or very dark colors for text
        expect(styling.colors.primary).toBe('#000000');
        expect(styling.colors.text).toBe('#000000');
    });

    it('should have conservative formatting options', () => {
        const { styling } = professionalTemplate;

        // Bold headers are acceptable for ATS
        expect(styling.formatting.boldHeaders).toBe(true);
        // Avoid underlines and excessive italics for ATS
        expect(styling.formatting.underlineHeaders).toBe(false);
    });
});