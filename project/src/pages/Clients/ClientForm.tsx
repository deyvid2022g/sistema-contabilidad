import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Button from '../../components/UI/Button';
import { Client } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ClientFormProps {
  client: Client | null;
  onClose: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onClose }) => {
  const { addClient, updateClient } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    contactPerson: client?.contactPerson || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    taxId: client?.taxId || '',
    notes: client?.notes || '',
    isActive: client?.isActive ?? true
  });

  const isViewer = user?.role === 'viewer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isViewer) return;

    const clientData = {
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      taxId: formData.taxId,
      notes: formData.notes,
      isActive: formData.isActive
    };

    if (client) {
      updateClient(client.id, clientData);
    } else {
      addClient(clientData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            id="name"
            required
            disabled={isViewer}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
            Persona de Contacto
          </label>
          <input
            type="text"
            id="contactPerson"
            disabled={isViewer}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.contactPerson}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            disabled={isViewer}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="text"
            id="phone"
            disabled={isViewer}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
            ID Fiscal
          </label>
          <input
            type="text"
            id="taxId"
            disabled={isViewer}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.taxId}
            onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="status"
            disabled={isViewer}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="col-span-2">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <textarea
          id="address"
          rows={2}
          disabled={isViewer}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>

      <div className="col-span-2">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          id="notes"
          rows={3}
          disabled={isViewer}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      {!isViewer && (
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="light"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
          >
            {client ? 'Guardar Cambios' : 'Crear Cliente'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ClientForm;