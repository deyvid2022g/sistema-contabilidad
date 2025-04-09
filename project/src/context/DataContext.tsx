import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import type { Bill, BillItem, Client, Payment, Transaction, Account, Invoice, Category } from '../services/database';

interface DataContextType {
  // Bills
  bills: Bill[];
  createBill: (bill: Omit<Bill, 'id'>) => Promise<string>;
  updateBill: (id: string, bill: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  getBillItems: (billId: string) => Promise<BillItem[]>;
  createBillItem: (item: Omit<BillItem, 'id'>) => Promise<string>;

  // Clients
  clients: Client[];
  createClient: (client: Omit<Client, 'id'>) => Promise<string>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Payments
  getPayments: (billId: string) => Promise<Payment[]>;
  createPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;

  // Transactions
  transactions: Transaction[];

  // Accounts
  accounts: Account[];

  // Invoices
  invoices: Invoice[];

  // Categories
  categories: Category[];

  // Data loading state
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [
          billsData,
          clientsData,
          transactionsData,
          accountsData,
          invoicesData,
          categoriesData
        ] = await Promise.all([
          ApiService.getBills(),
          ApiService.getClients(),
          ApiService.getTransactions(),
          ApiService.getAccounts(),
          ApiService.getInvoices(),
          ApiService.getCategories()
        ]);

        setBills(billsData);
        setClients(clientsData);
        setTransactions(transactionsData);
        setAccounts(accountsData);
        setInvoices(invoicesData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const value: DataContextType = {
    bills,
    createBill: ApiService.createBill,
    updateBill: ApiService.updateBill,
    deleteBill: ApiService.deleteBill,
    getBillItems: ApiService.getBillItems,
    createBillItem: ApiService.createBillItem,

    clients,
    createClient: ApiService.createClient,
    updateClient: ApiService.updateClient,
    deleteClient: ApiService.deleteClient,

    getPayments: ApiService.getPayments,
    createPayment: ApiService.createPayment,

    transactions,
    accounts,
    invoices,
    categories,

    isLoading,
    error
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};