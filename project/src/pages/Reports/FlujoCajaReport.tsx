import React, { useState, useCallback, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import { jsPDF } from 'jspdf';
import * as ExcelJS from 'exceljs';

const FlujoCajaReport: React.FC = () => {
  const { transactions, accounts } = useData();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const startDate = startOfMonth(subMonths(today, 3));
    const endDate = endOfMonth(today);
    return {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    };
  });
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  // Filter transactions based on date range and account
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const matchesDateRange = 
        (!dateRange.start || transactionDate >= new Date(dateRange.start)) &&
        (!dateRange.end || transactionDate <= new Date(dateRange.end));
      
      // If no account is selected, include all transactions
      const matchesAccount = !selectedAccount || transaction.paymentMethod.includes(selectedAccount);
      
      return matchesDateRange && matchesAccount;
    });
  }, [transactions, dateRange, selectedAccount]);

  // Group transactions by month
  const cashFlowByMonth = useMemo(() => {
    const result: Record<string, { inflows: number; outflows: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      const monthKey = format(new Date(transaction.date), 'yyyy-MM');
      
      if (!result[monthKey]) {
        result[monthKey] = { inflows: 0, outflows: 0 };
      }
      
      if (transaction.type === 'income') {
        result[monthKey].inflows += transaction.amount;
      } else {
        result[monthKey].outflows += transaction.amount;
      }
    });
    
    // Convert to array and sort by month
    return Object.entries(result)
      .map(([month, data]) => ({
        month,
        ...data,
        netFlow: data.inflows - data.outflows
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  // Calculate totals
  const totals = useMemo(() => {
    return cashFlowByMonth.reduce(
      (acc, { inflows, outflows, netFlow }) => {
        acc.totalInflows += inflows;
        acc.totalOutflows += outflows;
        acc.totalNetFlow += netFlow;
        return acc;
      },
      { totalInflows: 0, totalOutflows: 0, totalNetFlow: 0 }
    );
  }, [cashFlowByMonth]);

  const resetFilters = useCallback(() => {
    const today = new Date();
    const startDate = startOfMonth(subMonths(today, 3));
    const endDate = endOfMonth(today);
    setDateRange({
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    });
    setSelectedAccount('');
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Flujo de Efectivo', 14, 22);
    
    // Add filters info
    doc.setFontSize(10);
    let filterText = 'Filtros: ';
    if (dateRange.start) filterText += `Desde: ${format(new Date(dateRange.start), 'dd/MM/yyyy')}, `;
    if (dateRange.end) filterText += `Hasta: ${format(new Date(dateRange.end), 'dd/MM/yyyy')}, `;
    if (selectedAccount) {
      const account = accounts.find(a => a.name.includes(selectedAccount));
      if (account) filterText += `Cuenta: ${account.name}, `;
    }
    if (filterText === 'Filtros: ') filterText += 'Ninguno';
    else filterText = filterText.slice(0, -2); // Remove trailing comma
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add cash flow table
    const tableColumn = ['Mes', 'Entradas', 'Salidas', 'Flujo Neto'];
    const tableRows = cashFlowByMonth.map(({ month, inflows, outflows, netFlow }) => [
      format(new Date(month + '-01'), 'MMMM yyyy'),
      `$${inflows.toLocaleString()}`,
      `$${outflows.toLocaleString()}`,
      `$${netFlow.toLocaleString()}`
    ]);
    
    // Add totals row
    tableRows.push([
      'Total',
      `$${totals.totalInflows.toLocaleString()}`,
      `$${totals.totalOutflows.toLocaleString()}`,
      `$${totals.totalNetFlow.toLocaleString()}`
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 44,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('flujo-efectivo.pdf');
  }, [cashFlowByMonth, totals, dateRange, selectedAccount, accounts]);

  const exportToExcel = useCallback(() => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Flujo de Efectivo');

    // Add title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Reporte de Flujo de Efectivo';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add date range
    worksheet.mergeCells('A2:D2');
    const dateRangeCell = worksheet.getCell('A2');
    dateRangeCell.value = `Período: ${format(new Date(dateRange.start), 'dd/MM/yyyy')} - ${format(new Date(dateRange.end), 'dd/MM/yyyy')}`;
    dateRangeCell.font = { size: 12, italic: true };
    dateRangeCell.alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // Add headers
    const headerRow = worksheet.addRow(['Mes', 'Entradas', 'Salidas', 'Flujo Neto']);
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0F0FF' }
      };
    });

    // Add data rows
    cashFlowByMonth.forEach(({ month, inflows, outflows, netFlow }) => {
      worksheet.addRow([
        format(new Date(month + '-01'), 'MMMM yyyy'),
        inflows,
        outflows,
        netFlow
      ]);
    });

    // Add totals row
    const totalsRow = worksheet.addRow([
      'Total',
      totals.totalInflows,
      totals.totalOutflows,
      totals.totalNetFlow
    ]);
    totalsRow.eachCell(cell => {
      cell.font = { bold: true };
    });

    // Format currency columns
    [2, 3, 4].forEach(col => {
      worksheet.getColumn(col).numFmt = '$#,##0.00';
    });

    // Save the file
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flujo-efectivo.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }, [cashFlowByMonth, totals, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Flujo de Efectivo</h1>
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
              <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
              <select
                id="account"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option value="">Todas las cuentas</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.name}>{account.name}</option>
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
        {cashFlowByMonth.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Total Entradas</h3>
                <p className="text-2xl font-bold text-blue-600">${totals.totalInflows.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-800 mb-2">Total Salidas</h3>
                <p className="text-2xl font-bold text-red-600">${totals.totalOutflows.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Flujo Neto</h3>
                <p className={`text-2xl font-bold ${totals.totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totals.totalNetFlow.toLocaleString()}
                </p>
              </div>
            </div>

            <Table
              headers={[
                'Mes',
                'Entradas',
                'Salidas',
                'Flujo Neto'
              ]}
            >
              {cashFlowByMonth.map(({ month, inflows, outflows, netFlow }) => (
                <TableRow key={month}>
                  <TableCell>
                    {format(new Date(month + '-01'), 'MMMM yyyy')}
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    ${inflows.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    ${outflows.toLocaleString()}
                  </TableCell>
                  <TableCell className={`font-medium ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netFlow.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-blue-600 font-bold">
                  ${totals.totalInflows.toLocaleString()}
                </TableCell>
                <TableCell className="text-red-600 font-bold">
                  ${totals.totalOutflows.toLocaleString()}
                </TableCell>
                <TableCell className={`font-bold ${totals.totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totals.totalNetFlow.toLocaleString()}
                </TableCell>
              </TableRow>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay datos disponibles para mostrar en este reporte.</p>
            <p className="text-sm text-gray-400">Ajuste los filtros o agregue transacciones para generar el reporte de flujo de efectivo.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FlujoCajaReport;