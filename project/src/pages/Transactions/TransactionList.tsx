import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { Plus, Filter, Download, Search, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import TransactionForm from './TransactionForm';
import { Transaction } from '../../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface TransactionListProps {
  type?: 'income' | 'expense';
}

const TransactionList: React.FC<TransactionListProps> = ({ type }) => {
  const { transactions, categories, deleteTransaction } = useData();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    let filtered = [...transactions];
    
    // Filter by type if specified
    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(dateRange.end));
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [transactions, type, searchTerm, selectedCategory, dateRange]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setDateRange({ start: '', end: '' });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Transacciones', 14, 22);
    
    // Add filters info
    doc.setFontSize(10);
    let filterText = 'Filtros: ';
    if (type) filterText += `Tipo: ${type === 'income' ? 'Ingresos' : 'Gastos'}, `;
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) filterText += `Categoría: ${category.name}, `;
    }
    if (dateRange.start) filterText += `Desde: ${dateRange.start}, `;
    if (dateRange.end) filterText += `Hasta: ${dateRange.end}, `;
    if (filterText === 'Filtros: ') filterText += 'Ninguno';
    else filterText = filterText.slice(0, -2); // Remove trailing comma
    
    doc.text(filterText, 14, 30);
    
    // Add date
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add table
    const tableColumn = ["Fecha", "Descripción", "Categoría", "Monto", "Método de Pago"];
    const tableRows = filteredTransactions.map(transaction => {
      const category = categories.find(c => c.id === transaction.category);
      return [
        format(new Date(transaction.date), 'dd/MM/yyyy'),
        transaction.description,
        category?.name || '',
        `${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toLocaleString()}`,
        transaction.paymentMethod
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
    
    // Save the PDF
    doc.save('transacciones.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {type === 'income' ? 'Ingresos' : type === 'expense' ? 'Gastos' : 'Transacciones'}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentTransaction(null);
              setIsModalOpen(true);
            }}
          >
            Nueva Transacción
          </Button>
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
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Buscar por descripción o referencia"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                id="category"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                <optgroup label="Ingresos">
                  {categories
                    .filter(c => c.type === 'income')
                    .map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))
                  }
                </optgroup>
                <optgroup label="Gastos">
                  {categories
                    .filter(c => c.type === 'expense')
                    .map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))
                  }
                </optgroup>
              </select>
            </div>
          </div>
          
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
        {currentTransactions.length > 0 ? (
          <>
            <Table
              headers={[
                'Fecha',
                'Descripción',
                'Categoría',
                'Monto',
                'Método de Pago',
                'Acciones'
              ]}
            >
              {currentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.category);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      {transaction.reference && (
                        <div className="text-xs text-gray-500">Ref: {transaction.reference}</div>
                      )}
                      {(transaction.ivaAmount ?? 0) > 0 && (
                        <div className="text-xs text-gray-500">IVA: ${(transaction.ivaAmount ?? 0).toLocaleString()} ({transaction.ivaRate}%)</div>
                      )}
                      {transaction.taxCategory && (
                        <div className="text-xs text-gray-500">Cat. Fiscal: {
                          transaction.taxCategory === 'standard' ? 'Estándar' :
                          transaction.taxCategory === 'exempt' ? 'Exento' : 'Reducido'
                        }</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                        style={{ 
                          backgroundColor: `${category?.color}20`, 
                          color: category?.color 
                        }}
                      >
                        {category?.name}
                      </span>
                    </TableCell>
                    <TableCell className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {transaction.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron transacciones con los filtros seleccionados.</p>
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
      </Card>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
        size="lg"
      >
        <TransactionForm
          transaction={currentTransaction}
          onClose={() => setIsModalOpen(false)}
          defaultType={type}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p>¿Está seguro que desea eliminar esta transacción? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="light"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionList;