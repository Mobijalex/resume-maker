export const helpContent = {
    fileUpload: {
        dragDrop: "Drag and drop your .md file here, or click to browse. Files must be under 5MB and in Markdown format.",
        fileFormat: "Only Markdown (.md) files are supported. Ensure your file is saved as plain text, not rich text format.",
        fileSize: "Maximum file size is 5MB. Most resume files are much smaller (5-200KB)."
    },

    textInput: {
        markdownSyntax: "Use standard Markdown syntax. Headers start with #, bold text uses **text**, and bullet points use - or *.",
        sampleTemplate: "Download the sample template to see the proper format and structure for your resume.",
        requiredSections: "Your resume must include: Name (# header), Contact info, Work Experience, and Education sections."
    },

    parsing: {
        requiredSections: "Required sections: Name (H1), Contact Information, Work Experience, and Education. Optional: Summary, Skills, Certifications, Projects.",
        contactFormat: "Format contact info as: **Email:** name@domain.com, **Phone:** (555) 123-4567, **Location:** City, State",
        headerHierarchy: "Use # for your name, ## for main sections (Work Experience), ### for subsections (Job Title)."
    },

    templates: {
        selection: "All templates are ATS-optimized. Choose based on your industry: Professional for corporate, Modern for tech/creative roles.",
        atsOptimized: "Templates use ATS-friendly fonts, avoid tables/images, and maintain clean structure for optimal parsing.",
        preview: "Preview shows exactly how your resume will appear in the final PDF. Try different templates to see variations."
    },

    preview: {
        accuracy: "The preview accurately represents your final PDF. If content is missing, check your Markdown formatting.",
        realTime: "Preview updates automatically as you make changes. Ensure all sections display correctly before downloading.",
        formatting: "Preview shows professional formatting with proper spacing, fonts, and layout optimized for ATS systems."
    },

    download: {
        pdfGeneration: "PDF generation typically takes 1-3 seconds. The file will be named Resume_[YourName]_[Date].pdf",
        atsCompatible: "Generated PDFs use standard fonts, avoid complex formatting, and maintain searchable text for ATS parsing.",
        browserSupport: "Works best in Chrome, Firefox, Safari, and Edge. Disable ad blockers if download fails."
    },

    general: {
        privacy: "All processing happens in your browser. No data is sent to servers or stored anywhere. Your privacy is protected.",
        offline: "Once loaded, the application works offline. You can use it without an internet connection.",
        noAccount: "No registration or account required. Start using immediately without any setup."
    },

    troubleshooting: {
        parsingErrors: "Check that required sections are present and use proper Markdown syntax. Compare with the sample template.",
        pdfIssues: "If PDF download fails, try a different browser, disable ad blockers, or clear browser cache.",
        browserCompatibility: "Use Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+. Enable JavaScript and allow pop-ups."
    },

    atsOptimization: {
        keywords: "Include relevant keywords from job descriptions naturally throughout your resume, especially in the Skills section.",
        formatting: "Use clear section headers, standard job titles, and quantifiable achievements. Avoid special characters or symbols.",
        structure: "Maintain logical flow: Contact → Summary → Experience → Education → Skills. List items in reverse chronological order."
    },

    markdownTips: {
        headers: "# for name only, ## for main sections, ### for job titles/degrees. Maintain consistent hierarchy.",
        formatting: "**Bold** for companies/schools, _Italic_ for dates, - for bullet points. Keep formatting simple and consistent.",
        dates: "Use consistent date formats: 'January 2022 - Present' or '2018 - 2022'. Be consistent throughout your resume.",
        bullets: "Start bullet points with action verbs (Led, Developed, Implemented). Include quantifiable results when possible."
    }
};

export const getHelpContent = (section: string, topic: string): string => {
    const sectionContent = helpContent[section as keyof typeof helpContent];
    if (sectionContent && typeof sectionContent === 'object') {
        return (sectionContent as any)[topic] || "Help information not available.";
    }
    return "Help information not available.";
};

export default helpContent;