import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Budget } from '../../types';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import { Search, Plus, Edit, Trash2, Filter, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import BudgetForm from './BudgetForm';

const BudgetList: React.FC = () => {
  const { budgets, deleteBudget } = useData();
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  const filterBudgets = useCallback((budgets: Budget[]) => {
    return budgets.filter(budget => {
      const matchesSearch = !searchTerm || 
        budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      const budgetStartDate = new Date(budget.startDate);
      const budgetEndDate = new Date(budget.endDate);
      const matchesDateRange = (!startDate || budgetEndDate >= startDate) && (!endDate || budgetStartDate <= endDate);
    
      return matchesSearch && matchesDateRange;
    });
  }, [searchTerm, dateRange]);

  useEffect(() => {
    const filtered = filterBudgets(budgets);
    setFilteredBudgets(filtered);
    setCurrentPage(1);
  }, [budgets, filterBudgets]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredBudgets.length / itemsPerPage)
  , [filteredBudgets.length, itemsPerPage]);

  const currentBudgets = useMemo(() => 
    filteredBudgets.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  , [filteredBudgets, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleEdit = useCallback((budget: Budget) => {
    setCurrentBudget(budget);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setBudgetToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete);
      setIsDeleteModalOpen(false);
      setBudgetToDelete(null);
    }
  }, [budgetToDelete, deleteBudget]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Presupuestos', 14, 22);
    
    doc.setFontSize(10);
    const filterTexts = [
      dateRange.start && `Desde: ${dateRange.start}`,
      dateRange.end && `Hasta: ${dateRange.end}`
    ].filter(Boolean);
    
    const filterText = filterTexts.length > 0
      ? `Filtros: ${filterTexts.join(', ')}`
      : 'Filtros: Ninguno';
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    const tableColumn = ["Nombre", "Período", "Presupuestado", "Real", "Variación"];
    const tableRows = filteredBudgets.map(budget => [
      budget.name,
      `${format(new Date(budget.startDate), 'dd/MM/yyyy')} - ${format(new Date(budget.endDate), 'dd/MM/yyyy')}`,
      `$${(budget.amount ?? 0).toLocaleString()}`,
      `$${(budget.actualAmount ?? 0).toLocaleString()}`,
      `${(((budget.actualAmount ?? 0) - (budget.amount ?? 0)) / (budget.amount ?? 1) * 100).toFixed(2)}%`
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  
    doc.save('presupuestos.pdf');
  }, [filteredBudgets, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentBudget(null);
              setIsModalOpen(true);
            }}
          >
            Nuevo Presupuesto
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
                  placeholder="Buscar por nombre o descripción"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
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
        {currentBudgets.length > 0 ? (
          <>
            <Table
              headers={[
                'Nombre',
                'Período',
                'Presupuestado',
                'Real',
                'Variación',
                'Acciones'
              ]}
            >
              {currentBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{budget.name}</div>
                    {budget.description && (
                      <div className="text-xs text-gray-500">{budget.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>{format(new Date(budget.startDate), 'dd/MM/yyyy')}</div>
                    <div className="text-xs text-gray-500">{format(new Date(budget.endDate), 'dd/MM/yyyy')}</div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    ${(budget.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    ${(budget.actualAmount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (budget.actualAmount || 0) <= (budget.amount || 0) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {(((budget.actualAmount || 0) - (budget.amount || 0)) / (budget.amount || 1) * 100).toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
            <p className="text-gray-500">No se encontraron presupuestos con los filtros seleccionados.</p>
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

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        size="lg"
      >
        <BudgetForm
          budget={currentBudget || undefined}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">¿Está seguro que desea eliminar este presupuesto?</p>
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

export default BudgetList;