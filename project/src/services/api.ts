import axios from 'axios';
import type { Bill, BillItem, Client, Payment, Transaction, Account, Invoice, Category } from './database';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ApiService = {
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
  async getTransactions(): Promise<Transaction[]> {
    const response = await axios.get(`${API_URL}/transactions`);
    return response.data;
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