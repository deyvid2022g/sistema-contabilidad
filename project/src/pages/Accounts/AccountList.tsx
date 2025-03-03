import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Filter, Download, Search, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table, { TableRow, TableCell } from '../../components/UI/Table';
import Pagination from '../../components/UI/Pagination';
import Modal from '../../components/UI/Modal';
import { Account } from '../../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import AccountForm from './AccountForm';

const AccountList: React.FC = () => {
  const { accounts, deleteAccount } = useData();
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    let filtered = [...accounts];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter(a => a.type === selectedType);
    }
    
    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredAccounts(filtered);
    setCurrentPage(1);
  }, [accounts, searchTerm, selectedType]);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const currentAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (account: Account) => {
    setCurrentAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setAccountToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete);
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Reporte de Cuentas', 14, 22);
    
    // Add filters info
    doc.setFontSize(10);
    let filterText = 'Filtros: ';
    if (selectedType) filterText += `Tipo: ${selectedType === 'bank' ? 'Banco' : selectedType === 'cash' ? 'Efectivo' : selectedType === 'credit' ? 'Crédito' : 'Inversión'}, `;
    if (filterText === 'Filtros: ') filterText += 'Ninguno';
    else filterText = filterText.slice(0, -2); // Remove trailing comma
    
    doc.text(filterText, 14, 30);
    
    // Add date
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
    
    // Add table
    const tableColumn = ["Nombre", "Tipo", "Saldo", "Moneda", "Descripción", "Estado"];
    const tableRows = filteredAccounts.map(account => {
      return [
        account.name,
        account.type === 'bank' ? 'Banco' : 
        account.type === 'cash' ? 'Efectivo' : 
        account.type === 'credit' ? 'Crédito' : 'Inversión',
        `$${account.balance.toLocaleString()}`,
        account.currency,
        account.description || '',
        account.isActive ? 'Activa' : 'Inactiva'
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
    const totalBalance = filteredAccounts
      .reduce((sum, a) => sum + a.balance, 0);
      
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text(`Balance Total: $${totalBalance.toLocaleString()}`, 14, finalY);
    
    // Save the PDF
    doc.save('cuentas.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Cuentas</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => {
              setCurrentAccount(null);
              setIsModalOpen(true);
            }}
          >
            Nueva Cuenta
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
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta</label>
              <select
                id="type"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="bank">Banco</option>
                <option value="cash">Efectivo</option>
                <option value="credit">Crédito</option>
                <option value="investment">Inversión</option>
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
        {currentAccounts.length > 0 ? (
          <>
            <Table
              headers={[
                'Nombre',
                'Tipo',
                'Saldo',
                'Moneda',
                'Estado',
                'Acciones'
              ]}
            >
              {currentAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{account.name}</div>
                    {account.description && (
                      <div className="text-xs text-gray-500">{account.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.type === 'bank' ? 'Banco' : 
                     account.type === 'cash' ? 'Efectivo' : 
                     account.type === 'credit' ? 'Crédito' : 'Inversión'}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${account.balance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {account.currency}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {account.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
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
            <p className="text-gray-500">No se encontraron cuentas con los filtros aplicados.</p>
          </div>
        )}
      </Card>

      {/* Create/Edit Account Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={currentAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
          onClose={() => setIsModalOpen(false)}
        >
          <AccountForm 
            account={currentAccount}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          title="Confirmar Eliminación"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <p className="mb-4">¿Está seguro de que desea eliminar esta cuenta? Esta acción no se puede deshacer.</p>
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
      )}
    </div>
  );
};

export default AccountList;