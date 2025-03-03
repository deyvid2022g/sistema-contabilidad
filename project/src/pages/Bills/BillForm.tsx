import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import Button from '../../components/UI/Button';
import { Bill } from '../../types';

interface BillFormProps {
  bill: Bill | null;
  onClose: () => void;
}

const BillForm: React.FC<BillFormProps> = ({ bill, onClose }) => {
  const { addBill, updateBill, suppliers } = useData();
  const [formData, setFormData] = useState({
    number: bill?.number || '',
    date: bill?.date || new Date().toISOString().split('T')[0],
    dueDate: bill?.dueDate || '',
    supplierId: bill?.supplierId || '',
    items: bill?.items || [{ id: '1', description: '', quantity: 1, unitPrice: 0, tax: 0, total: 0 }],
    subtotal: bill?.subtotal || 0,
    tax: bill?.tax || 0,
    discount: bill?.discount || 0,
    total: bill?.total || 0,
    status: bill?.status || 'pending',
    paymentDate: bill?.paymentDate || ''
  });

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const totalTax = formData.items.reduce((sum, item) => sum + (item.tax || 0), 0);
    const total = subtotal + totalTax - formData.discount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax: totalTax,
      total
    }));
  }, [formData.items, formData.discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const billData = {
      number: formData.number,
      date: formData.date,
      dueDate: formData.dueDate,
      supplierId: formData.supplierId,
      items: formData.items,
      subtotal: formData.subtotal,
      tax: formData.tax,
      discount: formData.discount,
      total: formData.total,
      status: formData.status as 'pending' | 'paid' | 'overdue' | 'cancelled',
      paymentDate: formData.paymentDate || undefined
    };

    if (bill) {
      updateBill(bill.id, billData);
    } else {
      addBill(billData);
    }

    onClose();
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice;
      newItems[index].total = quantity * unitPrice;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          tax: 0,
          total: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
            Número
          </label>
          <input
            type="text"
            id="number"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.number}
            onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor
          </label>
          <select
            id="supplierId"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.supplierId}
            onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
          >
            <option value="">Seleccionar proveedor</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
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
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Vencimiento
          </label>
          <input
            type="date"
            id="dueDate"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="status"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'paid' | 'overdue' | 'cancelled' }))}
          >
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="overdue">Vencido</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {formData.status === 'paid' && (
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Pago
            </label>
            <input
              type="date"
              id="paymentDate"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.paymentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ítems</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impuesto</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      required
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      required
                      min="1"
                      className="block w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="block w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="block w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={item.tax}
                      onChange={(e) => updateItem(index, 'tax', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm font-medium">${item.total.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeItem(index)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2">
          <Button
            type="button"
            variant="light"
            size="sm"
            onClick={addItem}
          >
            Agregar Ítem
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Subtotal:</span>
            <span className="text-sm font-medium">${formData.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Impuesto:</span>
            <span className="text-sm font-medium">${formData.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Descuento:</span>
            <div className="flex items-center">
              <span className="text-sm mr-2">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="block w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total:</span>
            <span className="text-sm font-medium">${formData.total.toLocaleString()}</span>
          </div>
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
          {bill ? 'Guardar Cambios' : 'Crear Gasto'}
        </Button>
      </div>
    </form>
  );
};

export default BillForm;