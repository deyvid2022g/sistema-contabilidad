import React from 'react';
import { useAuth } from '../../context/AuthContext';

const BudgetList: React.FC = () => {
  const { } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Nuevo Presupuesto
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No hay presupuestos registrados aún.</p>
            <p className="text-sm text-gray-400">Los presupuestos que agregue aparecerán aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetList;