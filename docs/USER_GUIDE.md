# MD Resume Converter - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Markdown Format Requirements](#markdown-format-requirements)
3. [Step-by-Step Usage Guide](#step-by-step-usage-guide)
4. [Supported Resume Sections](#supported-resume-sections)
5. [Formatting Guidelines](#formatting-guidelines)
6. [Template Options](#template-options)
7. [ATS Optimization Tips](#ats-optimization-tips)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

## Getting Started

The MD Resume Converter is a web-based tool that transforms your Markdown-formatted resume into a professional, ATS-friendly PDF. This tool is designed for developers and tech professionals who prefer writing in Markdown format while ensuring their resumes pass through Applicant Tracking Systems (ATS) successfully.

### Key Benefits

- **ATS-Friendly**: Generated PDFs are optimized for ATS parsing with clean formatting
- **Privacy-First**: All processing happens in your browser - no data is sent to servers
- **Developer-Friendly**: Write your resume in familiar Markdown syntax
- **Professional Output**: Choose from multiple professional templates
- **Fast Processing**: Generate PDFs in under 3 seconds

### System Requirements

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Minimum screen resolution: 1024x768
- No registration or account required

## Markdown Format Requirements

### File Format

- **File Extension**: `.md` (Markdown)
- **Maximum File Size**: 5MB
- **Encoding**: UTF-8
- **Line Endings**: Any (LF, CRLF, or CR)

### Basic Structure

Your resume must follow this basic structure:

```markdown
# Your Full Name

**Email:** your.email@example.com
**Phone:** (555) 123-4567
**Location:** City, State
**LinkedIn:** linkedin.com/in/yourprofile
**Website:** yourwebsite.com

## Professional Summary

Your professional summary here...

## Work Experience

### Job Title

**Company Name** | _Duration_

- Accomplishment or responsibility
- Another accomplishment with metrics

## Education

### Degree Name

**Institution Name** | _Graduation Date_

## Skills

### Technical Skills

- Skill category: List of skills

## [Optional Sections]
```

### Required Sections

The following sections are **mandatory** and must be present:

1. **Name** (H1 header)
2. **Contact Information** (Email, Phone, Location)
3. **Work Experience** (At least one position)
4. **Education** (At least one entry)

### Optional Sections

These sections can enhance your resume:

- Professional Summary
- Skills
- Certifications
- Projects
- Languages
- Awards
- Volunteer Experience

## Step-by-Step Usage Guide

### Method 1: File Upload

1. **Access the Application**

   - Open the MD Resume Converter in your web browser
   - You'll see the welcome screen with upload options

2. **Upload Your Resume**

   - Click "Choose File" or drag and drop your `.md` file
   - The file will be validated automatically
   - If there are errors, you'll see specific guidance

3. **Review Parsed Data**

   - The system will extract your resume information
   - Review the parsed sections for accuracy
   - Fix any formatting issues if prompted

4. **Select Template**

   - Choose from available professional templates
   - Preview how your resume will look with each template
   - Templates are all ATS-optimized

5. **Preview Your Resume**

   - Review the formatted resume preview
   - Check for any formatting issues
   - Make sure all information is displayed correctly

6. **Download PDF**
   - Click "Download PDF" to generate your resume
   - The file will be named "Resume*[YourName]*[Date].pdf"
   - Save the file to your desired location

### Method 2: Direct Text Input

1. **Choose Text Input**

   - Select "Paste Markdown Text" option
   - A text editor will appear

2. **Enter Your Resume**

   - Paste or type your Markdown resume content
   - Use the sample template as a reference
   - The system provides real-time validation

3. **Download Sample Template** (Optional)

   - Click "Download Sample Template" for reference
   - Use this as a starting point for your resume

4. **Continue with Steps 3-6** from Method 1

### Navigation Tips

- Use the progress indicator to track your current step
- You can go back to previous steps to make changes
- Your data is preserved when navigating between steps
- The application works offline once loaded

## Supported Resume Sections

### 1. Personal Information (Required)

**Format:**

```markdown
# Your Full Name

**Email:** your.email@example.com
**Phone:** (555) 123-4567
**Location:** City, State/Country
**LinkedIn:** linkedin.com/in/yourprofile (optional)
**Website:** yourwebsite.com (optional)
```

**Requirements:**

- Name must be an H1 header (`#`)
- Email must be a valid email format
- Phone can be in various formats: (555) 123-4567, +1-555-123-4567, 555.123.4567
- Location should include city and state/country
- LinkedIn and Website are optional but recommended

### 2. Professional Summary (Optional but Recommended)

**Format:**

```markdown
## Professional Summary

A brief 2-3 sentence summary highlighting your key qualifications,
years of experience, and primary areas of expertise. Focus on
value proposition and career highlights.
```

**Best Practices:**

- Keep it concise (2-4 lines)
- Include years of experience
- Mention key technologies or skills
- Highlight major achievements

### 3. Work Experience (Required)

**Format:**

```markdown
## Work Experience

### Job Title

**Company Name** | _Duration_

- Accomplishment with quantifiable results
- Responsibility that demonstrates skills
- Achievement that shows impact
- Technical implementation or leadership example

### Previous Job Title

**Previous Company** | _Duration_

- Similar format for each position
```

**Requirements:**

- Use H3 headers (`###`) for job titles
- Company name in bold, duration in italics
- Use bullet points for accomplishments
- Include at least one work experience entry

**Best Practices:**

- Start bullet points with action verbs
- Include quantifiable metrics when possible
- Focus on achievements, not just responsibilities
- List experiences in reverse chronological order

### 4. Education (Required)

**Format:**

```markdown
## Education

### Degree Name

**Institution Name** | _Graduation Date_

**GPA:** 3.7/4.0 (optional, include if 3.5+)
**Relevant Coursework:** Course 1, Course 2, Course 3 (optional)
**Honors:** Magna Cum Laude, Dean's List (optional)
```

**Requirements:**

- Use H3 headers for degree names
- Institution in bold, date in italics
- Include at least one education entry

### 5. Skills (Optional but Recommended)

**Format:**

```markdown
## Skills

### Technical Skills

- **Languages:** JavaScript, Python, Java, C++
- **Frontend:** React, Vue.js, HTML5, CSS3, TypeScript
- **Backend:** Node.js, Django, Express.js, REST APIs
- **Databases:** PostgreSQL, MongoDB, MySQL, Redis
- **Tools:** Git, Docker, AWS, Jenkins, Kubernetes

### Soft Skills

- Team Leadership
- Project Management
- Problem Solving
- Communication
```

**Best Practices:**

- Group skills by category
- List most relevant skills first
- Use consistent formatting
- Include both technical and soft skills

### 6. Certifications (Optional)

**Format:**

```markdown
## Certifications

### Certification Name

**Issuing Organization** | _Issue Date_

**Credential ID:** ABC123456 (optional)
**Expiration:** December 2025 (if applicable)
```

### 7. Projects (Optional)

**Format:**

```markdown
## Projects

### Project Name

**Project Type** | _Date_

- Brief description of the project and your role
- Technologies used and technical challenges solved
- Results or impact achieved
- **Technologies:** React, Node.js, PostgreSQL, AWS
```

### 8. Additional Sections

You can include other sections using the same H2 format:

- **Languages**: List languages and proficiency levels
- **Awards**: Professional awards and recognition
- **Publications**: Academic or professional publications
- **Volunteer Experience**: Community involvement
- **Professional Associations**: Memberships and affiliations

## Formatting Guidelines

### Headers

- **H1 (`#`)**: Your name only
- **H2 (`##`)**: Section headers (Experience, Education, etc.)
- **H3 (`###`)**: Subsection headers (Job titles, Degrees, etc.)
- **H4-H6**: Not recommended for resume formatting

### Text Formatting

- **Bold (`**text**`)**: Company names, institutions, important terms
- **Italic (`_text_`)**: Dates, durations, project types
- **Lists**: Use `-` or `*` for bullet points
- **Line breaks**: Use double line breaks between sections

### Dates and Durations

**Recommended formats:**

- `January 2022 - Present`
- `June 2019 - December 2021`
- `2018 - 2022`
- `Graduated May 2018`

### Contact Information

**Email format:**

```markdown
**Email:** your.email@domain.com
```

**Phone format:**

```markdown
**Phone:** (555) 123-4567
```

**Location format:**

```markdown
**Location:** San Francisco, CA
```

### Bullet Points

- Start with action verbs (Led, Developed, Implemented, Managed)
- Include quantifiable metrics when possible
- Keep each point to 1-2 lines
- Use parallel structure

**Good examples:**

- Led development of customer-facing web application serving 100K+ users, resulting in 25% increase in user engagement
- Implemented automated testing strategies that reduced bug reports by 50%

**Avoid:**

- Responsible for managing team
- Worked on various projects
- Helped with development tasks

## Template Options

### Professional Template

- Clean, traditional layout
- Emphasis on readability
- Conservative styling
- Best for: Corporate environments, traditional industries

### Modern Template

- Contemporary design
- Subtle color accents
- Optimized spacing
- Best for: Tech companies, startups, creative roles

### Template Selection Tips

- Consider your industry and target companies
- All templates are ATS-optimized
- Preview your resume with different templates
- Choose based on personal preference and company culture

## ATS Optimization Tips

### What Makes a Resume ATS-Friendly

1. **Clean Structure**: Clear section headers and consistent formatting
2. **Standard Fonts**: Arial, Calibri, Times New Roman
3. **No Complex Elements**: Avoid tables, text boxes, images, headers/footers
4. **Searchable Text**: All text must be selectable and searchable
5. **Logical Flow**: Information presented in expected order

### Keywords and Skills

- Include relevant keywords from job descriptions
- Use industry-standard terminology
- List skills explicitly in the Skills section
- Include both acronyms and full terms (e.g., "AI" and "Artificial Intelligence")

### Common ATS Pitfalls to Avoid

- ❌ Using images or graphics
- ❌ Complex tables or columns
- ❌ Headers and footers
- ❌ Unusual fonts or formatting
- ❌ Text in images
- ❌ Special characters or symbols

### Our ATS Optimization

The MD Resume Converter automatically:

- Uses ATS-friendly fonts
- Avoids problematic formatting elements
- Ensures text is searchable and selectable
- Maintains clean document structure
- Follows ATS best practices

## Troubleshooting

### Common Issues and Solutions

#### File Upload Problems

**Issue**: "File format not supported"

- **Solution**: Ensure your file has a `.md` extension
- **Check**: File is saved as plain text Markdown, not rich text

**Issue**: "File size too large"

- **Solution**: Reduce file size to under 5MB
- **Tip**: Remove any embedded images or unnecessary content

#### Parsing Errors

**Issue**: "Missing required sections"

- **Solution**: Ensure you have Name (H1), Contact Info, Work Experience, and Education sections
- **Check**: Section headers use proper Markdown syntax (`##`)

**Issue**: "Invalid contact information"

- **Solution**: Verify email format and phone number format
- **Example**: Use `**Email:** name@domain.com` format

#### Preview Issues

**Issue**: "Content not displaying correctly"

- **Solution**: Check Markdown syntax for proper formatting
- **Tip**: Use the sample template as a reference

**Issue**: "Missing information in preview"

- **Solution**: Ensure all sections use proper header levels
- **Check**: Job titles use H3 (`###`), sections use H2 (`##`)

#### PDF Generation Problems

**Issue**: "PDF download not working"

- **Solution**: Try a different browser or disable ad blockers
- **Check**: Ensure JavaScript is enabled

**Issue**: "PDF formatting looks wrong"

- **Solution**: Review the preview before downloading
- **Tip**: Try a different template

### Browser Compatibility

**Supported Browsers:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**If you experience issues:**

1. Update your browser to the latest version
2. Clear browser cache and cookies
3. Disable browser extensions temporarily
4. Try an incognito/private browsing window

### Getting Help

If you continue to experience issues:

1. Check that your Markdown follows the format requirements
2. Try the sample template to verify the application works
3. Use browser developer tools to check for JavaScript errors
4. Try a different browser or device

## FAQ

### General Questions

**Q: Is my resume data stored anywhere?**
A: No, all processing happens in your browser. No data is sent to servers or stored anywhere. Your privacy is completely protected.

**Q: Do I need to create an account?**
A: No account or registration is required. Simply access the application and start using it immediately.

**Q: Can I use this tool offline?**
A: Once the application loads, it works offline. However, you need an internet connection for the initial load.

**Q: Is there a cost to use this tool?**
A: The tool is completely free to use with no limitations or hidden costs.

### File Format Questions

**Q: Can I upload Word documents or PDFs?**
A: No, only Markdown (.md) files are supported. You'll need to convert your existing resume to Markdown format first.

**Q: What if I don't know Markdown?**
A: Markdown is simple to learn! Use our sample template as a starting point, and refer to the formatting guidelines in this guide.

**Q: Can I include images in my resume?**
A: No, images are not supported as they interfere with ATS parsing. Focus on text-based content only.

**Q: What's the maximum file size?**
A: Files must be under 5MB. Most text-based resumes are well under this limit.

### Formatting Questions

**Q: How many pages should my resume be?**
A: There's no strict limit, but 1-2 pages is recommended for most professionals. The tool handles multi-page resumes automatically.

**Q: Can I customize the fonts or colors?**
A: Templates use ATS-optimized fonts and colors. Customization is limited to maintain ATS compatibility.

**Q: Why can't I use tables or columns?**
A: Tables and complex layouts can confuse ATS systems. Our templates use ATS-friendly formatting instead.

**Q: Can I include special characters or symbols?**
A: Basic punctuation is fine, but avoid decorative symbols or special characters that might not parse correctly.

### Technical Questions

**Q: Which browsers are supported?**
A: Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Mobile browsers are not officially supported.

**Q: Why is the PDF generation slow?**
A: PDF generation should complete within 3 seconds. Slow performance might indicate browser compatibility issues or very large files.

**Q: Can I edit the PDF after it's generated?**
A: No, you'll need to modify your Markdown source and regenerate the PDF. This ensures consistency and ATS compatibility.

**Q: What if JavaScript is disabled?**
A: The application requires JavaScript to function. Please enable JavaScript in your browser settings.

### Content Questions

**Q: What sections are required?**
A: Name, Contact Information, Work Experience, and Education are required. All other sections are optional.

**Q: How should I format dates?**
A: Use formats like "January 2022 - Present" or "2018 - 2022". Be consistent throughout your resume.

**Q: Should I include my GPA?**
A: Include GPA only if it's 3.5 or higher and you're a recent graduate (within 2-3 years).

**Q: How many bullet points per job?**
A: 3-5 bullet points per position is ideal. Focus on achievements and quantifiable results.

### ATS Questions

**Q: Will my resume pass ATS systems?**
A: Our tool generates ATS-optimized PDFs, but success also depends on content relevance and keyword matching.

**Q: How do I know if my resume is ATS-friendly?**
A: The generated PDF uses ATS-friendly formatting. Focus on including relevant keywords and clear section headers.

**Q: Should I include keywords from job descriptions?**
A: Yes, include relevant keywords naturally throughout your resume, especially in the Skills section.

**Q: What about applicant tracking systems I haven't heard of?**
A: Our formatting follows universal ATS best practices and is compatible with major systems like Workday, Greenhouse, Lever, and Taleo.

### Troubleshooting Questions

**Q: My resume isn't parsing correctly. What should I do?**
A: Check that you're using proper Markdown syntax. Compare your format to the sample template and ensure required sections are present.

**Q: The preview looks different from my Markdown. Why?**
A: The preview shows how your resume will appear in the selected template. Some formatting may be adjusted for ATS compatibility.

**Q: I can't download the PDF. What's wrong?**
A: Try a different browser, disable ad blockers, or check that JavaScript is enabled. Clear your browser cache if issues persist.

**Q: Some of my information is missing from the PDF. Why?**
A: Ensure all sections use proper header levels (H2 for sections, H3 for subsections) and follow the required format structure.

---

_Last updated: [Current Date]_
_Version: 1.0_

For additional support or questions not covered in this guide, please refer to the sample template and formatting examples provided with the application.
