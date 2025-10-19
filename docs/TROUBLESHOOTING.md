# Troubleshooting Guide

## Common Issues and Solutions

This guide helps you resolve common problems when using the MD Resume Converter.

## File Upload Issues

### "File format not supported"

**Problem:** The application doesn't accept your file.

**Solutions:**

1. **Check file extension**: Ensure your file ends with `.md`
2. **Verify file type**: The file must be a plain text Markdown file
3. **Avoid rich text**: Don't save from Word or rich text editors
4. **Use plain text editor**: Save from VS Code, Notepad++, or similar

**How to fix:**

```bash
# Rename your file to have .md extension
resume.txt → resume.md

# Or save as plain text from your editor
File → Save As → Choose "Plain Text" or "Markdown"
```

### "File size too large"

**Problem:** Your file exceeds the 5MB limit.

**Solutions:**

1. **Remove unnecessary content**: Delete extra spaces, comments, or unused sections
2. **Check for hidden characters**: Some editors add invisible formatting
3. **Use plain text**: Avoid rich text formatting that increases file size

**Typical file sizes:**

- Normal resume: 5-50 KB
- Detailed resume: 50-200 KB
- If over 1MB: Likely contains hidden formatting

### "Cannot read file"

**Problem:** The application can't process your file.

**Solutions:**

1. **Check file encoding**: Ensure UTF-8 encoding
2. **Try different browser**: Some browsers handle files differently
3. **Clear browser cache**: Old cached data might interfere
4. **Disable browser extensions**: Ad blockers might interfere

## Parsing Errors

### "Missing required sections"

**Problem:** The parser can't find essential resume sections.

**Required sections:**

- Name (H1 header: `# Your Name`)
- Contact information (Email, Phone, Location)
- Work Experience (At least one entry)
- Education (At least one entry)

**Solutions:**

1. **Check header levels**: Use `#` for name, `##` for sections, `###` for subsections
2. **Verify section names**: Use standard names like "Work Experience", "Education"
3. **Follow format exactly**: Compare with sample template

**Example fix:**

```markdown
❌ Wrong:
Work History
John Smith - Software Engineer

✅ Correct:

# John Smith

## Work Experience

### Software Engineer
```

### "Invalid contact information"

**Problem:** Contact details aren't formatted correctly.

**Solutions:**

1. **Use proper format**: `**Email:** name@domain.com`
2. **Check email format**: Must be valid email address
3. **Phone number format**: Use standard formats like `(555) 123-4567`

**Correct formats:**

```markdown
**Email:** john.doe@email.com
**Phone:** (555) 123-4567
**Location:** San Francisco, CA
**LinkedIn:** linkedin.com/in/johndoe
```

### "Malformed section headers"

**Problem:** Section headers don't follow Markdown syntax.

**Solutions:**

1. **Use proper Markdown**: Headers need `#` symbols
2. **Check spacing**: Space required after `#`
3. **Consistent hierarchy**: H1 for name, H2 for sections, H3 for subsections

**Header hierarchy:**

```markdown
# Your Name (H1 - only for name)

## Work Experience (H2 - main sections)

### Job Title (H3 - subsections)
```

## Preview Issues

### "Content not displaying correctly"

**Problem:** Preview doesn't match your Markdown.

**Solutions:**

1. **Check Markdown syntax**: Ensure proper formatting
2. **Verify header levels**: Wrong levels cause display issues
3. **Review bullet points**: Use `-` or `*` for lists
4. **Check bold/italic**: Use `**bold**` and `_italic_`

### "Missing information in preview"

**Problem:** Some content doesn't appear in preview.

**Common causes:**

1. **Wrong header levels**: Content under wrong headers gets ignored
2. **Invalid formatting**: Malformed Markdown gets skipped
3. **Empty sections**: Sections without content might not display

**Debug steps:**

1. Compare with sample template
2. Check each section individually
3. Verify Markdown syntax
4. Ensure proper nesting

### "Formatting looks wrong"

**Problem:** Text formatting doesn't appear as expected.

**Solutions:**

1. **Check Markdown syntax**:
   - Bold: `**text**` not `*text*`
   - Italic: `_text_` not `/text/`
   - Lists: `-` or `*` at line start
2. **Verify spacing**: Proper spacing around formatting
3. **Review template**: Compare with working examples

## PDF Generation Issues

### "PDF download not working"

**Problem:** Can't download the generated PDF.

**Solutions:**

1. **Try different browser**: Chrome, Firefox, Safari, or Edge
2. **Disable ad blockers**: They might block downloads
3. **Check JavaScript**: Must be enabled
4. **Clear browser cache**: Remove old cached data
5. **Try incognito mode**: Eliminates extension interference

**Browser-specific fixes:**

- **Chrome**: Check download settings, allow pop-ups
- **Firefox**: Ensure PDF downloads are allowed
- **Safari**: Check security settings
- **Edge**: Verify download permissions

### "PDF formatting looks wrong"

**Problem:** Generated PDF doesn't match preview.

**Solutions:**

1. **Review preview first**: Ensure preview looks correct
2. **Try different template**: Some templates handle content differently
3. **Check content length**: Very long content might overflow
4. **Verify browser compatibility**: Use supported browser versions

### "PDF generation is slow"

**Problem:** Takes longer than 3 seconds to generate.

**Possible causes:**

1. **Large resume**: Very detailed resumes take longer
2. **Browser performance**: Older browsers or devices
3. **Memory issues**: Close other tabs/applications
4. **Complex content**: Lots of formatting or sections

**Solutions:**

1. **Simplify content**: Remove unnecessary details
2. **Use modern browser**: Update to latest version
3. **Close other tabs**: Free up browser memory
4. **Try different device**: Use more powerful computer

## Browser Compatibility Issues

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### "Application not loading"

**Problem:** Page doesn't load or shows errors.

**Solutions:**

1. **Update browser**: Use latest version
2. **Enable JavaScript**: Required for application
3. **Clear cache and cookies**: Remove old data
4. **Disable extensions**: Temporarily disable all extensions
5. **Try incognito mode**: Eliminates extension/cache issues

### "Features not working"

**Problem:** Some functionality doesn't work.

**Browser-specific issues:**

- **Older browsers**: May not support modern features
- **Mobile browsers**: Not officially supported
- **Internet Explorer**: Not supported at all

**Solutions:**

1. **Use supported browser**: Switch to Chrome, Firefox, Safari, or Edge
2. **Update browser**: Ensure latest version
3. **Desktop only**: Use desktop/laptop, not mobile

## Performance Issues

### "Application is slow"

**Problem:** Interface is sluggish or unresponsive.

**Solutions:**

1. **Close other tabs**: Free up browser memory
2. **Restart browser**: Clear temporary data
3. **Check system resources**: Ensure adequate RAM/CPU
4. **Try different browser**: Some perform better than others

### "Large file processing"

**Problem:** Large resumes process slowly.

**Solutions:**

1. **Reduce content**: Remove unnecessary sections
2. **Simplify formatting**: Use basic Markdown only
3. **Break into sections**: Process in smaller chunks
4. **Be patient**: Large files naturally take longer

## Data and Privacy Issues

### "Is my data safe?"

**Answer:** Yes, all processing happens in your browser. No data is sent to servers.

**Privacy features:**

- Client-side processing only
- No data storage or transmission
- No tracking or analytics
- No account required

### "Data not persisting"

**Problem:** Information disappears when refreshing page.

**Expected behavior:** This is intentional for privacy. Data is not stored.

**Solutions:**

1. **Complete in one session**: Don't refresh during process
2. **Save Markdown file**: Keep your source file safe
3. **Use browser back/forward**: Navigate within application only

## Error Messages

### "Validation failed"

**Problem:** Resume doesn't pass validation checks.

**Common validation errors:**

1. **Missing required sections**: Add Name, Contact, Experience, Education
2. **Invalid email format**: Use proper email format
3. **Empty sections**: Ensure sections have content
4. **Wrong date format**: Use consistent date formatting

### "Parsing error"

**Problem:** Markdown parser encounters issues.

**Solutions:**

1. **Check Markdown syntax**: Ensure proper formatting
2. **Remove special characters**: Use only standard punctuation
3. **Verify encoding**: Ensure UTF-8 encoding
4. **Compare with sample**: Use sample template as reference

### "Template error"

**Problem:** Template application fails.

**Solutions:**

1. **Try different template**: Switch to another option
2. **Check content compatibility**: Some content might not fit template
3. **Simplify formatting**: Use basic Markdown only
4. **Refresh and retry**: Clear any cached errors

## Getting Additional Help

### Self-Help Resources

1. **User Guide**: Comprehensive documentation
2. **Sample Template**: Working example to follow
3. **Markdown Reference**: Quick syntax guide
4. **FAQ Section**: Common questions answered

### Debugging Steps

1. **Try sample template**: Verify application works
2. **Compare formatting**: Check against working examples
3. **Test in different browser**: Isolate browser issues
4. **Simplify content**: Remove complex formatting
5. **Check browser console**: Look for JavaScript errors

### Browser Developer Tools

1. **Open developer tools**: F12 or right-click → Inspect
2. **Check console**: Look for error messages
3. **Network tab**: Check for failed requests
4. **Application tab**: Check local storage/cache

### When to Try Different Approach

- Multiple browsers fail: Try different device
- Consistent parsing errors: Rewrite Markdown from scratch
- Performance issues persist: Use simpler content
- PDF generation fails: Try different template

---

_If you continue to experience issues after trying these solutions, ensure you're using a supported browser with JavaScript enabled, and consider trying the sample template to verify the application works correctly._
