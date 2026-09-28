import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPNG(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportToJPG(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.95);
  link.click();
}

export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;
  
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const width = imgWidth * ratio;
  const height = imgHeight * ratio;
  
  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const x = (pdfWidth - width) / 2;
  const y = 10;
  
  pdf.addImage(imgData, 'PNG', x, y, width, height);
  pdf.save(filename);
}

export function printReport(element: HTMLElement): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const clone = element.cloneNode(true) as HTMLElement;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hisob-kitob</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', system-ui, -apple-system, sans-serif; 
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        @media print {
          body { padding: 0; }
          @page { margin: 15mm; }
        }
      </style>
    </head>
    <body>
      ${clone.outerHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

export function generateFilename(title: string, date: string, ext: string): string {
  const cleanTitle = title.replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const cleanDate = date.replace(/-/g, '-');
  return `${cleanTitle}-${cleanDate}.${ext}`;
}
