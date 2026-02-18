import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export async function generatePdf(
  container: HTMLElement,
  filename: string = "시험지.pdf"
): Promise<void> {
  const pageEls = container.querySelectorAll<HTMLElement>("[data-page]");

  if (pageEls.length === 0) return;

  const pdf = new jsPDF("p", "mm", "a4");

  for (let i = 0; i < pageEls.length; i++) {
    if (i > 0) pdf.addPage();

    const canvas = await html2canvas(pageEls[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      removeContainer: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
  }

  pdf.save(filename);
}
