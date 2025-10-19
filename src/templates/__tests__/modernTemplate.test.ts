/**
 * Tests for modern template configuration
 */

import { describe, it, expect } from 'vitest';
import { modernTemplate } from '../modernTemplate';

describe('Modern Template', () => {
    it('should have correct basic properties', () => {
        expect(modernTemplate.id).toBe('modern');
        expect(modernTemplate.name).toBe('Modern');
        expect(modernTemplate.atsOptimized).toBe(true);
        expect(modernTemplate.description).toContain('Contemporary');
    });

    it('should have ATS-friendly layout configuration', () => {
        const { layout } = modernTemplate;

        // Standard margins for ATS compatibility
        expect(layout.margins.top).toBe(0.8);
        expect(layout.margins.bottom).toBe(0.8);
        expect(layout.margins.left).toBe(0.8);
        expect(layout.margins.right).toBe(0.8);

        // Single column layout for ATS
        expect(layout.columns.enabled).toBe(false);

        // Reasonable spacing
        expect(layout.spacing.sectionGap).toBeGreaterThan(0);
        expect(layout.spacing.itemGap).toBeGreaterThan(0);
        expect(layout.spacing.lineHeight).toBeGreaterThanOrEqual(1.2);
    });

    it('should use ATS-friendly fonts', () => {
        const { styling } = modernTemplate;

        // Calibri is ATS-compatible
        expect(styling.fonts.primary).toBe('Calibri');
        expect(styling.fonts.secondary).toBe('Arial');
        expect(styling.fonts.fallback).toContain('Helvetica');
        expect(styling.fonts.fallback).toContain('sans-serif');
    });

    it('should have appropriate font sizes', () => {
        const { styling } = modernTemplate;

        // Font sizes should be readable but not too large
        expect(styling.sizes.headerFont).toBeGreaterThanOrEqual(14);
        expect(styling.sizes.headerFont).toBeLessThanOrEqual(20);
        expect(styling.sizes.bodyFont).toBeGreaterThanOrEqual(10);
        expect(styling.sizes.bodyFont).toBeLessThanOrEqual(12);
    });

    it('should use professional colors', () => {
        const { styling } = modernTemplate;

        // Should use professional, dark colors
        expect(styling.colors.primary).toBe('#2c3e50');
        expect(styling.colors.secondary).toBe('#34495e');
        expect(styling.colors.text).toBe('#2c3e50');
        expect(styling.colors.accent).toBe('#3498db');
    });

    it('should have modern but ATS-safe formatting options', () => {
        const { styling } = modernTemplate;

        // Bold headers are acceptable for ATS
        expect(styling.formatting.boldHeaders).toBe(true);
        // Avoid underlines for ATS
        expect(styling.formatting.underlineHeaders).toBe(false);
        // Subtle italic emphasis is acceptable
        expect(styling.formatting.italicEmphasis).toBe(true);
    });
});