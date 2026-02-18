import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export async function generatePdf(
  element: HTMLElement,
  filename: string = "시험지.pdf"
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const pdf = new jsPDF("p", "mm", "a4");

  // Calculate the image dimensions to fit A4 width
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Additional pages if content overflows
  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}
