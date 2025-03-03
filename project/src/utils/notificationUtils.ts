import { Account, Bill, Invoice, Transaction } from '../types';
import { NotificationContextType } from '../context/NotificationContext';

// Function to check for low account balances
export const checkLowAccountBalances = (accounts: Account[], notificationContext: NotificationContextType, threshold = 500) => {
  const { addNotification } = notificationContext;
  
  accounts.forEach(account => {
    if (account.isActive && account.balance < threshold) {
      addNotification({
        title: 'Saldo bajo en cuenta',
        message: `La cuenta ${account.name} tiene un saldo bajo de ${account.balance} ${account.currency}`,
        type: 'warning',
        link: '/accounts'
      });
    }
  });
};

// Function to check for upcoming bill payments
export const checkUpcomingBills = (bills: Bill[], notificationContext: NotificationContextType) => {
  const { addNotification } = notificationContext;
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);
  
  bills.forEach(bill => {
    if (bill.status === 'pending') {
      const dueDate = new Date(bill.dueDate);
      
      if (dueDate <= sevenDaysFromNow && dueDate >= today) {
        addNotification({
          title: 'Factura por pagar próximamente',
          message: `La factura ${bill.number} vence en ${Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} días`,
          type: 'info',
          link: '/bills'
        });
      } else if (dueDate < today) {
        addNotification({
          title: 'Factura vencida',
          message: `La factura ${bill.number} está vencida desde el ${bill.dueDate}`,
          type: 'error',
          link: '/bills'
        });
      }
    }
  });
};

// Function to check for overdue invoices
export const checkOverdueInvoices = (invoices: Invoice[], notificationContext: NotificationContextType) => {
  const { addNotification } = notificationContext;
  const today = new Date();
  
  invoices.forEach(invoice => {
    if (invoice.status === 'sent') {
      const dueDate = new Date(invoice.dueDate);
      
      if (dueDate < today) {
        addNotification({
          title: 'Factura de cliente vencida',
          message: `La factura ${invoice.number} está vencida desde el ${invoice.dueDate}`,
          type: 'warning',
          link: '/invoices'
        });
      }
    }
  });
};

// Function to notify about large transactions
export const notifyLargeTransactions = (transaction: Transaction, notificationContext: NotificationContextType, threshold = 5000) => {
  const { addNotification } = notificationContext;
  
  if (transaction.amount > threshold) {
    addNotification({
      title: 'Transacción de alto valor',
      message: `Se ha registrado una ${transaction.type === 'income' ? 'entrada' : 'salida'} de ${transaction.amount} (${transaction.description})`,
      type: transaction.type === 'income' ? 'success' : 'info',
      link: `/transactions/${transaction.id}`
    });
  }
};

// Function to notify about new user registrations (for admin only)
export const notifyNewUserRegistration = (userName: string, notificationContext: NotificationContextType) => {
  const { addNotification } = notificationContext;
  
  addNotification({
    title: 'Nuevo usuario registrado',
    message: `El usuario ${userName} ha sido registrado en el sistema`,
    type: 'info',
    link: '/settings'
  });
};

// Function to notify about system updates or maintenance
export const notifySystemUpdate = (message: string, notificationContext: NotificationContextType, scheduledDate?: string) => {
  const { addNotification } = notificationContext;
  
  addNotification({
    title: 'Actualización del sistema',
    message: scheduledDate 
      ? `${message}. Programado para: ${scheduledDate}` 
      : message,
    type: 'info'
  });
};