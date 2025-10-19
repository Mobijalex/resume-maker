/**
 * Modern Template - Contemporary design with subtle styling, ATS-optimized
 */

import type { Template } from '../types';

export const modernTemplate: Template = {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with subtle styling and optimized spacing for readability',
    atsOptimized: true,
    layout: {
        margins: {
            top: 0.8,
            bottom: 0.8,
            left: 0.8,
            right: 0.8,
        },
        spacing: {
            sectionGap: 18,
            itemGap: 10,
            lineHeight: 1.5,
        },
        columns: {
            enabled: false,
        },
    },
    styling: {
        fonts: {
            primary: 'Calibri',
            secondary: 'Arial',
            fallback: ['Helvetica', 'sans-serif'],
        },
        colors: {
            primary: '#2c3e50',
            secondary: '#34495e',
            text: '#2c3e50',
            accent: '#3498db',
        },
        sizes: {
            headerFont: 18,
            subHeaderFont: 15,
            bodyFont: 11,
            smallFont: 10,
        },
        formatting: {
            boldHeaders: true,
            underlineHeaders: false,
            italicEmphasis: true,
        },
    },
};