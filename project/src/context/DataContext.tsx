import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Transaction, 
  Account, 
  Category, 
  Supplier, 
  Client, 
  Invoice, 
  Bill,
  Budget,
  CompanySettings
} from '../types';

// Define a type for our data state structure
interface DataState {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  suppliers: Supplier[];
  clients: Client[];
  invoices: Invoice[];
  bills: Bill[];
  budgets: Budget[];
  companySettings: CompanySettings;
}

interface DataContextType {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  suppliers: Supplier[];
  clients: Client[];
  invoices: Invoice[];
  bills: Bill[];
  budgets: Budget[];
  companySettings: CompanySettings;
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generate mock data
const generateMockData = () => {
  // Categories
  const categories: Category[] = [
    { id: '1', name: 'Ventas', type: 'income', color: '#4CAF50', isActive: true },
    { id: '2', name: 'Servicios', type: 'income', color: '#2196F3', isActive: true },
    { id: '3', name: 'Inversiones', type: 'income', color: '#9C27B0', isActive: true },
    { id: '4', name: 'Salarios', type: 'expense', color: '#F44336', isActive: true },
    { id: '5', name: 'Suministros', type: 'expense', color: '#FF9800', isActive: true },
    { id: '6', name: 'Servicios Públicos', type: 'expense', color: '#795548', isActive: true },
    { id: '7', name: 'Alquiler', type: 'expense', color: '#607D8B', isActive: true },
    { id: '8', name: 'Marketing', type: 'expense', color: '#E91E63', isActive: true }
  ];

  // Accounts
  const accounts: Account[] = [
    { id: '1', name: 'Cuenta Principal', type: 'bank', balance: 15000, currency: 'USD', isActive: true },
    { id: '2', name: 'Caja Chica', type: 'cash', balance: 500, currency: 'USD', isActive: true },
    { id: '3', name: 'Tarjeta de Crédito', type: 'credit', balance: -2500, currency: 'USD', isActive: true },
    { id: '4', name: 'Cuenta de Ahorros', type: 'bank', balance: 8000, currency: 'USD', isActive: true }
  ];

  // Clients
  const clients: Client[] = [
    { id: '1', name: 'Empresa ABC', contactPerson: 'Juan Pérez', email: 'juan@empresaabc.com', phone: '123-456-7890', isActive: true },
    { id: '2', name: 'Corporación XYZ', contactPerson: 'María López', email: 'maria@xyz.com', phone: '987-654-3210', isActive: true },
    { id: '3', name: 'Industrias Globales', contactPerson: 'Carlos Rodríguez', email: 'carlos@industriasglobales.com', phone: '555-123-4567', isActive: true }
  ];

  // Suppliers
  const suppliers: Supplier[] = [
    { id: '1', name: 'Suministros Rápidos', contactPerson: 'Ana Martínez', email: 'ana@suministrosrapidos.com', phone: '111-222-3333', isActive: true },
    { id: '2', name: 'Distribuidora Nacional', contactPerson: 'Pedro Sánchez', email: 'pedro@distribuidoranacional.com', phone: '444-555-6666', isActive: true },
    { id: '3', name: 'Importaciones Internacionales', contactPerson: 'Laura Gómez', email: 'laura@importaciones.com', phone: '777-888-9999', isActive: true }
  ];

  // Transactions
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2025-01-15',
      description: 'Venta de productos',
      amount: 2500,
      type: 'income',
      category: '1',
      paymentMethod: 'Transferencia',
      reference: 'INV-001',
      createdBy: '1',
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      date: '2025-01-20',
      description: 'Pago de salarios',
      amount: 3500,
      type: 'expense',
      category: '4',
      paymentMethod: 'Transferencia',
      createdBy: '1',
      createdAt: '2025-01-20T14:15:00Z'
    },
    {
      id: '3',
      date: '2025-01-25',
      description: 'Servicios de consultoría',
      amount: 1800,
      type: 'income',
      category: '2',
      paymentMethod: 'Cheque',
      reference: 'INV-002',
      createdBy: '1',
      createdAt: '2025-01-25T09:45:00Z'
    },
    {
      id: '4',
      date: '2025-01-28',
      description: 'Compra de suministros',
      amount: 750,
      type: 'expense',
      category: '5',
      paymentMethod: 'Tarjeta de Crédito',
      reference: 'BILL-001',
      createdBy: '1',
      createdAt: '2025-01-28T16:20:00Z'
    },
    {
      id: '5',
      date: '2025-02-05',
      description: 'Pago de alquiler',
      amount: 1200,
      type: 'expense',
      category: '7',
      paymentMethod: 'Transferencia',
      createdBy: '1',
      createdAt: '2025-02-05T11:10:00Z'
    }
  ];

  // Invoices
  const invoices: Invoice[] = [
    {
      id: '1',
      number: 'INV-001',
      date: '2025-01-15',
      dueDate: '2025-02-15',
      clientId: '1',
      items: [
        { id: '1', description: 'Producto A', quantity: 5, unitPrice: 300, tax: 15, total: 1500 },
        { id: '2', description: 'Servicio B', quantity: 2, unitPrice: 500, tax: 0, total: 1000 }
      ],
      subtotal: 2500,
      tax: 15,
      discount: 0,
      total: 2515,
      status: 'paid',
      paymentDate: '2025-01-30',
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      number: 'INV-002',
      date: '2025-01-25',
      dueDate: '2025-02-25',
      clientId: '2',
      items: [
        { id: '1', description: 'Consultoría', quantity: 6, unitPrice: 300, tax: 0, total: 1800 }
      ],
      subtotal: 1800,
      tax: 0,
      discount: 0,
      total: 1800,
      status: 'paid',
      paymentDate: '2025-02-10',
      createdAt: '2025-01-25T09:45:00Z'
    },
    {
      id: '3',
      number: 'INV-003',
      date: '2025-02-10',
      dueDate: '2025-03-10',
      clientId: '3',
      items: [
        { id: '1', description: 'Producto C', quantity: 10, unitPrice: 200, tax: 10, total: 2000 },
        { id: '2', description: 'Servicio D', quantity: 1, unitPrice: 1500, tax: 0, total: 1500 }
      ],
      subtotal: 3500,
      tax: 10,
      discount: 100,
      total: 3410,
      status: 'sent',
      createdAt: '2025-02-10T13:20:00Z'
    }
  ];

  // Bills
  const bills: Bill[] = [
    {
      id: '1',
      number: 'BILL-001',
      date: '2025-01-28',
      dueDate: '2025-02-28',
      supplierId: '1',
      items: [
        { id: '1', description: 'Suministros de oficina', quantity: 1, unitPrice: 750, tax: 0, total: 750 }
      ],
      subtotal: 750,
      tax: 0,
      discount: 0,
      total: 750,
      status: 'paid',
      paymentDate: '2025-02-15',
      createdAt: '2025-01-28T16:20:00Z'
    },
    {
      id: '2',
      number: 'BILL-002',
      date: '2025-02-05',
      dueDate: '2025-03-05',
      supplierId: '2',
      items: [
        { id: '1', description: 'Materiales', quantity: 20, unitPrice: 50, tax: 5, total: 1000 },
        { id: '2', description: 'Transporte', quantity: 1, unitPrice: 200, tax: 0, total: 200 }
      ],
      subtotal: 1200,
      tax: 5,
      discount: 0,
      total: 1205,
      status: 'pending',
      createdAt: '2025-02-05T14:45:00Z'
    }
  ];

  // Budgets
  const budgets: Budget[] = [
    {
      id: '1',
      name: 'Presupuesto Q1 2025',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      categories: [
        { categoryId: '1', plannedAmount: 10000, actualAmount: 4300 },
        { categoryId: '2', plannedAmount: 5000, actualAmount: 1800 },
        { categoryId: '4', plannedAmount: 12000, actualAmount: 3500 },
        { categoryId: '5', plannedAmount: 3000, actualAmount: 750 },
        { categoryId: '7', plannedAmount: 3600, actualAmount: 1200 }
      ],
      createdAt: '2024-12-15T09:00:00Z'
    }
  ];

  // Company Settings
  const companySettings: CompanySettings = {
    name: 'Mi Empresa S.A.',
    taxId: '123456789',
    address: 'Calle Principal 123, Ciudad',
    phone: '555-123-4567',
    email: 'contacto@miempresa.com',
    website: 'www.miempresa.com',
    fiscalYear: {
      startMonth: 1,
      startDay: 1
    },
    currency: 'USD'
  };

  return {
    transactions,
    accounts,
    categories,
    suppliers,
    clients,
    invoices,
    bills,
    budgets,
    companySettings
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => {
    const storedData = localStorage.getItem('accountingData');
    return storedData ? JSON.parse(storedData) : generateMockData();
  });

  useEffect(() => {
    localStorage.setItem('accountingData', JSON.stringify(data));
  }, [data]);

  // Transactions
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction]
    }));
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      transactions: prev.transactions.map((t: Transaction) => 
        t.id === id ? { ...t, ...transaction, updatedAt: new Date().toISOString() } : t
      )
    }));
  };

  const deleteTransaction = (id: string) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      transactions: prev.transactions.filter((t: Transaction) => t.id !== id)
    }));
  };

  // Accounts
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = {
      ...account,
      id: uuidv4()
    };
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      accounts: [...prev.accounts, newAccount]
    }));
  };

  const updateAccount = (id: string, account: Partial<Account>) => {
    setData((prev: DataState) => ({
      ...prev,
      accounts: prev.accounts.map((a: Account) => 
        a.id === id ? { ...a, ...account } : a
      )
    }));
  };

  const deleteAccount = (id: string) => {
    setData((prev: DataState) => ({
      ...prev,
      accounts: prev.accounts.filter((a: Account) => a.id !== id)
    }));
  };

  // Categories
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: uuidv4()
    };
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setData((prev: DataState) => ({
      ...prev,
      categories: prev.categories.map((c: Category) => 
        c.id === id ? { ...c, ...category } : c
      )
    }));
  };

  const deleteCategory = (id: string) => {
    setData((prev: DataState) => ({
      ...prev,
      categories: prev.categories.filter((c: Category) => c.id !== id)
    }));
  };

  // Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = {
      ...supplier,
      id: uuidv4()
    };
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      suppliers: [...prev.suppliers, newSupplier]
    }));
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      suppliers: prev.suppliers.map((s: Supplier) => 
        s.id === id ? { ...s, ...supplier } : s
      )
    }));
  };

  const deleteSupplier = (id: string) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      suppliers: prev.suppliers.filter((s: Supplier) => s.id !== id)
    }));
  };

  // Clients
  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = {
      ...client,
      id: uuidv4()
    };
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      clients: [...prev.clients, newClient]
    }));
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      clients: prev.clients.map((c: Client) => 
        c.id === id ? { ...c, ...client } : c
      )
    }));
  };

  const deleteClient = (id: string) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      clients: prev.clients.filter((c: Client) => c.id !== id)
    }));
  };

  // Invoices
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice = {
      ...invoice,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      invoices: [...prev.invoices, newInvoice]
    }));
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      invoices: prev.invoices.map((i: Invoice) => 
        i.id === id ? { ...i, ...invoice, updatedAt: new Date().toISOString() } : i
      )
    }));
  };

  const deleteInvoice = (id: string) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      invoices: prev.invoices.filter((i: Invoice) => i.id !== id)
    }));
  };

  // Bills
  const addBill = (bill: Omit<Bill, 'id' | 'createdAt'>) => {
    const newBill = {
      ...bill,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      bills: [...prev.bills, newBill]
    }));
  };

  const updateBill = (id: string, bill: Partial<Bill>) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      bills: prev.bills.map((b: Bill) => 
        b.id === id ? { ...b, ...bill, updatedAt: new Date().toISOString() } : b
      )
    }));
  };

  const deleteBill = (id: string) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      bills: prev.bills.filter((b: Bill) => b.id !== id)
    }));
  };

  // Budgets
  const addBudget = (budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget = {
      ...budget,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      budgets: [...prev.budgets, newBudget]
    }));
  };

  const updateBudget = (id: string, budget: Partial<Budget>) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      budgets: prev.budgets.map((b: Budget) => 
        b.id === id ? { ...b, ...budget, updatedAt: new Date().toISOString() } : b
      )
    }));
  };

  const deleteBudget = (id: string) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      budgets: prev.budgets.filter((b: Budget) => b.id !== id)
    }));
  };

  // Company Settings
  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setData((prev: {
      transactions: Transaction[];
      accounts: Account[];
      categories: Category[];
      suppliers: Supplier[];
      clients: Client[];
      invoices: Invoice[];
      bills: Bill[];
      budgets: Budget[];
      companySettings: CompanySettings;
    }) => ({
      ...prev,
      companySettings: { ...prev.companySettings, ...settings }
    }));
  };

  return (
    <DataContext.Provider value={{
      ...data,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addAccount,
      updateAccount,
      deleteAccount,
      addCategory,
      updateCategory,
      deleteCategory,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addClient,
      updateClient,
      deleteClient,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addBill,
      updateBill,
      deleteBill,
      addBudget,
      updateBudget,
      deleteBudget,
      updateCompanySettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};