import React, { useState, useCallback, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import { jsPDF } from 'jspdf';
import * as ExcelJS from 'exceljs';

const ImpuestosReport: React.FC = () => {
  const { transactions } = useData();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedTaxCategory, setSelectedTaxCategory] = useState<string>('');

  // Filter transactions with IVA
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Only include transactions with IVA amount
      if ((transaction.ivaAmount ?? 0) <= 0) return false;
      
      const matchesDateRange = (
        !dateRange.start || new Date(transaction.date) >= new Date(dateRange.start)
      ) && (
        !dateRange.end || new Date(transaction.date) <= new Date(dateRange.end)
      );

      const matchesTaxCategory = !selectedTaxCategory || transaction.taxCategory === selectedTaxCategory;
      
      return matchesDateRange && matchesTaxCategory;
    });
  }, [transactions, dateRange, selectedTaxCategory]);

  // Calculate tax summary
  const taxSummary = useMemo(() => {
    const summary = {
      totalIVA: 0,
      byCategory: {} as Record<string, { count: number; amount: number; tax: number }>,
      byRate: {} as Record<string, { count: number; amount: number; tax: number }>
    };

    filteredTransactions.forEach(transaction => {
      const ivaAmount = transaction.ivaAmount ?? 0;
      const ivaRate = transaction.ivaRate ?? 0;
      const taxCategory = transaction.taxCategory ?? 'standard';
      
      // Add to total IVA
      summary.totalIVA += ivaAmount;
      
      // Add to category summary
      if (!summary.byCategory[taxCategory]) {
        summary.byCategory[taxCategory] = { count: 0, amount: 0, tax: 0 };
      }
      summary.byCategory[taxCategory].count += 1;
      summary.byCategory[taxCategory].amount += transaction.amount;
      summary.byCategory[taxCategory].tax += ivaAmount;
      
      // Add to rate summary
      const rateKey = `${ivaRate}%`;
      if (!summary.byRate[rateKey]) {
        summary.byRate[rateKey] = { count: 0, amount: 0, tax: 0 };
      }
      summary.byRate[rateKey].count += 1;
      summary.byRate[rateKey].amount += transaction.amount;
      summary.byRate[rateKey].tax += ivaAmount;
    });

    return summary;
  }, [filteredTransactions]);

  const resetFilters = useCallback(() => {
    setDateRange({ start: '', end: '' });
    setSelectedTaxCategory('');
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Impuestos (IVA)', 14, 22);
    
    // Add filters info
    doc.setFontSize(10);
    let filterText = 'Filtros: ';
    if (dateRange.start) filterText += `Desde: ${dateRange.start}, `;
    if (dateRange.end) filterText += `Hasta: ${dateRange.end}, `;
    if (selectedTaxCategory) filterText += `Categoría: ${selectedTaxCategory}, `;
    if (filterText === 'Filtros: ') filterText += 'Ninguno';
    else filterText = filterText.slice(0, -2); // Remove trailing comma
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    doc.text(`Total IVA: $${taxSummary.totalIVA.toLocaleString()}`, 14, 42);
    
    // Add tax category table
    doc.setFontSize(12);
    doc.text('Resumen por Categoría Fiscal', 14, 52);
    
    const categoryColumn = ['Categoría', 'Transacciones', 'Monto', 'IVA'];
    const categoryRows = Object.entries(taxSummary.byCategory).map(([category, data]) => [
      category === 'standard' ? 'Estándar' : 
      category === 'exempt' ? 'Exento' : 'Reducido',
      data.count.toString(),
      `$${data.amount.toLocaleString()}`,
      `$${data.tax.toLocaleString()}`
    ]);
    
    (doc as any).autoTable({
      head: [categoryColumn],
      body: categoryRows,
      startY: 56,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Get the Y position after the category table
    const finalYCategory = (doc as any).lastAutoTable.finalY + 10;
    
    // Add tax rate table
    doc.setFontSize(12);
    doc.text('Resumen por Tasa de IVA', 14, finalYCategory);
    
    const rateColumn = ['Tasa', 'Transacciones', 'Monto', 'IVA'];
    const rateRows = Object.entries(taxSummary.byRate).map(([rate, data]) => [
      rate,
      data.count.toString(),
      `$${data.amount.toLocaleString()}`,
      `$${data.tax.toLocaleString()}`
    ]);
    
    (doc as any).autoTable({
      head: [rateColumn],
      body: rateRows,
      startY: finalYCategory + 4,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('impuestos.pdf');
  }, [taxSummary, dateRange, selectedTaxCategory]);

  const exportToExcel = useCallback(() => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Impuestos');

    // Add title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Reporte de Impuestos (IVA)';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add summary
    worksheet.addRow(['Total IVA', `$${taxSummary.totalIVA.toLocaleString()}`]);
    worksheet.addRow([]);

    // Add category breakdown
    worksheet.addRow(['Resumen por Categoría Fiscal']);
    worksheet.addRow(['Categoría', 'Transacciones', 'Monto', 'IVA']);

    Object.entries(taxSummary.byCategory).forEach(([category, data]) => {
      worksheet.addRow([
        category === 'standard' ? 'Estándar' : 
        category === 'exempt' ? 'Exento' : 'Reducido',
        data.count,
        data.amount,
        data.tax
      ]);
    });

    worksheet.addRow([]);

    // Add rate breakdown
    worksheet.addRow(['Resumen por Tasa de IVA']);
    worksheet.addRow(['Tasa', 'Transacciones', 'Monto', 'IVA']);

    Object.entries(taxSummary.byRate).forEach(([rate, data]) => {
      worksheet.addRow([
        rate,
        data.count,
        data.amount,
        data.tax
      ]);
    });

    // Format currency columns
    [3, 4].forEach(col => {
      worksheet.getColumn(col).numFmt = '$#,##0.00';
    });

    // Save the file
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'impuestos.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }, [taxSummary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reporte de Impuestos</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="light" 
            size="sm" 
            icon={<Download size={16} />}
            onClick={exportToPDF}
          >
            Exportar PDF
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            icon={<FileSpreadsheet size={16} />}
            onClick={exportToExcel}
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                id="startDate"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="w-full md:w-64">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                id="endDate"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div className="w-full md:w-64">
              <label htmlFor="taxCategory" className="block text-sm font-medium text-gray-700 mb-1">Categoría Fiscal</label>
              <select
                id="taxCategory"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedTaxCategory}
                onChange={(e) => setSelectedTaxCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                <option value="standard">Estándar</option>
                <option value="reduced">Reducido</option>
                <option value="exempt">Exento</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Filter size={16} />}
                onClick={resetFilters}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
          
          {filteredTransactions.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">Total IVA</h3>
                  <p className="text-2xl font-bold mt-1">${taxSummary.totalIVA.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Resumen por Categoría Fiscal</h3>
                <Table
                  headers={[
                    'Categoría',
                    'Transacciones',
                    'Monto',
                    'IVA'
                  ]}
                >
                  {Object.entries(taxSummary.byCategory).map(([category, data]) => (
                    <TableRow key={category}>
                      <TableCell>
                        {category === 'standard' ? 'Estándar' : 
                         category === 'exempt' ? 'Exento' : 'Reducido'}
                      </TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>${data.amount.toLocaleString()}</TableCell>
                      <TableCell>${data.tax.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Resumen por Tasa de IVA</h3>
                <Table
                  headers={[
                    'Tasa',
                    'Transacciones',
                    'Monto',
                    'IVA'
                  ]}
                >
                  {Object.entries(taxSummary.byRate).map(([rate, data]) => (
                    <TableRow key={rate}>
                      <TableCell>{rate}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>${data.amount.toLocaleString()}</TableCell>
                      <TableCell>${data.tax.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron transacciones con IVA en el período seleccionado.</p>
              <Button 
                variant="light" 
                size="sm" 
                className="mt-4"
                onClick={resetFilters}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImpuestosReport;