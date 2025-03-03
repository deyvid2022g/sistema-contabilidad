import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Download } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import { jsPDF } from 'jspdf';

interface CashFlowData {
  startingBalance: number;
  endingBalance: number;
  inflows: {
    byCategory: { [categoryId: string]: number };
    total: number;
  };
  outflows: {
    byCategory: { [categoryId: string]: number };
    total: number;
  };
  netCashFlow: number;
}

const CashFlow: React.FC = () => {
  const { transactions, accounts, categories } = useData();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const firstDay = startOfMonth(today);
    const lastDay = endOfMonth(today);
    return {
      start: format(firstDay, 'yyyy-MM-dd'),
      end: format(lastDay, 'yyyy-MM-dd')
    };
  });
  
  const [cashFlowData, setCashFlowData] = useState<CashFlowData>({
    startingBalance: 0,
    endingBalance: 0,
    inflows: {
      byCategory: {},
      total: 0
    },
    outflows: {
      byCategory: {},
      total: 0
    },
    netCashFlow: 0
  });

  // Calculate cash flow data
  useEffect(() => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // Get transactions within the date range
    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // Calculate starting balance (sum of all account balances minus transactions in the period)
    const currentTotalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    // Calculate inflows and outflows by category
    const inflows: { [categoryId: string]: number } = {};
    const outflows: { [categoryId: string]: number } = {};
    
    periodTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        inflows[transaction.category] = (inflows[transaction.category] || 0) + transaction.amount;
      } else {
        outflows[transaction.category] = (outflows[transaction.category] || 0) + transaction.amount;
      }
    });
    
    const totalInflows = Object.values(inflows).reduce((sum, amount) => sum + amount, 0);
    const totalOutflows = Object.values(outflows).reduce((sum, amount) => sum + amount, 0);
    const netCashFlow = totalInflows - totalOutflows;
    
    // Calculate starting balance by subtracting net cash flow from current balance
    const startingBalance = currentTotalBalance - netCashFlow;
    
    setCashFlowData({
      startingBalance,
      endingBalance: currentTotalBalance,
      inflows: {
        byCategory: inflows,
        total: totalInflows
      },
      outflows: {
        byCategory: outflows,
        total: totalOutflows
      },
      netCashFlow
    });
  }, [transactions, accounts, dateRange]);

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Desconocido';
  };

  // Get category color by ID
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#cccccc';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Flujo de Efectivo', 14, 22);
    
    // Add date range
    doc.setFontSize(10);
    doc.text(`Período: ${format(new Date(dateRange.start), 'dd/MM/yyyy')} - ${format(new Date(dateRange.end), 'dd/MM/yyyy')}`, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add table
    (doc as any).autoTable({
      startY: 44,
      head: [['Concepto', 'Monto']],
      body: [
        ['Saldo Inicial', `$${cashFlowData.startingBalance.toLocaleString()}`],
        ['', ''],
        ['ENTRADAS DE EFECTIVO', ''],
        ...Object.entries(cashFlowData.inflows.byCategory).map(([categoryId, amount]) => [
          getCategoryName(categoryId), `$${amount.toLocaleString()}`
        ]),
        ['Total Entradas', `$${cashFlowData.inflows.total.toLocaleString()}`],
        ['', ''],
        ['SALIDAS DE EFECTIVO', ''],
        ...Object.entries(cashFlowData.outflows.byCategory).map(([categoryId, amount]) => [
          getCategoryName(categoryId), `$${amount.toLocaleString()}`
        ]),
        ['Total Salidas', `$${cashFlowData.outflows.total.toLocaleString()}`],
        ['', ''],
        ['Flujo Neto de Efectivo', `$${cashFlowData.netCashFlow.toLocaleString()}`],
        ['Saldo Final', `$${cashFlowData.endingBalance.toLocaleString()}`]
      ],
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    doc.save('flujo-de-efectivo.pdf');
  };

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
            Exportar
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
          {/* Starting Balance */}
          <TableRow>
            <TableCell className="font-bold">Saldo Inicial</TableCell>
            <TableCell className="text-right font-bold">${cashFlowData.startingBalance.toLocaleString()}</TableCell>
          </TableRow>

          {/* Empty row for separation */}
          <TableRow>
            <TableCell>{""}</TableCell>
            <TableCell>{""}</TableCell>
          </TableRow>

          {/* Inflows */}
          <TableRow>
            <TableCell className="font-bold text-lg">ENTRADAS DE EFECTIVO</TableCell>
            <TableCell>{""}</TableCell>
          </TableRow>
          
          {Object.entries(cashFlowData.inflows.byCategory).map(([categoryId, amount]) => (
            <TableRow key={`income-${categoryId}`}>
              <TableCell className="pl-4">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getCategoryColor(categoryId) }}
                  ></div>
                  {getCategoryName(categoryId)}
                </div>
              </TableCell>
              <TableCell className="text-right text-green-600">${amount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
          
          <TableRow>
            <TableCell className="font-bold">Total Entradas</TableCell>
            <TableCell className="text-right font-bold text-green-600">${cashFlowData.inflows.total.toLocaleString()}</TableCell>
          </TableRow>

          {/* Empty row for separation */}
          <TableRow>
            <TableCell>{""}</TableCell>
            <TableCell>{""}</TableCell>
          </TableRow>

          {/* Outflows */}
          <TableRow>
            <TableCell className="font-bold text-lg">SALIDAS DE EFECTIVO</TableCell>
            <TableCell>{""}</TableCell>
          </TableRow>
          
          {Object.entries(cashFlowData.outflows.byCategory).map(([categoryId, amount]) => (
            <TableRow key={`expense-${categoryId}`}>
              <TableCell className="pl-4">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getCategoryColor(categoryId) }}
                  ></div>
                  {getCategoryName(categoryId)}
                </div>
              </TableCell>
              <TableCell className="text-right text-red-600">${amount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
          
          <TableRow>
            <TableCell className="font-bold">Total Salidas</TableCell>
            <TableCell className="text-right font-bold text-red-600">${cashFlowData.outflows.total.toLocaleString()}</TableCell>
          </TableRow>

          {/* Empty row for separation */}
          <TableRow>
            <TableCell>{""}</TableCell>
            <TableCell>{""}</TableCell>
          </TableRow>

          {/* Net Cash Flow and Ending Balance */}
          <TableRow>
            <TableCell className="font-bold">Flujo Neto de Efectivo</TableCell>
            <TableCell className={`text-right font-bold ${cashFlowData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${cashFlowData.netCashFlow.toLocaleString()}
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-bold">Saldo Final</TableCell>
            <TableCell className="text-right font-bold">${cashFlowData.endingBalance.toLocaleString()}</TableCell>
          </TableRow>
        </Table>
      </Card>
    </div>
  );
};

export default CashFlow;