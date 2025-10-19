# PDFGenerator

The PDFGenerator is a comprehensive PDF generation engine designed specifically for creating ATS-friendly resume documents from structured resume data.

## Features

- **ATS-Optimized**: Generates PDFs that are compatible with Applicant Tracking Systems
- **Standard Fonts**: Uses ATS-friendly fonts (Arial, Calibri, Times New Roman)
- **Clean Layout**: Avoids tables, text boxes, headers/footers, and images
- **Template Support**: Works with any template that follows the Template interface
- **Performance**: Generates PDFs within 3 seconds for typical resumes
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Warnings**: Provides warnings for non-optimal configurations

## Usage

### Basic Usage

```typescript
import { PDFGenerator } from "./utils/PDFGenerator";
import { professionalTemplate } from "./templates/professionalTemplate";

const options = {
  template: professionalTemplate,
  resumeData: myResumeData,
  atsOptimized: true,
};

const generator = new PDFGenerator(options);
const result = await generator.generatePDF();

if (result.success) {
  generator.downloadPDF();
} else {
  console.error("PDF generation failed:", result.error);
}
```

### With Custom Filename

```typescript
const generator = new PDFGenerator(options);
const result = await generator.generatePDF();

if (result.success) {
  generator.downloadPDF("My_Custom_Resume.pdf");
}
```

### With Error Handling

```typescript
const generator = new PDFGenerator(options);
const result = await generator.generatePDF();

if (result.success) {
  generator.downloadPDF();

  // Check for warnings
  if (result.warnings) {
    result.warnings.forEach((warning) => console.warn(warning));
  }
} else {
  console.error("Error:", result.error);
}
```

## API Reference

### Constructor

```typescript
new PDFGenerator(options: PDFGeneratorOptions)
```

#### PDFGeneratorOptions

- `template: Template` - The template configuration to use
- `resumeData: ResumeData` - The structured resume data
- `atsOptimized: boolean` - Whether to apply ATS optimizations

### Methods

#### generatePDF()

```typescript
async generatePDF(): Promise<PDFGenerationResult>
```

Generates the PDF document from the resume data.

**Returns:** `PDFGenerationResult`

- `success: boolean` - Whether generation was successful
- `pdf?: jsPDF` - The generated PDF object (if successful)
- `error?: string` - Error message (if failed)
- `warnings?: string[]` - Any warnings about the generation

#### downloadPDF()

```typescript
downloadPDF(filename?: string): void
```

Downloads the generated PDF to the user's device.

**Parameters:**

- `filename?: string` - Custom filename (optional)

If no filename is provided, uses format: `Resume_[Name]_[Date].pdf`

## ATS Optimization

The PDFGenerator automatically applies ATS-friendly formatting:

### Font Mapping

- **Arial** → `helvetica` (jsPDF)
- **Calibri** → `helvetica` (fallback for ATS compatibility)
- **Times New Roman** → `times` (jsPDF)
- **Other fonts** → `helvetica` (with warning)

### Layout Rules

- No tables or complex layouts
- No text boxes or form fields
- No headers or footers
- No images or graphics
- Clean, linear text flow
- Consistent spacing and alignment
- Searchable text content

## Performance

- **Target**: Generate PDFs within 3 seconds
- **Optimization**: Efficient text processing and layout
- **Memory**: Proper cleanup of resources
- **Scalability**: Handles large resumes with multiple sections

## Error Handling

The PDFGenerator provides comprehensive error handling:

### Error Types

- **Template errors**: Invalid template configuration
- **Data errors**: Missing or invalid resume data
- **Font errors**: Font loading or mapping issues
- **Layout errors**: Content overflow or formatting problems
- **Generation errors**: PDF creation failures

### Warnings

- Non-ATS optimized fonts
- Large content that may cause layout issues
- Missing optional data sections

## Template Compatibility

The PDFGenerator works with any template that implements the `Template` interface:

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  layout: LayoutConfig;
  styling: StyleConfig;
  atsOptimized: boolean;
}
```

### Required Template Properties

- `layout.margins`: Page margins
- `layout.spacing`: Section and item spacing, line height
- `styling.fonts`: Font configuration
- `styling.sizes`: Font sizes for different elements
- `styling.colors`: Color scheme (for future use)

## Testing

The PDFGenerator includes comprehensive tests:

- **Unit tests**: Core functionality and edge cases
- **Integration tests**: Template system integration
- **Performance tests**: Generation speed verification
- **ATS compliance tests**: Format validation

Run tests:

```bash
npm run test:run -- src/utils/__tests__/PDFGenerator
```

## Examples

See `PDFGenerator.usage.example.ts` for detailed usage examples including:

- Basic PDF generation
- Custom filenames
- Error handling
- Minimal data handling
- Complete resume with all sections
- Performance monitoring

## Requirements Satisfied

This implementation satisfies the following requirements:

- **4.1**: ATS-friendly formatting with standard fonts
- **4.2**: Avoids tables, text boxes, headers/footers, and images
- **4.3**: Clear section headings with consistent spacing
- **4.4**: Searchable and text-selectable PDFs
- **4.5**: Generation within 3 seconds for typical resumes

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- `jspdf`: PDF generation library
- `@types/jspdf`: TypeScript definitions

## Future Enhancements

- Multi-page layout optimization
- Advanced text formatting options
- Custom font loading
- PDF/A compliance for archival
- Accessibility improvements
