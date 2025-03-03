import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Budget } from '../../types';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';

interface BudgetFormProps {
  budget?: Budget;
  onClose: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onClose }) => {
  const { addBudget, updateBudget } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    description: budget?.description || '',
    startDate: budget?.startDate || '',
    endDate: budget?.endDate || '',
    amount: budget?.amount || 0,
    actualAmount: budget?.actualAmount || 0,
    categories: budget?.categories || []
  });

  const isViewer = user?.role === 'viewer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isViewer) return;
    
    if (budget) {
      updateBudget(budget.id, formData);
    } else {
      addBudget(formData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
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

        <div className="md:col-span-2">
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

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            id="startDate"
            required
            disabled={isViewer}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            id="endDate"
            required
            disabled={isViewer}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto Presupuestado
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              required
              min="0"
              step="0.01"
              disabled={isViewer}
              className={`block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
            />
          </div>
        </div>

        <div>
          <label htmlFor="actualAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto Real
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="actualAmount"
              required
              min="0"
              step="0.01"
              disabled={isViewer}
              className={`block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewer ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.actualAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, actualAmount: parseFloat(e.target.value) }))}
            />
          </div>
        </div>
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
            {budget ? 'Guardar Cambios' : 'Crear Presupuesto'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default BudgetForm;