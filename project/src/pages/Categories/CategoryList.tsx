import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useData } from '../../context/MySQLDataContext';
import { Category } from '../../types';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import { Search, Plus, Edit, Trash2, Filter, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import CategoryForm from './CategoryForm';

const CategoryList: React.FC = () => {
  const { categories, deleteCategory } = useData();
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  const filterCategories = useCallback((categories: Category[]) => {
    return categories.filter(category => {
      const matchesSearch = !searchTerm || 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
      const matchesType = !selectedType || category.type === selectedType;
    
      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType]);

  useEffect(() => {
    const filtered = filterCategories(categories);
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [categories, filterCategories]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredCategories.length / itemsPerPage)
  , [filteredCategories.length, itemsPerPage]);

  const currentCategories = useMemo(() => 
    filteredCategories.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  , [filteredCategories, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, deleteCategory]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedType('');
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Categorías', 14, 22);
    
    doc.setFontSize(10);
    const filterTexts = [
      selectedType && `Tipo: ${selectedType === 'income' ? 'Ingreso' : 'Gasto'}`
    ].filter(Boolean);
    
    const filterText = filterTexts.length > 0
      ? `Filtros: ${filterTexts.join(', ')}`
      : 'Filtros: Ninguno';
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    const tableColumn = ["Nombre", "Tipo", "Descripción", "Color"];
    const tableRows = filteredCategories.map(category => [
      category.name,
      category.type === 'income' ? 'Ingreso' : 'Gasto',
      category.description || '',
      category.color
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  
    doc.save('categorias.pdf');
  }, [filteredCategories, selectedType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentCategory(null);
              setIsModalOpen(true);
            }}
          >
            Nueva Categoría
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
            
            <div className="w-full md:w-48">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                id="type"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'income' | 'expense' | '')}
              >
                <option value="">Todos</option>
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
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
        {currentCategories.length > 0 ? (
          <>
            <Table
              headers={[
                'Nombre',
                'Tipo',
                'Descripción',
                'Color',
                'Acciones'
              ]}
            >
              {currentCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{category.name}</div>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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
            <p className="text-gray-500">No se encontraron categorías con los filtros seleccionados.</p>
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
        title={currentCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        size="lg"
      >
        <CategoryForm
          category={currentCategory || undefined}
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
          <p className="text-gray-700 mb-4">¿Está seguro que desea eliminar esta categoría?</p>
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

export default CategoryList;