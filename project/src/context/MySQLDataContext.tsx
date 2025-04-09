import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';
import type { Bill, BillItem, Client, Payment, Transaction, Account, Invoice, Category } from '../services/database';

interface DataContextType {
  bills: Bill[];
  clients: Client[];
  transactions: Transaction[];
  accounts: Account[];
  invoices: Invoice[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addBill: (bill: Omit<Bill, 'id'>) => Promise<string>;
  updateBill: (id: string, bill: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  addBillItem: (item: Omit<BillItem, 'id'>) => Promise<string>;
  getBillItems: (billId: string) => Promise<BillItem[]>;
  addClient: (client: Omit<Client, 'id'>) => Promise<string>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  getPayments: (billId: string) => Promise<Payment[]>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<string>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [fetchedBills, fetchedClients, fetchedTransactions, fetchedAccounts, fetchedInvoices, fetchedCategories] = await Promise.all([
        DatabaseService.getBills(),
        DatabaseService.getClients(),
        DatabaseService.getTransactions(),
        DatabaseService.getAccounts(),
        DatabaseService.getInvoices(),
        DatabaseService.getCategories()
      ]);
      setBills(fetchedBills);
      setClients(fetchedClients);
      setTransactions(fetchedTransactions);
      setAccounts(fetchedAccounts);
      setInvoices(fetchedInvoices);
      setCategories(fetchedCategories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addBill = async (bill: Omit<Bill, 'id'>) => {
    try {
      const id = await DatabaseService.createBill(bill);
      await refreshData();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la factura');
      throw err;
    }
  };

  const updateBill = async (id: string, bill: Partial<Bill>) => {
    try {
      await DatabaseService.updateBill(id, bill);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la factura');
      throw err;
    }
  };

  const deleteBill = async (id: string) => {
    try {
      await DatabaseService.deleteBill(id);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la factura');
      throw err;
    }
  };

  const addBillItem = async (item: Omit<BillItem, 'id'>) => {
    try {
      const id = await DatabaseService.createBillItem(item);
      await refreshData();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir el ítem');
      throw err;
    }
  };

  const getBillItems = async (billId: string) => {
    try {
      return await DatabaseService.getBillItems(billId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener los ítems');
      throw err;
    }
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    try {
      const id = await DatabaseService.createClient(client);
      await refreshData();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el cliente');
      throw err;
    }
  };

  const updateClient = async (id: string, client: Partial<Client>) => {
    try {
      await DatabaseService.updateClient(id, client);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el cliente');
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await DatabaseService.deleteClient(id);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el cliente');
      throw err;
    }
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const id = await DatabaseService.createPayment(payment);
      await refreshData();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el pago');
      throw err;
    }
  };

  const getPayments = async (billId: string) => {
    try {
      return await DatabaseService.getPayments(billId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener los pagos');
      throw err;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const id = await DatabaseService.createTransaction(transaction);
      await refreshData();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la transacción');
      throw err;
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      await DatabaseService.updateTransaction(id, transaction);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la transacción');
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        bills,
        clients,
        transactions,
        accounts,
        invoices,
        categories,
        loading,
        error,
        refreshData,
        addBill,
        updateBill,
        deleteBill,
        addBillItem,
        getBillItems,
        addClient,
        updateClient,
        deleteClient,
        addPayment,
        getPayments,
        addTransaction,
        updateTransaction
      }}
    >
      {children}
    </DataContext.Provider>
  );
};