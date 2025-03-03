import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  ShoppingCart,
  Users,
  BarChart
} from 'lucide-react';
import Card from '../components/UI/Card';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyDataItem {
  income: number;
  expenses: number;
}

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    accounts, 
    invoices, 
    bills, 
    categories,
    clients 
  } = useData();
  
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  // We'll keep these variables but mark them with _ to indicate they're not used
  const [_currentTransactions, setCurrentTransactions] = useState<any[]>([]);
  const [_previousTransactions, setPreviousTransactions] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [_previousIncome, setPreviousIncome] = useState(0);
  const [_previousExpenses, setPreviousExpenses] = useState(0);
  const [_previousNetIncome, setPreviousNetIncome] = useState(0);
  const [incomeChange, setIncomeChange] = useState(0);
  const [expensesChange, setExpensesChange] = useState(0);
  const [netIncomeChange, setNetIncomeChange] = useState(0);
  const [cashFlowData, setCashFlowData] = useState<any>({ labels: [], datasets: [] });
  const [incomeByCategoryData, setIncomeByCategoryData] = useState<any>({ labels: [], datasets: [] });
  const [expenseByCategoryData, setExpenseByCategoryData] = useState<any>({ labels: [], datasets: [] });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Get date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  };

  // Get previous period for comparison
  const getPreviousPeriod = () => {
    const { start, end } = getDateRange();
    const duration = end.getTime() - start.getTime();
    
    return {
      start: new Date(start.getTime() - duration),
      end: new Date(end.getTime() - duration)
    };
  };

  // Filter transactions by date range
  const filterTransactionsByDate = (transactions: any[], start: Date, end: Date) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  };

  // Update all data when dateRange changes
  useEffect(() => {
    // Calculate metrics for current period
    const { start, end } = getDateRange();
    const filtered = filterTransactionsByDate(transactions, start, end);
    setCurrentTransactions(filtered);
    
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalIncome(income);
      
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalExpenses(expenses);
      
    const net = income - expenses;
    setNetIncome(net);
    
    // Calculate metrics for previous period
    const { start: prevStart, end: prevEnd } = getPreviousPeriod();
    const prevFiltered = filterTransactionsByDate(transactions, prevStart, prevEnd);
    setPreviousTransactions(prevFiltered);
    
    const prevIncome = prevFiltered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    setPreviousIncome(prevIncome);
      
    const prevExpenses = prevFiltered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    setPreviousExpenses(prevExpenses);
      
    const prevNet = prevIncome - prevExpenses;
    setPreviousNetIncome(prevNet);

    // Calculate period-over-period changes
    setIncomeChange(prevIncome ? ((income - prevIncome) / prevIncome) * 100 : 0);
    setExpensesChange(prevExpenses ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0);
    setNetIncomeChange(prevNet ? ((net - prevNet) / prevNet) * 100 : 0);

    // Prepare chart data
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    
    // Last 6 months for charts
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return months[monthIndex];
    }).reverse();

    // Calculate monthly data for charts
    const monthlyData: MonthlyDataItem[] = last6Months.map((_, index) => {
      const monthStart = new Date();
      monthStart.setMonth(currentMonth - (5 - index));
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthStart.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthTransactions = filterTransactionsByDate(transactions, monthStart, monthEnd);
      
      return {
        income: monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      };
    });

    // Update cash flow chart data
    setCashFlowData({
      labels: last6Months,
      datasets: [
        {
          label: 'Ingresos',
          data: monthlyData.map((d: MonthlyDataItem) => d.income),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.3,
        },
        {
          label: 'Gastos',
          data: monthlyData.map((d: MonthlyDataItem) => d.expenses),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
        },
      ],
    });

    // Income by category
    const incomeCategories = categories.filter(c => c.type === 'income');
    setIncomeByCategoryData({
      labels: incomeCategories.map(c => c.name),
      datasets: [
        {
          data: incomeCategories.map(c => {
            const total = filtered
              .filter(t => t.type === 'income' && t.category === c.id)
              .reduce((sum, t) => sum + t.amount, 0);
            return total;
          }),
          backgroundColor: incomeCategories.map(c => c.color),
          borderWidth: 1,
        },
      ],
    });

    // Expense by category
    const expenseCategories = categories.filter(c => c.type === 'expense');
    setExpenseByCategoryData({
      labels: expenseCategories.map(c => c.name),
      datasets: [
        {
          data: expenseCategories.map(c => {
            const total = filtered
              .filter(t => t.type === 'expense' && t.category === c.id)
              .reduce((sum, t) => sum + t.amount, 0);
            return total;
          }),
          backgroundColor: expenseCategories.map(c => c.color),
          borderWidth: 1,
        },
      ],
    });

    // Recent transactions
    setRecentTransactions([...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5));

  }, [dateRange, transactions, categories]);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
  const pendingInvoicesTotal = pendingInvoices.reduce((sum, i) => sum + i.total, 0);
  
  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue');
  const pendingBillsTotal = pendingBills.reduce((sum, b) => sum + b.total, 0);

  // Memoize these values to avoid recalculation on each render
  const chartData = useMemo(() => {
    // Get months for chart labels
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    
    // Last 6 months for charts
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return months[monthIndex];
    }).reverse();

    // Calculate monthly data for charts
    const monthlyData: MonthlyDataItem[] = last6Months.map((_, index) => {
      const monthStart = new Date();
      monthStart.setMonth(currentMonth - (5 - index));
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthStart.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthTransactions = filterTransactionsByDate(transactions, monthStart, monthEnd);
      
      return {
        income: monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      };
    });

    return { last6Months, monthlyData };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'week' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Semana
          </button>
          <button 
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'month' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Mes
          </button>
          <button 
            onClick={() => setDateRange('quarter')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'quarter' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Trimestre
          </button>
          <button 
            onClick={() => setDateRange('year')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'year' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Año
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <h3 className="text-xl font-semibold text-gray-900">${totalIncome.toLocaleString()}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpRight size={16} />
            <span className="ml-1">{incomeChange.toFixed(1)}% vs periodo anterior</span>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <TrendingDown size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
              <h3 className="text-xl font-semibold text-gray-900">${totalExpenses.toLocaleString()}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <ArrowDownRight size={16} />
            <span className="ml-1">{expensesChange.toFixed(1)}% vs periodo anterior</span>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DollarSign size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingreso Neto</p>
              <h3 className="text-xl font-semibold text-gray-900">${netIncome.toLocaleString()}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <ArrowUpRight size={16} />
            <span className="ml-1">{netIncomeChange.toFixed(1)}% vs periodo anterior</span>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <CreditCard size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Balance Total</p>
              <h3 className="text-xl font-semibold text-gray-900">${totalBalance.toLocaleString()}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <Calendar size={16} />
            <span className="ml-1">Actualizado hoy</span>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Flujo de Efectivo">
          <div className="h-80">
            <Line 
              data={cashFlowData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} 
            />
          </div>
        </Card>

        <Card title="Ingresos vs Gastos">
          <div className="h-80">
            <Bar 
              data={{
                labels: chartData.last6Months,
                datasets: [
                  {
                    label: 'Ingresos',
                    data: chartData.monthlyData.map((d: MonthlyDataItem) => d.income),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                  },
                  {
                    label: 'Gastos',
                    data: chartData.monthlyData.map((d: MonthlyDataItem) => d.expenses),
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                  },
                ],
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} 
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ingresos por Categoría">
          <div className="h-64">
            <Pie 
              data={incomeByCategoryData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }} 
            />
          </div>
        </Card>

        <Card title="Gastos por Categoría">
          <div className="h-64">
            <Pie 
              data={expenseByCategoryData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }} 
            />
          </div>
        </Card>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FileText size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Facturas Pendientes</p>
              <h3 className="text-xl font-semibold text-gray-900">{pendingInvoices.length}</h3>
              <p className="text-sm text-gray-500 mt-1">${pendingInvoicesTotal.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <ShoppingCart size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gastos Pendientes</p>
              <h3 className="text-xl font-semibold text-gray-900">{pendingBills. length}</h3>
              <p className="text-sm text-gray-500 mt-1">${pendingBillsTotal.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-cyan-100 text-cyan-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
              <h3 className="text-xl font-semibold text-gray-900">{clients.filter(client => client.isActive).length}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <BarChart size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Presupuestos</p>
              <h3 className="text-xl font-semibold text-gray-900">1</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card title="Transacciones Recientes">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.category);
                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(transaction.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                        style={{ 
                          backgroundColor: `${category?.color}20`, 
                          color: category?.color 
                        }}
                      >
                        {category?.name}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;