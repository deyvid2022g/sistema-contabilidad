import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import { jsPDF } from 'jspdf';

interface BalanceSheetData {
  assets: {
    cash: number;
    bank: number;
    investments: number;
    accountsReceivable: number;
    totalAssets: number;
  };
  liabilities: {
    accountsPayable: number;
    creditCards: number;
    totalLiabilities: number;
  };
  equity: {
    totalEquity: number;
  };
}

const BalanceSheet: React.FC = () => {
  const { accounts, invoices, bills } = useData();
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData>({
    assets: {
      cash: 0,
      bank: 0,
      investments: 0,
      accountsReceivable: 0,
      totalAssets: 0
    },
    liabilities: {
      accountsPayable: 0,
      creditCards: 0,
      totalLiabilities: 0
    },
    equity: {
      totalEquity: 0
    }
  });

  // Calculate balance sheet data
  useEffect(() => {
    const selectedDate = new Date(date);

    // Calculate assets
    const cashAccounts = accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.balance, 0);
    const bankAccounts = accounts.filter(a => a.type === 'bank').reduce((sum, a) => sum + a.balance, 0);
    const investmentAccounts = accounts.filter(a => a.type === 'investment').reduce((sum, a) => sum + a.balance, 0);
    const receivables = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled' && new Date(i.date) <= selectedDate)
      .reduce((sum, i) => sum + i.total, 0);

    // Calculate liabilities
    const payables = bills
      .filter(b => b.status !== 'paid' && b.status !== 'cancelled' && new Date(b.date) <= selectedDate)
      .reduce((sum, b) => sum + b.total, 0);
    const creditCardDebt = accounts.filter(a => a.type === 'credit').reduce((sum, a) => sum + Math.abs(a.balance), 0);

    // Calculate totals
    const totalAssets = cashAccounts + bankAccounts + investmentAccounts + receivables;
    const totalLiabilities = payables + creditCardDebt;
    const totalEquity = totalAssets - totalLiabilities;

    setBalanceSheet({
      assets: {
        cash: cashAccounts,
        bank: bankAccounts,
        investments: investmentAccounts,
        accountsReceivable: receivables,
        totalAssets
      },
      liabilities: {
        accountsPayable: payables,
        creditCards: creditCardDebt,
        totalLiabilities
      },
      equity: {
        totalEquity
      }
    });
  }, [accounts, invoices, bills, date]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Balance General', 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Fecha: ${format(new Date(date), 'dd/MM/yyyy')}`, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add table
    (doc as any).autoTable({
      startY: 44,
      head: [['Concepto', 'Monto']],
      body: [
        ['ACTIVOS', ''],
        ['Efectivo', `$${balanceSheet.assets.cash.toLocaleString()}`],
        ['Bancos', `$${balanceSheet.assets.bank.toLocaleString()}`],
        ['Inversiones', `$${balanceSheet.assets.investments.toLocaleString()}`],
        ['Cuentas por Cobrar', `$${balanceSheet.assets.accountsReceivable.toLocaleString()}`],
        ['Total Activos', `$${balanceSheet.assets.totalAssets.toLocaleString()}`],
        ['', ''],
        ['PASIVOS', ''],
        ['Cuentas por Pagar', `$${balanceSheet.liabilities.accountsPayable.toLocaleString()}`],
        ['Tarjetas de Crédito', `$${balanceSheet.liabilities.creditCards.toLocaleString()}`],
        ['Total Pasivos', `$${balanceSheet.liabilities.totalLiabilities.toLocaleString()}`],
        ['', ''],
        ['CAPITAL', ''],
        ['Total Capital', `$${balanceSheet.equity.totalEquity.toLocaleString()}`]
      ],
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    doc.save('balance-general.pdf');
  };

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
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                id="date"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          headers={[
            'Concepto',
            'Monto'
          ]}
        >
          {/* Assets */}
          <TableRow>
            <TableCell className="font-bold text-lg">ACTIVOS</TableCell>
            <TableCell>{" "}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-4">Efectivo</TableCell>
            <TableCell className="text-right">${balanceSheet.assets.cash.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-4">Bancos</TableCell>
            <TableCell className="text-right">${balanceSheet.assets.bank.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-4">Inversiones</TableCell>
            <TableCell className="text-right">${balanceSheet.assets.investments.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-4">Cuentas por Cobrar</TableCell>
            <TableCell className="text-right">${balanceSheet.assets.accountsReceivable.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold">Total Activos</TableCell>
            <TableCell className="text-right font-bold">${balanceSheet.assets.totalAssets.toLocaleString()}</TableCell>
          </TableRow>

          {/* Empty row for separation */}
          <TableRow>
            <TableCell>{" "}</TableCell>
            <TableCell>{" "}</TableCell>
          </TableRow>

          {/* Liabilities */}
          <TableRow>
            <TableCell className="font-bold text-lg">PASIVOS</TableCell>
            <TableCell>{" "}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-4">Cuentas por Pagar</TableCell>
            <TableCell className="text-right">${balanceSheet.liabilities.accountsPayable.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-4">Tarjetas de Crédito</TableCell>
            <TableCell className="text-right">${balanceSheet.liabilities.creditCards.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold">Total Pasivos</TableCell>
            <TableCell className="text-right font-bold">${balanceSheet.liabilities.totalLiabilities.toLocaleString()}</TableCell>
          </TableRow>

          {/* Empty row for separation */}
          <TableRow>
            <TableCell>{" "}</TableCell>
            <TableCell>{" "}</TableCell>
          </TableRow>

          {/* Equity */}
          <TableRow>
            <TableCell className="font-bold text-lg">CAPITAL</TableCell>
            <TableCell>{" "}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold">Total Capital</TableCell>
            <TableCell className="text-right font-bold">${balanceSheet.equity.totalEquity.toLocaleString()}</TableCell>
          </TableRow>
        </Table>
      </Card>
    </div>
  );
};

export default BalanceSheet;