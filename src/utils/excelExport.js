import * as XLSX from 'xlsx';

export function exportToExcel({ title, columns, data, fileName }) {
  const wsData = [
    [title],
    [],
    columns.map((c) => c.header),
    ...data.map((row) => columns.map((c) => c.accessor(row))),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style header row
  ws['!cols'] = columns.map(() => ({ wch: 20 }));
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, `${fileName || 'reporte'}.xlsx`);
}
