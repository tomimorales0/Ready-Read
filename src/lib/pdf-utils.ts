import * as pdfjsLib from 'pdfjs-dist';

// --- SOLUCIÓN DEL ERROR DE WORKER ---
// En lugar de buscar el archivo localmente (que a veces falla en Vite),
// le decimos que descargue el worker exacto para esta versión desde un CDN.
// Esto arregla el error "fake worker failed".
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + ' ';
  }

  // Basic cleanup: remove excessive spaces, fix common PDF parsing artifacts
  return fullText.replace(/\s+/g, ' ').trim();
}

export function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}