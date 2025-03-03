import React from 'react';
import { ChatProvider } from './context/ChatContext';
import { createBrowserRouter, RouterProvider, Navigate, useRouteError } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ViewerRouteGuard from './components/RouteProtection/ViewerRouteGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TransactionList from './pages/Transactions/TransactionList';
import InvoiceList from './pages/Invoices/InvoiceList';
import BillsList from './pages/Bills/BillsList';
import AccountList from './pages/Accounts/AccountList';
import ClientList from './pages/Clients/ClientList';
import SupplierList from './pages/Suppliers/SupplierList';
import CategoryList from './pages/Categories/CategoryList';
import BudgetList from './pages/Budget/BudgetList';
import IncomeExpenseReport from './pages/Reports/IncomeExpenseReport';
import BalanceGeneralReport from './pages/Reports/BalanceGeneralReport';
import FlujoCajaReport from './pages/Reports/FlujoCajaReport';
import ImpuestosReport from './pages/Reports/ImpuestosReport';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

// Custom error boundary component
const ErrorBoundary: React.FC = () => {
  const error = useRouteError();
  console.error(error);
  
  let errorMessage = 'Lo sentimos, ha ocurrido un error inesperado.';
  
  // Improved error handling to safely extract error message
  try {
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('statusText' in error) {
        errorMessage = String(error.statusText);
      } else if ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
        errorMessage = String(error.data.message);
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
  } catch (e) {
    console.error('Error while extracting error message:', e);
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-700 mb-4">{errorMessage}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: (
        <AuthProvider>
          <DataProvider>
            <NotificationProvider>
              <Login />
            </NotificationProvider>
          </DataProvider>
        </AuthProvider>
      ),
      errorElement: <ErrorBoundary />
    },
    {
      element: (
        <AuthProvider>
          <DataProvider>
            <NotificationProvider>
              <ChatProvider>
                <ProtectedRoute />
              </ChatProvider>
            </NotificationProvider>
          </DataProvider>
        </AuthProvider>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '/',
          element: <Layout />,
          errorElement: <ErrorBoundary />,
          children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'profile', element: <Profile /> },
            
            /* Routes that need viewer protection */
            { 
              path: 'transactions', 
              element: <ViewerRouteGuard allowedPaths={['/dashboard', '/profile', '/reports/*']} />,
              children: [
                { index: true, element: <TransactionList /> },
                { path: 'income', element: <TransactionList type="income" /> },
                { path: 'expenses', element: <TransactionList type="expense" /> }
              ]
            },
            { 
              path: 'invoices', 
              element: <ViewerRouteGuard allowedPaths={['/dashboard', '/profile', '/reports/*']} />,
              children: [{ index: true, element: <InvoiceList /> }]
            },
            { 
              path: 'bills', 
              element: <ViewerRouteGuard allowedPaths={['/dashboard', '/profile', '/reports/*']} />,
              children: [{ index: true, element: <BillsList /> }]
            },
            { 
              path: 'accounts', 
              element: <ViewerRouteGuard allowedPaths={['/dashboard', '/profile', '/reports/*']} />,
              children: [{ index: true, element: <AccountList /> }]
            },
            { 
              path: 'clients', 
              element: <ViewerRouteGuard allowedPaths={['/dashboard', '/profile', '/reports/*']} />,
              children: [{ index: true, element: <ClientList /> }]
            },
            { 
              path: 'suppliers', 
              element: <ViewerRouteGuard allowedPaths={['/dashboard', '/profile', '/reports/*']} />,
              children: [{ index: true, element: <SupplierList /> }]
            },
            { 
              path: 'categories', 
              element: <ViewerRouteGuard allowedPaths={['/dashboard', '/profile', '/reports/*']} />,
              children: [{ index: true, element: <CategoryList /> }]
            },
            { 
              path: 'budgets', 
              element: <ViewerRouteGuard allowedPaths={['/dashboard', '/profile', '/reports/*']} />,
              children: [{ index: true, element: <BudgetList /> }]
            },
            
            { path: 'reports/income-expense', element: <IncomeExpenseReport /> },
            { path: 'reports/balance-general', element: <BalanceGeneralReport /> },
            { path: 'reports/flujo-caja', element: <FlujoCajaReport /> },
            { path: 'reports/impuestos', element: <ImpuestosReport /> },
            { path: 'settings', element: <Settings /> }
          ]
        }
      ]
    }
  ]
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
}

export default App;