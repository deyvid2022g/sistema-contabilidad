import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { Plus, Filter, Download, Search, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import { Bill } from '../../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import BillForm from './BillForm';

type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

interface DateRange {
  start: string;
  end: string;
}

const BillsList: React.FC = () => {
  const { bills, suppliers, deleteBill } = useData();
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<BillStatus | ''>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  const filterBills = useCallback((bills: Bill[]) => {
    return bills.filter(bill => {
      const supplier = suppliers.find(s => s.id === bill.supplierId);
      const matchesSearch = !searchTerm || 
        bill.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
      const matchesSupplier = !selectedSupplier || bill.supplierId === selectedSupplier;
      const matchesStatus = !selectedStatus || bill.status === selectedStatus;
    
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      const billDate = new Date(bill.date);
      const matchesDateRange = (!startDate || billDate >= startDate) && (!endDate || billDate <= endDate);
    
      return matchesSearch && matchesSupplier && matchesStatus && matchesDateRange;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, selectedSupplier, selectedStatus, dateRange, suppliers]);

  useEffect(() => {
    const filtered = filterBills(bills);
    setFilteredBills(filtered);
    setCurrentPage(1);
  }, [bills, filterBills]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredBills.length / itemsPerPage)
  , [filteredBills.length, itemsPerPage]);

  const currentBills = useMemo(() => 
    filteredBills.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  , [filteredBills, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleEdit = useCallback((bill: Bill) => {
    setCurrentBill(bill);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setBillToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (billToDelete) {
      deleteBill(billToDelete);
      setIsDeleteModalOpen(false);
      setBillToDelete(null);
    }
  }, [billToDelete, deleteBill]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedSupplier('');
    setSelectedStatus('');
    setDateRange({ start: '', end: '' });
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

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF() as PDFDocument;
    
    doc.setFontSize(18);
    doc.text('Reporte de Gastos y Facturas', 14, 22);
    
    doc.setFontSize(10);
    const supplier = selectedSupplier ? suppliers.find(s => s.id === selectedSupplier) : null;
    const filterTexts = [
      supplier ? `Proveedor: ${supplier.name}` : '',
      selectedStatus && `Estado: ${selectedStatus}`,
      dateRange.start && `Desde: ${dateRange.start}`,
      dateRange.end && `Hasta: ${dateRange.end}`
    ].filter(Boolean);
    
    const filterText = filterTexts.length > 0
      ? `Filtros: ${filterTexts.join(', ')}`
      : 'Filtros: Ninguno';
    
    doc.text(filterText, 14, 30);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    const tableColumn = ["Número", "Fecha", "Proveedor", "Total", "Estado"];
    const tableRows = filteredBills.map(bill => {
      const billSupplier = suppliers.find(s => s.id === bill.supplierId);
      return [
        bill.number,
        format(new Date(bill.date), 'dd/MM/yyyy'),
        billSupplier?.name || '',
        `$${bill.total.toLocaleString()}`,
        bill.status === 'paid' ? 'Pagado' :
        bill.status === 'overdue' ? 'Vencido' :
        bill.status === 'pending' ? 'Pendiente' :
        'Cancelado'
      ];
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  
    const finalY = doc.lastAutoTable.finalY + 10;
    const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
    const pendingAmount = filteredBills
      .filter(bill => bill.status === 'pending' || bill.status === 'overdue')
      .reduce((sum, bill) => sum + bill.total, 0);
    const paidAmount = filteredBills
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.total, 0);
  
    doc.text(`Total Gastos: $${totalAmount.toLocaleString()}`, 14, finalY);
    doc.text(`Total Pendiente: $${pendingAmount.toLocaleString()}`, 14, finalY + 6);
    doc.text(`Total Pagado: $${paidAmount.toLocaleString()}`, 14, finalY + 12);
    
    doc.save('gastos-y-facturas.pdf');
  }, [filteredBills, selectedSupplier, selectedStatus, dateRange.start, dateRange.end, suppliers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gastos y Facturas</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentBill(null);
              setIsModalOpen(true);
            }}
          >
            Nuevo Gasto
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
                  placeholder="Buscar por número o proveedor"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <select
                id="supplier"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <option value="">Todos los proveedores</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                id="status"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as '' | BillStatus)}
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="overdue">Vencido</option>
                <option value="cancelled">Cancelado</option>
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
        {currentBills.length > 0 ? (
          <>
            <Table
              headers={[
                'Número',
                'Fecha',
                'Proveedor',
                'Total',
                'Estado',
                'Acciones'
              ]}
            >
              {currentBills.map((bill) => {
                const supplier = suppliers.find(s => s.id === bill.supplierId);
                return (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{bill.number}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(bill.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{supplier?.name}</div>
                      {supplier?.email && (
                        <div className="text-xs text-gray-500">{supplier.email}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      ${bill.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                          bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {bill.status === 'paid' ? 'Pagado' :
                         bill.status === 'overdue' ? 'Vencido' :
                         bill.status === 'pending' ? 'Pendiente' :
                         'Cancelado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(bill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
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
            <p className="text-gray-500">No se encontraron facturas con los filtros seleccionados.</p>
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
        title={currentBill ? 'Editar Gasto' : 'Nuevo Gasto'}
        size="lg"
      >
        <BillForm
          bill={currentBill}
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
          <p className="text-gray-700 mb-4">¿Está seguro que desea eliminar esta factura?</p>
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

export default BillsList;