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

  const pdfWidthMm = 210;
  const pdfHeightMm = 297;

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;

  // Ratio: how many px = 1mm
  const pxPerMm = imgWidthPx / pdfWidthMm;
  const pageHeightPx = pdfHeightMm * pxPerMm;

  // Find question item boundaries by looking for data-question attributes
  const questionEls = element.querySelectorAll("[data-question]");
  const headerEl = element.querySelector("[data-header]");

  // If no question markers found, fall back to simple slice
  if (questionEls.length === 0) {
    addFullImagePages(pdf, canvas, pdfWidthMm, pdfHeightMm);
    pdf.save(filename);
    return;
  }

  // Get the scale factor between the actual element and the canvas
  const elementRect = element.getBoundingClientRect();
  const scaleY = imgHeightPx / elementRect.height;

  // Build a list of "blocks" with their pixel positions in the canvas
  const blocks: { topPx: number; bottomPx: number }[] = [];

  // Header block
  if (headerEl) {
    const rect = headerEl.getBoundingClientRect();
    blocks.push({
      topPx: (rect.top - elementRect.top) * scaleY,
      bottomPx: (rect.bottom - elementRect.top) * scaleY,
    });
  }

  // Question blocks
  questionEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    blocks.push({
      topPx: (rect.top - elementRect.top) * scaleY,
      bottomPx: (rect.bottom - elementRect.top) * scaleY,
    });
  });

  // Sort by topPx
  blocks.sort((a, b) => a.topPx - b.topPx);

  // Now decide page breaks: greedily fit blocks into pages
  // without splitting any block across pages
  const pages: { startPx: number; endPx: number }[] = [];
  let pageStartPx = 0;
  let pageEndPx = pageHeightPx;

  let currentPageBlocks: typeof blocks = [];

  for (const block of blocks) {
    const blockHeight = block.bottomPx - block.topPx;

    // If a single block is taller than a page, it must go on its own page (can't avoid splitting)
    if (blockHeight > pageHeightPx) {
      // Flush current page if it has content
      if (currentPageBlocks.length > 0) {
        const lastBottom = currentPageBlocks[currentPageBlocks.length - 1].bottomPx;
        pages.push({ startPx: pageStartPx, endPx: lastBottom });
      }
      // This oversized block gets its own page(s)
      pages.push({ startPx: block.topPx, endPx: block.bottomPx });
      pageStartPx = block.bottomPx;
      pageEndPx = pageStartPx + pageHeightPx;
      currentPageBlocks = [];
      continue;
    }

    // Does this block fit on the current page?
    if (block.bottomPx <= pageEndPx) {
      currentPageBlocks.push(block);
    } else {
      // End current page
      if (currentPageBlocks.length > 0) {
        const lastBottom = currentPageBlocks[currentPageBlocks.length - 1].bottomPx;
        pages.push({ startPx: pageStartPx, endPx: lastBottom });
      }
      // Start new page from this block
      pageStartPx = block.topPx;
      pageEndPx = pageStartPx + pageHeightPx;
      currentPageBlocks = [block];
    }
  }

  // Flush last page
  if (currentPageBlocks.length > 0) {
    const lastBottom = currentPageBlocks[currentPageBlocks.length - 1].bottomPx;
    pages.push({ startPx: pageStartPx, endPx: lastBottom });
  }

  // Render each page
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    const page = pages[i];
    const sliceHeight = page.endPx - page.startPx;
    const sliceHeightMm = sliceHeight / pxPerMm;

    // Create a canvas slice for this page
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = imgWidthPx;
    pageCanvas.height = Math.ceil(sliceHeight);
    const ctx = pageCanvas.getContext("2d")!;

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    // Draw the slice
    ctx.drawImage(
      canvas,
      0,
      Math.floor(page.startPx),
      imgWidthPx,
      Math.ceil(sliceHeight),
      0,
      0,
      imgWidthPx,
      Math.ceil(sliceHeight)
    );

    const pageImgData = pageCanvas.toDataURL("image/png");
    pdf.addImage(pageImgData, "PNG", 0, 0, pdfWidthMm, sliceHeightMm);
  }

  pdf.save(filename);
}

function addFullImagePages(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  pdfWidthMm: number,
  pdfHeightMm: number
) {
  const imgData = canvas.toDataURL("image/png");
  const imgWidth = pdfWidthMm;
  const imgHeight = (canvas.height * pdfWidthMm) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeightMm;

  while (heightLeft > 0) {
    position -= pdfHeightMm;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeightMm;
  }
}
