import React, { useState, useCallback, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import { jsPDF } from 'jspdf';
import * as ExcelJS from 'exceljs';

const BalanceGeneralReport: React.FC = () => {
  const { accounts } = useData();
  const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [showInactive, setShowInactive] = useState<boolean>(false);

  // Filter accounts based on active status
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => showInactive || account.isActive);
  }, [accounts, showInactive]);

  // Calculate balance sheet data
  const balanceSheet = useMemo(() => {
    // Group accounts by type
    const assets = filteredAccounts.filter(a => a.type === 'bank' || a.type === 'cash' || a.type === 'investment');
    const liabilities = filteredAccounts.filter(a => a.type === 'credit');
    
    // Calculate totals
    const totalAssets = assets.reduce((sum, account) => sum + account.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, account) => sum + Math.abs(account.balance), 0);
    const equity = totalAssets - totalLiabilities;
    
    return {
      assets,
      liabilities,
      totalAssets,
      totalLiabilities,
      equity
    };
  }, [filteredAccounts]);

  const resetFilters = useCallback(() => {
    setAsOfDate(format(new Date(), 'yyyy-MM-dd'));
    setShowInactive(false);
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Balance General', 14, 22);
    
    // Add date info
    doc.setFontSize(10);
    doc.text(`Al: ${format(new Date(asOfDate), 'dd/MM/yyyy')}`, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add assets table
    doc.setFontSize(12);
    doc.text('Activos', 14, 46);
    
    const assetsColumn = ['Cuenta', 'Tipo', 'Saldo'];
    const assetsRows = balanceSheet.assets.map(account => [
      account.name,
      account.type === 'bank' ? 'Banco' : 
      account.type === 'cash' ? 'Efectivo' : 'Inversión',
      `$${account.balance.toLocaleString()}`
    ]);
    
    // Add total row
    assetsRows.push(['Total Activos', '', `$${balanceSheet.totalAssets.toLocaleString()}`]);
    
    (doc as any).autoTable({
      head: [assetsColumn],
      body: assetsRows,
      startY: 50,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Get the Y position after the assets table
    const finalYAssets = (doc as any).lastAutoTable.finalY + 10;
    
    // Add liabilities table
    doc.setFontSize(12);
    doc.text('Pasivos', 14, finalYAssets);
    
    const liabilitiesColumn = ['Cuenta', 'Tipo', 'Saldo'];
    const liabilitiesRows = balanceSheet.liabilities.map(account => [
      account.name,
      'Crédito',
      `$${Math.abs(account.balance).toLocaleString()}`
    ]);
    
    // Add total row
    liabilitiesRows.push(['Total Pasivos', '', `$${balanceSheet.totalLiabilities.toLocaleString()}`]);
    
    (doc as any).autoTable({
      head: [liabilitiesColumn],
      body: liabilitiesRows,
      startY: finalYAssets + 4,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Get the Y position after the liabilities table
    const finalYLiabilities = (doc as any).lastAutoTable.finalY + 10;
    
    // Add equity section
    doc.setFontSize(12);
    doc.text('Patrimonio', 14, finalYLiabilities);
    
    const equityColumn = ['Concepto', 'Valor'];
    const equityRows = [['Capital', `$${balanceSheet.equity.toLocaleString()}`]];
    
    (doc as any).autoTable({
      head: [equityColumn],
      body: equityRows,
      startY: finalYLiabilities + 4,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('balance-general.pdf');
  }, [balanceSheet, asOfDate]);

  const exportToExcel = useCallback(() => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Balance General');

    // Add title
    worksheet.mergeCells('A1:C1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Balance General';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add date
    worksheet.mergeCells('A2:C2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Al: ${format(new Date(asOfDate), 'dd/MM/yyyy')}`;
    dateCell.font = { size: 12, italic: true };
    dateCell.alignment = { horizontal: 'center' };
    
    worksheet.addRow([]);

    // Add assets section
    worksheet.addRow(['ACTIVOS']);
    const assetHeaderRow = worksheet.addRow(['Cuenta', 'Tipo', 'Saldo']);
    assetHeaderRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0F0FF' }
      };
    });

    // Add asset rows
    balanceSheet.assets.forEach(account => {
      worksheet.addRow([
        account.name,
        account.type === 'bank' ? 'Banco' : 
        account.type === 'cash' ? 'Efectivo' : 'Inversión',
        account.balance
      ]);
    });

    // Add total assets
    const totalAssetsRow = worksheet.addRow(['Total Activos', '', balanceSheet.totalAssets]);
    totalAssetsRow.eachCell(cell => {
      cell.font = { bold: true };
    });

    worksheet.addRow([]);

    // Add liabilities section
    worksheet.addRow(['PASIVOS']);
    const liabilitiesHeaderRow = worksheet.addRow(['Cuenta', 'Tipo', 'Saldo']);
    liabilitiesHeaderRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0F0FF' }
      };
    });

    // Add liability rows
    balanceSheet.liabilities.forEach(account => {
      worksheet.addRow([
        account.name,
        'Crédito',
        Math.abs(account.balance)
      ]);
    });

    // Add total liabilities
    const totalLiabilitiesRow = worksheet.addRow(['Total Pasivos', '', balanceSheet.totalLiabilities]);
    totalLiabilitiesRow.eachCell(cell => {
      cell.font = { bold: true };
    });

    worksheet.addRow([]);

    // Add equity section
    worksheet.addRow(['PATRIMONIO']);
    const equityHeaderRow = worksheet.addRow(['Concepto', '', 'Valor']);
    equityHeaderRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0F0FF' }
      };
    });

    // Add equity row
    const equityRow = worksheet.addRow(['Capital', '', balanceSheet.equity]);
    equityRow.eachCell(cell => {
      cell.font = { bold: true };
    });

    // Format currency cells
    worksheet.getColumn(3).numFmt = '$#,##0.00';

    // Save the file
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'balance-general.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }, [balanceSheet, asOfDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Balance General</h1>
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
              <label htmlFor="asOfDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Balance</label>
              <input
                type="date"
                id="asOfDate"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-64 flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Mostrar cuentas inactivas</span>
              </label>
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
              <h3 className="text-lg font-medium text-blue-800 mb-2">Total Activos</h3>
              <p className="text-2xl font-bold text-blue-600">${balanceSheet.totalAssets.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-2">Total Pasivos</h3>
              <p className="text-2xl font-bold text-red-600">${balanceSheet.totalLiabilities.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Patrimonio</h3>
              <p className={`text-2xl font-bold ${balanceSheet.equity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${balanceSheet.equity.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activos</h3>
              <Table
                headers={[
                  'Cuenta',
                  'Tipo',
                  'Saldo'
                ]}
              >
                {balanceSheet.assets.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{account.name}</div>
                      {account.description && (
                        <div className="text-xs text-gray-500">{account.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.type === 'bank' ? 'Banco' : 
                       account.type === 'cash' ? 'Efectivo' : 'Inversión'}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      ${account.balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="font-bold text-gray-900">Total Activos</TableCell>
                  <TableCell className="font-bold text-gray-900">
                    ${balanceSheet.totalAssets.toLocaleString()}
                  </TableCell>
                </TableRow>
              </Table>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pasivos</h3>
              <Table
                headers={[
                  'Cuenta',
                  'Tipo',
                  'Saldo'
                ]}
              >
                {balanceSheet.liabilities.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{account.name}</div>
                      {account.description && (
                        <div className="text-xs text-gray-500">{account.description}</div>
                      )}
                    </TableCell>
                    <TableCell>Crédito</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      ${Math.abs(account.balance).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="font-bold text-gray-900">Total Pasivos</TableCell>
                  <TableCell className="font-bold text-gray-900">
                    ${balanceSheet.totalLiabilities.toLocaleString()}
                  </TableCell>
                </TableRow>
              </Table>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patrimonio</h3>
              <Table
                headers={[
                  'Concepto',
                  'Valor'
                ]}
              >
                <TableRow>
                  <TableCell>Capital</TableCell>
                  <TableCell className={`font-bold ${balanceSheet.equity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${balanceSheet.equity.toLocaleString()}
                  </TableCell>
                </TableRow>
              </Table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BalanceGeneralReport;