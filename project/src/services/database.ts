import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Bill {
  id: string;
  clientId: string;
  billNumber: string;
  issueDate: Date;
  dueDate?: Date;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface BillItem {
  id: string;
  billId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  reference?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  description: string;
  categoryId: string;
  reference?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit';
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'void';
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  parentId?: string;
}

export const DatabaseService = {
  // Bills
  async createBill(bill: Omit<Bill, 'id'>): Promise<string> {
    const response = await axios.post(`${API_URL}/bills`, bill);
    return response.data.id;
  },

  async getBills(): Promise<Bill[]> {
    const response = await axios.get(`${API_URL}/bills`);
    return response.data;
  },

  async updateBill(id: string, bill: Partial<Bill>): Promise<void> {
    await axios.put(`${API_URL}/bills/${id}`, bill);
  },

  async deleteBill(id: string): Promise<void> {
    await axios.delete(`${API_URL}/bills/${id}`);
  },

  // Bill Items
  async createBillItem(item: Omit<BillItem, 'id'>): Promise<string> {
    const response = await axios.post(`${API_URL}/bill-items`, item);
    return response.data.id;
  },

  async getBillItems(billId: string): Promise<BillItem[]> {
    const response = await axios.get(`${API_URL}/bills/${billId}/items`);
    return response.data;
  },

  // Clients
  async createClient(client: Omit<Client, 'id'>): Promise<string> {
    const response = await axios.post(`${API_URL}/clients`, client);
    return response.data.id;
  },

  async getClients(): Promise<Client[]> {
    const response = await axios.get(`${API_URL}/clients`);
    return response.data;
  },

  async updateClient(id: string, client: Partial<Client>): Promise<void> {
    await axios.put(`${API_URL}/clients/${id}`, client);
  },

  async deleteClient(id: string): Promise<void> {
    await axios.delete(`${API_URL}/clients/${id}`);
  },

  // Payments
  async createPayment(payment: Omit<Payment, 'id'>): Promise<string> {
    const response = await axios.post(`${API_URL}/payments`, payment);
    return response.data.id;
  },

  async getPayments(billId: string): Promise<Payment[]> {
    const response = await axios.get(`${API_URL}/bills/${billId}/payments`);
    return response.data;
  },

  // Transactions
  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    const response = await axios.post(`${API_URL}/transactions`, transaction);
    return response.data.id;
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await axios.get(`${API_URL}/transactions`);
    return response.data;
  },

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
    await axios.patch(`${API_URL}/transactions/${id}`, transaction);
  },

  // Accounts
  async getAccounts(): Promise<Account[]> {
    const response = await axios.get(`${API_URL}/accounts`);
    return response.data;
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const response = await axios.get(`${API_URL}/invoices`);
    return response.data;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  }
};