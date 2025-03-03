import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Supplier } from '../../types';
import * as ExcelJS from 'exceljs';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import { Search, Plus, Edit, Trash2, Filter, Download, FileSpreadsheet } from 'lucide-react';
import SupplierForm from './SupplierForm';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

const SupplierList: React.FC = () => {
  const { suppliers, deleteSupplier } = useData();
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<boolean | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  const filterSuppliers = useCallback((suppliers: Supplier[]) => {
    return suppliers.filter(supplier => {
      const matchesSearch = !searchTerm || 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
      const matchesStatus = selectedStatus === '' || supplier.isActive === selectedStatus;
    
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus]);

  useEffect(() => {
    const filtered = filterSuppliers(suppliers);
    setFilteredSuppliers(filtered);
    setCurrentPage(1);
  }, [suppliers, filterSuppliers]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredSuppliers.length / itemsPerPage)
  , [filteredSuppliers.length, itemsPerPage]);

  const currentSuppliers = useMemo(() => 
    filteredSuppliers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  , [filteredSuppliers, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleEdit = useCallback((supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSupplierToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete);
      setIsDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  }, [supplierToDelete, deleteSupplier]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus('');
  }, []);

  interface PDFDocument extends jsPDF {
    autoTable: (options: {
      head: string[][];
      body: (string | number)[][];
      startY: number;
      theme: string;
      styles: { fontSize: number };
      headStyles: { fillColor: number[] };
    }) => void;
    lastAutoTable: { finalY: number };
  }

  const exportToExcel = useCallback(() => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Proveedores');

    // Add title
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Reporte de Proveedores';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add headers
    worksheet.addRow(['Nombre', 'Contacto', 'Email', 'Teléfono', 'Estado']);

    // Add data
    filteredSuppliers.forEach(supplier => {
      worksheet.addRow([
        supplier.name,
        supplier.contactPerson || '',
        supplier.email || '',
        supplier.phone || '',
        supplier.isActive ? 'Activo' : 'Inactivo'
      ]);
    });

    // Save the file
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proveedores.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }, [filteredSuppliers]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF() as PDFDocument;
    
    doc.setFontSize(18);
    doc.text('Reporte de Proveedores', 14, 22);
    
    doc.setFontSize(10);
    const filterTexts = [
      selectedStatus !== '' && `Estado: ${selectedStatus ? 'Activo' : 'Inactivo'}`
    ].filter(Boolean);
    
    const filterText = filterTexts.length > 0
      ? `Filtros: ${filterTexts.join(', ')}`
      : 'Filtros: Ninguno';
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    const tableColumn = ["Nombre", "Contacto", "Email", "Teléfono", "Estado"];
    const tableRows = filteredSuppliers.map(supplier => [
      supplier.name,
      supplier.contactPerson || '',
      supplier.email || '',
      supplier.phone || '',
      supplier.isActive ? 'Activo' : 'Inactivo'
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  
    doc.save('proveedores.pdf');
  }, [filteredSuppliers, selectedStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentSupplier(null);
              setIsModalOpen(true);
            }}
          >
            Nuevo Proveedor
          </Button>
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
                  placeholder="Buscar por nombre, email o contacto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                id="status"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedStatus === '' ? '' : selectedStatus ? 'true' : 'false'}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setSelectedStatus('');
                  } else {
                    setSelectedStatus(e.target.value === 'true');
                  }
                }}
              >
                <option value="">Todos</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
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
        {currentSuppliers.length > 0 ? (
          <>
            <Table
              headers={[
                'Nombre',
                'Contacto',
                'Email',
                'Teléfono',
                'Estado',
                'Acciones'
              ]}
            >
              {currentSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                    {supplier.taxId && (
                      <div className="text-xs text-gray-500">ID Fiscal: {supplier.taxId}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {supplier.contactPerson || '-'}
                  </TableCell>
                  <TableCell>
                    {supplier.email || '-'}
                  </TableCell>
                  <TableCell>
                    {supplier.phone || '-'}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {supplier.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
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
            <p className="text-gray-500">No se encontraron proveedores con los filtros seleccionados.</p>
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
        title={currentSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        size="lg"
      >
        <SupplierForm
          supplier={currentSupplier || undefined}
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
          <p className="text-gray-700 mb-4">¿Está seguro que desea eliminar este proveedor?</p>
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

export default SupplierList;