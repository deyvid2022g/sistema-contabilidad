import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Filter, Download, Search, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import { Client } from '../../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import ClientForm from './ClientForm';

const ClientList: React.FC = () => {
  const { clients, deleteClient } = useData();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    let filtered = [...clients];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.taxId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply active status filter
    if (isActive !== null) {
      filtered = filtered.filter(c => c.isActive === isActive);
    }
    
    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [clients, searchTerm, isActive]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const currentClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (client: Client) => {
    setCurrentClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setIsActive(null);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Clientes', 14, 22);
    
    // Add filters info
    doc.setFontSize(10);
    let filterText = 'Filtros: ';
    if (isActive !== null) filterText += `Estado: ${isActive ? 'Activo' : 'Inactivo'}, `;
    if (filterText === 'Filtros: ') filterText += 'Ninguno';
    else filterText = filterText.slice(0, -2); // Remove trailing comma
    
    doc.text(filterText, 14, 30);
    
    // Add date
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add table
    const tableColumn = ["Nombre", "Contacto", "Email", "Teléfono", "ID Fiscal", "Estado"];
    const tableRows = filteredClients.map(client => {
      return [
        client.name,
        client.contactPerson || '',
        client.email || '',
        client.phone || '',
        client.taxId || '',
        client.isActive ? 'Activo' : 'Inactivo'
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
    doc.save('clientes.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentClient(null);
              setIsModalOpen(true);
            }}
          >
            Nuevo Cliente
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
                  placeholder="Buscar por nombre, contacto, email, teléfono o ID fiscal"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                id="status"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={isActive === null ? '' : isActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  if (e.target.value === '') setIsActive(null);
                  else setIsActive(e.target.value === 'active');
                }}
              >
                <option value="">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
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
        {currentClients.length > 0 ? (
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
              {currentClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{client.name}</div>
                    {client.taxId && (
                      <div className="text-xs text-gray-500">ID Fiscal: {client.taxId}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.contactPerson || '-'}
                  </TableCell>
                  <TableCell>
                    {client.email || '-'}
                  </TableCell>
                  <TableCell>
                    {client.phone || '-'}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {client.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
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
          <div className="text-center py-6">
            <p className="text-gray-500">No se encontraron clientes con los filtros aplicados.</p>
          </div>
        )}
      </Card>

      {/* Create/Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        title={currentClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        onClose={() => setIsModalOpen(false)}
      >
        <ClientForm 
          client={currentClient}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Confirmar Eliminación"
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <p className="mb-4">¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.</p>
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
      </Modal>
    </div>
  );
};

export default ClientList;