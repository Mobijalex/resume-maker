/**
 * Professional Template - Clean, traditional layout optimized for ATS
 */

import type { Template } from '../types';

export const professionalTemplate: Template = {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, traditional layout with clear sections and ATS-friendly formatting',
    atsOptimized: true,
    layout: {
        margins: {
            top: 0.75,
            bottom: 0.75,
            left: 0.75,
            right: 0.75,
        },
        spacing: {
            sectionGap: 16,
            itemGap: 8,
            lineHeight: 1.4,
        },
        columns: {
            enabled: false,
        },
    },
    styling: {
        fonts: {
            primary: 'Arial',
            fallback: ['Helvetica', 'sans-serif'],
        },
        colors: {
            primary: '#000000',
            secondary: '#333333',
            text: '#000000',
        },
        sizes: {
            headerFont: 16,
            subHeaderFont: 14,
            bodyFont: 11,
            smallFont: 10,
        },
        formatting: {
            boldHeaders: true,
            underlineHeaders: false,
            italicEmphasis: false,
        },
    },
};