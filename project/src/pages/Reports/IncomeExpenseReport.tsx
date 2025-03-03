import React, { useState, useCallback, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import { jsPDF } from 'jspdf';
import * as ExcelJS from 'exceljs';

const IncomeExpenseReport: React.FC = () => {
  const { transactions, categories } = useData();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesDateRange = (
        !dateRange.start || new Date(transaction.date) >= new Date(dateRange.start)
      ) && (
        !dateRange.end || new Date(transaction.date) <= new Date(dateRange.end)
      );

      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.includes(transaction.category);

      return matchesDateRange && matchesCategories;
    });
  }, [transactions, dateRange, selectedCategories]);

  const summary = useMemo(() => {
    const result = {
      totalIncome: 0,
      totalExpenses: 0,
      byCategory: {} as Record<string, { income: number; expenses: number }>
    };

    filteredTransactions.forEach(transaction => {
      const amount = transaction.amount;
      if (transaction.type === 'income') {
        result.totalIncome += amount;
      } else {
        result.totalExpenses += amount;
      }

      // Initialize category if not exists
      if (!result.byCategory[transaction.category]) {
        result.byCategory[transaction.category] = { income: 0, expenses: 0 };
      }

      // Add to category totals
      if (transaction.type === 'income') {
        result.byCategory[transaction.category].income += amount;
      } else {
        result.byCategory[transaction.category].expenses += amount;
      }
    });

    return result;
  }, [filteredTransactions]);

  const resetFilters = useCallback(() => {
    setDateRange({ start: '', end: '' });
    setSelectedCategories([]);
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Ingresos y Gastos', 14, 22);
    
    // Add filters info
    doc.setFontSize(10);
    let filterText = 'Filtros: ';
    if (dateRange.start) filterText += `Desde: ${dateRange.start}, `;
    if (dateRange.end) filterText += `Hasta: ${dateRange.end}, `;
    if (filterText === 'Filtros: ') filterText += 'Ninguno';
    else filterText = filterText.slice(0, -2);
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add summary
    doc.text('Resumen:', 14, 46);
    doc.text(`Total Ingresos: $${summary.totalIncome.toLocaleString()}`, 14, 52);
    doc.text(`Total Gastos: $${summary.totalExpenses.toLocaleString()}`, 14, 58);
    doc.text(`Balance: $${(summary.totalIncome - summary.totalExpenses).toLocaleString()}`, 14, 64);
    
    // Add category breakdown table
    const tableColumn = ['Categoría', 'Ingresos', 'Gastos', 'Balance'];
    const tableRows = Object.entries(summary.byCategory).map(([categoryId, amounts]) => {
      const category = categories.find(c => c.id === categoryId);
      return [
        category?.name || 'Sin categoría',
        `$${amounts.income.toLocaleString()}`,
        `$${amounts.expenses.toLocaleString()}`,
        `$${(amounts.income - amounts.expenses).toLocaleString()}`
      ];
    });
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('ingresos-gastos.pdf');
  }, [summary, categories, dateRange]);

  const exportToExcel = useCallback(() => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ingresos y Gastos');

    // Add title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Reporte de Ingresos y Gastos';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add summary
    worksheet.addRow(['Resumen']);
    worksheet.addRow(['Total Ingresos', `$${summary.totalIncome.toLocaleString()}`]);
    worksheet.addRow(['Total Gastos', `$${summary.totalExpenses.toLocaleString()}`]);
    worksheet.addRow(['Balance', `$${(summary.totalIncome - summary.totalExpenses).toLocaleString()}`]);
    worksheet.addRow([]);

    // Add category breakdown
    worksheet.addRow(['Desglose por Categoría']);
    worksheet.addRow(['Categoría', 'Ingresos', 'Gastos', 'Balance']);

    Object.entries(summary.byCategory).forEach(([categoryId, amounts]) => {
      const category = categories.find(c => c.id === categoryId);
      worksheet.addRow([
        category?.name || 'Sin categoría',
        amounts.income,
        amounts.expenses,
        amounts.income - amounts.expenses
      ]);
    });

    // Save the file
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ingresos-gastos.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }, [summary, categories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reporte de Ingresos y Gastos</h1>
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
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">Categorías</label>
              <select
                id="categories"
                multiple
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, option => option.value))}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="light" 
                size="sm" 
                icon={<Filter size={16} />}
                onClick={resetFilters}
                className="mb-0.5"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Total Ingresos</h3>
              <p className="text-2xl font-bold text-blue-600">${summary.totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-2">Total Gastos</h3>
              <p className="text-2xl font-bold text-red-600">${summary.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Balance</h3>
              <p className={`text-2xl font-bold ${summary.totalIncome - summary.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(summary.totalIncome - summary.totalExpenses).toLocaleString()}
              </p>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Desglose por Categoría</h3>
          
          {Object.keys(summary.byCategory).length > 0 ? (
            <Table
              headers={[
                'Categoría',
                'Ingresos',
                'Gastos',
                'Balance'
              ]}
            >
              {Object.entries(summary.byCategory).map(([categoryId, amounts]) => {
                const category = categories.find(c => c.id === categoryId);
                const balance = amounts.income - amounts.expenses;
                return (
                  <TableRow key={categoryId}>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category?.color || '#888' }}
                        />
                        <span>{category?.name || 'Sin categoría'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      ${amounts.income.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      ${amounts.expenses.toLocaleString()}
                    </TableCell>
                    <TableCell className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay datos disponibles para mostrar en este reporte.</p>
              <p className="text-sm text-gray-400 mt-2">Ajuste los filtros o agregue transacciones para generar el reporte.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default IncomeExpenseReport;