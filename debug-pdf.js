// Debug script to test PDFGenerator
import { jsPDF } from "jspdf";

console.log("Testing jsPDF...");

try {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  console.log("PDF created successfully");
  console.log("Page dimensions:", pdf.internal.pageSize);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text("Test text", 50, 50);

  console.log("Text added successfully");
  console.log("PDF generation test passed");
} catch (error) {
  console.error("PDF generation failed:", error);
}
