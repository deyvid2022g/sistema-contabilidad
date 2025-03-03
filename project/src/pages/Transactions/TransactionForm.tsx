import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Button from '../../components/UI/Button';
import { Transaction } from '../../types';

interface TransactionFormProps {
  transaction: Transaction | null;
  onClose: () => void;
  defaultType?: 'income' | 'expense';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  transaction, 
  onClose,
  defaultType 
}) => {
  const { categories, addTransaction, updateTransaction } = useData();
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    amount: transaction?.amount || 0,
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category: transaction?.category || '',
    type: transaction?.type || defaultType || 'expense',
    reference: transaction?.reference || '',
    paymentMethod: transaction?.paymentMethod || 'cash',
    ivaAmount: transaction?.ivaAmount || 0,
    ivaRate: transaction?.ivaRate || 19, // Default IVA rate in Colombia
    taxCategory: transaction?.taxCategory || 'standard' // Default tax category
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      description: formData.description,
      amount: Number(formData.amount),
      date: formData.date,
      category: formData.category,
      type: formData.type as 'income' | 'expense',
      reference: formData.reference,
      paymentMethod: formData.paymentMethod,
      ivaAmount: Number(formData.ivaAmount),
      ivaRate: Number(formData.ivaRate),
      taxCategory: formData.taxCategory,
      createdBy: 'system'
    };

    if (transaction) {
      updateTransaction(transaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    onClose();
  };

  const calculateIVA = () => {
    const amount = Number(formData.amount);
    const ivaRate = Number(formData.ivaRate);
    const ivaAmount = (amount * ivaRate) / 100;
    setFormData(prev => ({ ...prev, ivaAmount: ivaAmount }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto
          </label>
          <input
            type="number"
            id="amount"
            required
            min="0"
            step="0.01"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.amount}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }));
              calculateIVA();
            }}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            id="category"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">Seleccionar categoría</option>
            {categories
              .filter(cat => cat.type === formData.type)
              .map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            id="type"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Método de Pago
          </label>
          <select
            id="paymentMethod"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.paymentMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
          >
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="card">Tarjeta</option>
            <option value="check">Cheque</option>
          </select>
        </div>

        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
            Referencia
          </label>
          <input
            type="text"
            id="reference"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.reference}
            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="ivaRate" className="block text-sm font-medium text-gray-700 mb-1">
            Tasa de IVA (%)
          </label>
          <input
            type="number"
            id="ivaRate"
            required
            min="0"
            max="100"
            step="1"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.ivaRate}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, ivaRate: parseFloat(e.target.value) }));
              calculateIVA();
            }}
          />
        </div>

        <div>
          <label htmlFor="ivaAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto de IVA
          </label>
          <input
            type="number"
            id="ivaAmount"
            readOnly
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
            value={formData.ivaAmount}
          />
        </div>

        <div>
          <label htmlFor="taxCategory" className="block text-sm font-medium text-gray-700 mb-1">
            Categoría Fiscal
          </label>
          <select
            id="taxCategory"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.taxCategory}
            onChange={(e) => setFormData(prev => ({ ...prev, taxCategory: e.target.value as 'standard' | 'exempt' | 'reduced' }))}
          >
            <option value="standard">Estándar</option>
            <option value="exempt">Exento</option>
            <option value="reduced">Reducido</option>
          </select>
        </div>
      </div>

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
          {transaction ? 'Guardar Cambios' : 'Crear Transacción'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;