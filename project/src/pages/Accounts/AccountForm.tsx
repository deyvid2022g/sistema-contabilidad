import React from 'react';
import { useData } from '../../context/DataContext';
import Button from '../../components/UI/Button';
import { Account } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AccountFormProps {
  account: Account | null;
  onClose: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onClose }) => {
  const { addAccount, updateAccount } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({
    name: account?.name || '',
    type: account?.type || 'bank',
    balance: account?.balance?.toString() || '0',
    currency: account?.currency || 'USD',
    description: account?.description || '',
    isActive: account?.isActive ?? true
  });

  const isViewer = user?.role === 'viewer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isViewer) return;

    const accountData = {
      name: formData.name,
      type: formData.type as 'bank' | 'cash' | 'credit' | 'investment',
      balance: parseFloat(formData.balance),
      currency: formData.currency,
      description: formData.description || undefined,
      isActive: formData.isActive
    };

    if (account) {
      updateAccount(account.id, accountData);
    } else {
      addAccount(accountData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
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
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Cuenta
        </label>
        <select
          id="type"
          required
          disabled={isViewer}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'bank' | 'cash' | 'credit' | 'investment' }))}
        >
          <option value="bank">Banco</option>
          <option value="cash">Efectivo</option>
          <option value="credit">Crédito</option>
          <option value="investment">Inversión</option>
        </select>
      </div>

      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
          Saldo
        </label>
        <input
          type="number"
          id="balance"
          required
          disabled={isViewer}
          step="0.01"
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={formData.balance}
          onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
          Moneda
        </label>
        <input
          type="text"
          id="currency"
          required
          disabled={isViewer}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={formData.currency}
          onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          disabled={isViewer}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          disabled={isViewer}
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isViewer ? 'cursor-not-allowed' : ''}`}
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Cuenta Activa
        </label>
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
            {account ? 'Guardar Cambios' : 'Crear Cuenta'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default AccountForm;