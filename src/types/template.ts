/**
 * Template and styling interfaces
 */

export interface LayoutConfig {
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    spacing: {
        sectionGap: number;
        itemGap: number;
        lineHeight: number;
    };
    columns: {
        enabled: boolean;
        count?: number;
        gap?: number;
    };
}

export interface StyleConfig {
    fonts: {
        primary: string;
        secondary?: string;
        fallback: string[];
    };
    colors: {
        primary: string;
        secondary: string;
        text: string;
        accent?: string;
    };
    sizes: {
        headerFont: number;
        subHeaderFont: number;
        bodyFont: number;
        smallFont: number;
    };
    formatting: {
        boldHeaders: boolean;
        underlineHeaders: boolean;
        italicEmphasis: boolean;
    };
}

export interface Template {
    id: string;
    name: string;
    description: string;
    layout: LayoutConfig;
    styling: StyleConfig;
    atsOptimized: boolean;
    previewImage?: string;
}