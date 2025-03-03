import React, { useState, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import { Download, FileText, DollarSign, Tag, Users, ShoppingBag } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

type ReportType = 'transactions' | 'budgets' | 'categories' | 'clients' | 'suppliers';

interface ReportOption {
  id: ReportType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const ReportList: React.FC = () => {
  const { transactions, budgets, categories, clients, suppliers } = useData();
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  const reportOptions: ReportOption[] = [
    {
      id: 'transactions',
      name: 'Reporte de Transacciones',
      description: 'Genera un informe detallado de ingresos y gastos en un período específico.',
      icon: <FileText size={24} />
    },
    {
      id: 'budgets',
      name: 'Reporte de Presupuestos',
      description: 'Compara presupuestos planificados con gastos reales.',
      icon: <DollarSign size={24} />
    },
    {
      id: 'categories',
      name: 'Reporte por Categorías',
      description: 'Analiza gastos e ingresos agrupados por categorías.',
      icon: <Tag size={24} />
    },
    {
      id: 'clients',
      name: 'Reporte de Clientes',
      description: 'Información sobre clientes y sus facturas asociadas.',
      icon: <Users size={24} />
    },
    {
      id: 'suppliers',
      name: 'Reporte de Proveedores',
      description: 'Detalle de proveedores y gastos asociados.',
      icon: <ShoppingBag size={24} />
    }
  ];

  const generateTransactionsReport = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Transacciones', 14, 22);
    
    doc.setFontSize(10);
    const filterTexts = [
      dateRange.start && `Desde: ${dateRange.start}`,
      dateRange.end && `Hasta: ${dateRange.end}`
    ].filter(Boolean);
    
    const filterText = filterTexts.length > 0
      ? `Período: ${filterTexts.join(' - ')}`
      : 'Período: Todos los registros';
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Filter transactions by date if needed
    let filteredTransactions = [...transactions];
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= endDate);
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const tableColumn = ["Fecha", "Descripción", "Categoría", "Tipo", "Monto"];
    const tableRows = filteredTransactions.map(transaction => {
      const category = categories.find(c => c.id === transaction.category);
      return [
        format(new Date(transaction.date), 'dd/MM/yyyy'),
        transaction.description,
        category?.name || '',
        transaction.type === 'income' ? 'Ingreso' : 'Gasto',
        `$${transaction.amount.toLocaleString()}`
      ];
    });
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Add summary
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = totalIncome - totalExpense;
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text(`Total Ingresos: $${totalIncome.toLocaleString()}`, 14, finalY);
    doc.text(`Total Gastos: $${totalExpense.toLocaleString()}`, 14, finalY + 6);
    doc.text(`Balance: $${balance.toLocaleString()}`, 14, finalY + 12);
    
    doc.save('reporte-transacciones.pdf');
  }, [transactions, categories, dateRange]);

  const generateBudgetsReport = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Presupuestos', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    // Filter budgets by date if needed
    let filteredBudgets = [...budgets];
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filteredBudgets = filteredBudgets.filter(b => new Date(b.endDate) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      filteredBudgets = filteredBudgets.filter(b => new Date(b.startDate) <= endDate);
    }
    
    const tableColumn = ["Nombre", "Período", "Presupuestado", "Real", "Variación"];
    const tableRows = filteredBudgets.map(budget => {
      // Calculate total planned and actual amounts from budget categories
      const totalPlanned = budget.categories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
      const totalActual = budget.categories.reduce((sum, cat) => sum + cat.actualAmount, 0);
      const variance = ((totalActual - totalPlanned) / totalPlanned * 100).toFixed(2);
      
      return [
        budget.name,
        `${format(new Date(budget.startDate), 'dd/MM/yyyy')} - ${format(new Date(budget.endDate), 'dd/MM/yyyy')}`,
        `$${totalPlanned.toLocaleString()}`,
        `$${totalActual.toLocaleString()}`,
        `${variance}%`
      ];
    });
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 36,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Add summary
    const totalBudgeted = filteredBudgets.reduce((sum, b) => 
      sum + b.categories.reduce((catSum, cat) => catSum + cat.plannedAmount, 0), 0);
    const totalActual = filteredBudgets.reduce((sum, b) => 
      sum + b.categories.reduce((catSum, cat) => catSum + cat.actualAmount, 0), 0);
    const variance = totalActual - totalBudgeted;
    const variancePercentage = (variance / totalBudgeted * 100).toFixed(2);
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text(`Total Presupuestado: $${totalBudgeted.toLocaleString()}`, 14, finalY);
    doc.text(`Total Real: $${totalActual.toLocaleString()}`, 14, finalY + 6);
    doc.text(`Variación: $${variance.toLocaleString()} (${variancePercentage}%)`, 14, finalY + 12);
    
    doc.save('reporte-presupuestos.pdf');
  }, [budgets, dateRange]);

  const generateCategoriesReport = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte por Categorías', 14, 22);
    
    doc.setFontSize(10);
    const filterTexts = [
      dateRange.start && `Desde: ${dateRange.start}`,
      dateRange.end && `Hasta: ${dateRange.end}`
    ].filter(Boolean);
    
    const filterText = filterTexts.length > 0
      ? `Período: ${filterTexts.join(' - ')}`
      : 'Período: Todos los registros';
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Filter transactions by date if needed
    let filteredTransactions = [...transactions];
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= endDate);
    }
    
    // Group transactions by category
    const categoryTotals: Record<string, { income: number; expense: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        categoryTotals[transaction.category].income += transaction.amount;
      } else {
        categoryTotals[transaction.category].expense += transaction.amount;
      }
    });
    
    const tableColumn = ["Categoría", "Tipo", "Ingresos", "Gastos", "Balance"];
    const tableRows = categories.map(category => {
      const totals = categoryTotals[category.id] || { income: 0, expense: 0 };
      const balance = totals.income - totals.expense;
      
      return [
        category.name,
        category.type === 'income' ? 'Ingreso' : 'Gasto',
        `$${totals.income.toLocaleString()}`,
        `$${totals.expense.toLocaleString()}`,
        `$${balance.toLocaleString()}`
      ];
    });
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('reporte-categorias.pdf');
  }, [transactions, categories, dateRange]);

  const generateClientsReport = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Clientes', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    const tableColumn = ["Nombre", "Contacto", "Email", "Teléfono", "Estado"];
    const tableRows = clients.map(client => [
      client.name,
      client.contactPerson || '',
      client.email || '',
      client.phone || '',
      client.isActive ? 'Activo' : 'Inactivo'
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 36,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('reporte-clientes.pdf');
  }, [clients]);

  const generateSuppliersReport = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Proveedores', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    const tableColumn = ["Nombre", "Contacto", "Email", "Teléfono", "Estado"];
    const tableRows = suppliers.map(supplier => [
      supplier.name,
      supplier.contactPerson || '',
      supplier.email || '',
      supplier.phone || '',
      supplier.isActive ? 'Activo' : 'Inactivo'
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 36,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('reporte-proveedores.pdf');
  }, [suppliers]);

  const generateReport = () => {
    if (!selectedReport) return;
    
    switch (selectedReport) {
      case 'transactions':
        generateTransactionsReport();
        break;
      case 'budgets':
        generateBudgetsReport();
        break;
      case 'categories':
        generateCategoriesReport();
        break;
      case 'clients':
        generateClientsReport();
        break;
      case 'suppliers':
        generateSuppliersReport();
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportOptions.map(option => (
          <Card key={option.id} className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedReport(option.id)}>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                {option.icon}
              </div>
              <div>
                <h3 className="font-medium">{option.name}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border rounded px-3 py-2"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border rounded px-3 py-2"
            />
          </div>
          
          <Button
            onClick={generateReport}
            className="flex items-center space-x-2">
            <Download size={20} />
            <span>Generar Reporte</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReportList;