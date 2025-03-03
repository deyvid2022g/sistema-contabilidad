import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  FileText, 
  Users, 
  ShoppingCart, 
  BarChart4, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Wallet,
  Tags,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Chat from '../Chat/Chat';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user } = useAuth();
  const { } = useChat();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({    
    transactions: true,
    contacts: false,
    reports: false
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';
  const isAccountant = user?.role === 'accountant';
  const canAccessChat = isAdmin || isAccountant;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Chat Component */}
      {canAccessChat && (
        <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Sistema Contable</h1>
          <button 
            className="p-1 rounded-md text-gray-400 hover:text-white lg:hidden"
            onClick={closeMobileMenu}
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          <nav className="mt-4 px-2">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
              }
              onClick={closeMobileMenu}
            >
              <LayoutDashboard size={18} className="mr-3" />
              <span>Dashboard</span>
            </NavLink>

            {/* Only non-viewers can see these sections */}
            {!isViewer && (
              <>
                {/* Transactions Section */}
                <div className="mt-2">
                  <button 
                    className="flex items-center justify-between w-full px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
                    onClick={() => toggleMenu('transactions')}
                  >
                    <div className="flex items-center">
                      <Receipt size={18} className="mr-3" />
                      <span>Transacciones</span>
                    </div>
                    {openMenus.transactions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {openMenus.transactions && (
                    <div className="pl-10 mt-1 space-y-1">
                      <NavLink 
                        to="/transactions" 
                        className={({ isActive }) => 
                          `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                        onClick={closeMobileMenu}
                      >
                        Todas las Transacciones
                      </NavLink>
                      <NavLink 
                        to="/transactions/income" 
                        className={({ isActive }) => 
                          `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                        onClick={closeMobileMenu}
                      >
                        Ingresos
                      </NavLink>
                      <NavLink 
                        to="/transactions/expenses" 
                        className={({ isActive }) => 
                          `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                        onClick={closeMobileMenu}
                      >
                        Gastos
                      </NavLink>
                    </div>
                  )}
                </div>

                <NavLink 
                  to="/accounts" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 mt-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                  }
                  onClick={closeMobileMenu}
                >
                  <CreditCard size={18} className="mr-3" />
                  <span>Cuentas</span>
                </NavLink>

                <NavLink 
                  to="/invoices" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 mt-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                  }
                  onClick={closeMobileMenu}
                >
                  <FileText size={18} className="mr-3" />
                  <span>Facturas</span>
                </NavLink>

                <NavLink 
                  to="/bills" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 mt-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                  }
                  onClick={closeMobileMenu}
                >
                  <ShoppingCart size={18} className="mr-3" />
                  <span>Gastos y Facturas</span>
                </NavLink>

                {/* Contacts Section */}
                <div className="mt-2">
                  <button 
                    className="flex items-center justify-between w-full px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
                    onClick={() => toggleMenu('contacts')}
                  >
                    <div className="flex items-center">
                      <Users size={18} className="mr-3" />
                      <span>Contactos</span>
                    </div>
                    {openMenus.contacts ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {openMenus.contacts && (
                    <div className="pl-10 mt-1 space-y-1">
                      <NavLink 
                        to="/clients" 
                        className={({ isActive }) => 
                          `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                        onClick={closeMobileMenu}
                      >
                        Clientes
                      </NavLink>
                      <NavLink 
                        to="/suppliers" 
                        className={({ isActive }) => 
                          `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                        onClick={closeMobileMenu}
                      >
                        Proveedores
                      </NavLink>
                    </div>
                  )}
                </div>

                <NavLink 
                  to="/categories" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 mt-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Tags size={18} className="mr-3" />
                  <span>Categorías</span>
                </NavLink>

                <NavLink 
                  to="/budgets" 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 mt-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Wallet size={18} className="mr-3" />
                  <span>Presupuestos</span>
                </NavLink>
              </>
            )}

            {/* Reports Section - Always visible */}
            <div className="mt-2">
              <button 
                className="flex items-center justify-between w-full px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
                onClick={() => toggleMenu('reports')}
              >
                <div className="flex items-center">
                  <BarChart4 size={18} className="mr-3" />
                  <span>Reportes</span>
                </div>
                {openMenus.reports ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {openMenus.reports && (
                <div className="pl-10 mt-1 space-y-1">
                  <NavLink 
                    to="/reports/income-expense" 
                    className={({ isActive }) => 
                      `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                    }
                    onClick={closeMobileMenu}
                  >
                    Ingresos y Gastos
                  </NavLink>
                  <NavLink 
                    to="/reports/balance-general" 
                    className={({ isActive }) => 
                      `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                    }
                    onClick={closeMobileMenu}
                  >
                    Balance General
                  </NavLink>
                  <NavLink 
                    to="/reports/flujo-caja" 
                    className={({ isActive }) => 
                      `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                    }
                    onClick={closeMobileMenu}
                  >
                    Flujo de Efectivo
                  </NavLink>
                  <NavLink 
                    to="/reports/impuestos" 
                    className={({ isActive }) => 
                      `block px-4 py-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                    }
                    onClick={closeMobileMenu}
                  >
                    Impuestos
                  </NavLink>
                </div>
              )}
            </div>

            {isAdmin && (
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 mt-2 rounded-md ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`
                }
                onClick={closeMobileMenu}
              >
                <Settings size={18} className="mr-3" />
                <span>Configuración</span>
              </NavLink>
            )}

            {/* Chat Button removed as requested */}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;