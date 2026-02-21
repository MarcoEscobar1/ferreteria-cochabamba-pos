import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDateTime } from './formatters';

export function generateReceiptPDF(sale) {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] });
  const pageWidth = 80;
  let y = 10;

  // Header
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('FERRETERÍA COCHABAMBA', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.text('Cochabamba, Bolivia', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Separator
  doc.setLineWidth(0.3);
  doc.line(5, y, pageWidth - 5, y);
  y += 5;

  // Sale info
  doc.setFontSize(8);
  doc.text(`Venta N°: ${sale.sale_number}`, 5, y);
  y += 4;
  doc.text(`Fecha: ${formatDateTime(sale.created_at)}`, 5, y);
  y += 4;
  doc.text(`Empleado: ${sale.employees?.full_name || 'N/A'}`, 5, y);
  y += 4;
  doc.text(`Cliente: ${sale.customer_name || 'Cliente general'}`, 5, y);
  y += 4;
  doc.text(`Método: Efectivo (BOB)`, 5, y);
  y += 5;

  // Separator
  doc.line(5, y, pageWidth - 5, y);
  y += 3;

  // Items table
  doc.autoTable({
    startY: y,
    margin: { left: 5, right: 5 },
    styles: { fontSize: 7, cellPadding: 1 },
    headStyles: { fillColor: [51, 53, 70], textColor: 255, fontStyle: 'bold' },
    head: [['Producto', 'Cant', 'P.Unit', 'Subtotal']],
    body: (sale.sale_items || []).map((item) => [
      item.product_name,
      item.quantity,
      formatCurrency(item.unit_price),
      formatCurrency(item.subtotal),
    ]),
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 8, halign: 'center' },
      2: { cellWidth: 15, halign: 'right' },
      3: { cellWidth: 17, halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 4;

  // Total
  doc.line(5, y, pageWidth - 5, y);
  y += 5;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL: ${formatCurrency(sale.total)}`, pageWidth - 5, y, { align: 'right' });
  y += 8;

  // Footer
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.text('¡Gracias por su compra!', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Vuelva pronto', pageWidth / 2, y, { align: 'center' });

  return doc;
}

export function generateReportPDF({ title, columns, data, summary = null }) {
  const doc = new jsPDF();
  let y = 15;

  // Header
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('FERRETERÍA COCHABAMBA', 105, y, { align: 'center' });
  y += 7;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(title, 105, y, { align: 'center' });
  y += 5;
  doc.setFontSize(8);
  doc.text(`Generado: ${formatDateTime(new Date())}`, 105, y, { align: 'center' });
  y += 8;

  // Table
  doc.autoTable({
    startY: y,
    head: [columns.map((c) => c.header)],
    body: data.map((row) => columns.map((c) => c.accessor(row))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [183, 70, 9], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [246, 247, 249] },
  });

  // Summary
  if (summary) {
    y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    summary.forEach((line) => {
      doc.text(line, 14, y);
      y += 6;
    });
  }

  return doc;
}
