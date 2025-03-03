export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'viewer';
  avatar?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  ivaAmount?: number; // Colombian IVA amount
  ivaRate?: number; // Colombian IVA rate (usually 19%)
  taxCategory?: 'standard' | 'exempt' | 'reduced'; // Colombian tax category
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit' | 'investment';
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  clientId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface Bill {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  supplierId: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  amount?: number;
  actualAmount?: number;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt?: string;
}

export interface BudgetCategory {
  categoryId: string;
  plannedAmount: number;
  actualAmount: number;
}

export interface CompanySettings {
  name: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  fiscalYear: {
    startMonth: number;
    startDay: number;
  };
  currency: string;
}

export interface TaxSettings {
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
}