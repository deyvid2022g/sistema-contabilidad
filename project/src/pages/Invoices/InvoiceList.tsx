import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';
import { Plus, Filter, Download, Search, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import { Invoice } from '../../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import InvoiceForm from './InvoiceForm';

const InvoiceList: React.FC = () => {
  const { invoices, clients, deleteInvoice } = useData();
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    let filtered = [...invoices];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clients.find(c => c.id === i.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply client filter
    if (selectedClient) {
      filtered = filtered.filter(i => i.clientId === selectedClient);
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(i => i.status === selectedStatus);
    }
    
    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(i => new Date(i.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(i => new Date(i.date) <= new Date(dateRange.end));
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [invoices, searchTerm, selectedClient, selectedStatus, dateRange, clients]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const currentInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete);
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClient('');
    setSelectedStatus('');
    setDateRange({ start: '', end: '' });
  };

  interface PDFDocument extends jsPDF {
    autoTable: (options: {
      head: string[][];
      body: (string | number)[][];
      startY: number;
      theme: string;
      styles: { fontSize: number };
      headStyles: { fillColor: number[] };
    }) => void;
  }

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF() as PDFDocument;
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Facturas', 14, 22);
    
    // Add filters info
    doc.setFontSize(10);
    let filterText = 'Filtros: ';
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      if (client) filterText += `Cliente: ${client.name}, `;
    }
    if (selectedStatus) filterText += `Estado: ${selectedStatus}, `;
    if (dateRange.start) filterText += `Desde: ${dateRange.start}, `;
    if (dateRange.end) filterText += `Hasta: ${dateRange.end}, `;
    if (filterText === 'Filtros: ') filterText += 'Ninguno';
    else filterText = filterText.slice(0, -2); // Remove trailing comma
    
    doc.text(filterText, 14, 30);
    
    // Add date
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add table
    const tableColumn = ["Número", "Fecha", "Cliente", "Total", "Estado"];
    const tableRows = filteredInvoices.map(invoice => {
      const client = clients.find(c => c.id === invoice.clientId);
      return [
        invoice.number,
        format(new Date(invoice.date), 'dd/MM/yyyy'),
        client?.name || '',
        `$${invoice.total.toLocaleString()}`,
        invoice.status
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
    doc.save('facturas.pdf');
  }, [filteredInvoices, selectedClient, selectedStatus, dateRange.start, dateRange.end, clients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentInvoice(null);
              setIsModalOpen(true);
            }}
          >
            Nueva Factura
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
                  placeholder="Buscar por número o cliente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                id="client"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">Todos los clientes</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                id="status"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="draft">Borrador</option>
                <option value="sent">Enviada</option>
                <option value="paid">Pagada</option>
                <option value="overdue">Vencida</option>
                <option value="cancelled">Cancelada</option>
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
        {currentInvoices.length > 0 ? (
          <>
            <Table
              headers={[
                'Número',
                'Fecha',
                'Cliente',
                'Total',
                'Estado',
                'Acciones'
              ]}
            >
              {currentInvoices.map((invoice) => {
                const client = clients.find(c => c.id === invoice.clientId);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{invoice.number}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{client?.name}</div>
                      {client?.email && (
                        <div className="text-xs text-gray-500">{client.email}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      ${invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status === 'paid' ? 'Pagada' :
                         invoice.status === 'overdue' ? 'Vencida' :
                         invoice.status === 'sent' ? 'Enviada' :
                         invoice.status === 'draft' ? 'Borrador' :
                         'Cancelada'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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

      {/* Create/Edit Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentInvoice ? 'Editar Factura' : 'Nueva Factura'}
        size="lg"
      >
        <InvoiceForm
          invoice={currentInvoice}
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
          <p className="text-gray-700">¿Está seguro que desea eliminar esta factura? Esta acción no se puede deshacer.</p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="light"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
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

export default InvoiceList;