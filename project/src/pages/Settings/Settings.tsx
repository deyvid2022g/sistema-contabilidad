import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { CompanySettings, User } from '../../types';
import { Save, UserPlus, Lock, Database, AlertCircle, X } from 'lucide-react';
import { notifyNewUserRegistration } from '../../utils/notificationUtils';
import { useNotifications } from '../../context/NotificationContext';

const Settings: React.FC = () => {
  const { user, registerUser, allUsers } = useAuth();
  const notificationContext = useNotifications();
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'Mi Empresa',
    taxId: '',
    address: '',
    phone: '',
    fiscalYear: {
      startMonth: 1,
      startDay: 1
    },
    currency: 'COP'
  });
  
  // Initialize users state with allUsers from AuthContext
  const [users, setUsers] = useState<User[]>(allUsers.map(({ password, ...user }) => user));
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<Partial<User> & {password?: string, confirmPassword?: string}>({  
    name: '',
    email: '',
    role: 'accountant',
    password: '',
    confirmPassword: ''
  });
  
  // Alert state
  const [alert, setAlert] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    sessionTimeout: 30
  });
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: false,
    frequency: 'daily',
    time: '00:00',
    retentionDays: 7
  });
  
  const handleCompanySettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanySettings({
      ...companySettings,
      [e.target.name]: e.target.value
    });
  };

  const handleSecuritySettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSecuritySettings({
      ...securitySettings,
      [e.target.name]: value
    });
  };

  const handleBackupSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setBackupSchedule({
      ...backupSchedule,
      [e.target.name]: value
    });
  };

  // Reset user form
  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'accountant',
      password: '',
      confirmPassword: ''
    });
    setEditingUserId(null);
  };

  // Handle user form change
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value
    });
  };

  // Open user form for adding
  const handleAddUser = () => {
    resetUserForm();
    setShowUserForm(true);
  };

  // Open user form for editing
  const handleEditUser = (user: User) => {
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEditingUserId(user.id);
    setShowUserForm(true);
  };

  // Save user (add or update)
  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) {
      setAlert({ message: 'Por favor complete todos los campos requeridos', type: 'error' });
      return;
    }

    if (!editingUserId && (!userForm.password || userForm.password !== userForm.confirmPassword)) {
      setAlert({ message: 'Las contraseñas no coinciden o están vacías', type: 'error' });
      return;
    }

    if (editingUserId) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUserId ? 
          { ...user, name: userForm.name!, email: userForm.email!, role: userForm.role as 'admin' | 'accountant' | 'viewer' } : 
          user
      ));
      setAlert({ message: 'Usuario actualizado exitosamente', type: 'success' });
    } else {
      // Add new user
      const newUser = {
        id: Date.now().toString(),
        name: userForm.name!,
        email: userForm.email!,
        password: userForm.password!, // Include password for authentication
        role: userForm.role as 'admin' | 'accountant' | 'viewer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      };
      
      // Register the user in the authentication system
      registerUser(newUser);
      
      // Add user to local state (without password)
      const { password, ...userWithoutPassword } = newUser;
      setUsers([...users, userWithoutPassword]);
      
      // Send notification about new user registration
      notifyNewUserRegistration(newUser.name, notificationContext);
      
      setAlert({ message: 'Usuario agregado exitosamente', type: 'success' });
    }

    setShowUserForm(false);
    resetUserForm();
  };
  
  // Delete user
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
      setAlert({ message: 'Usuario eliminado exitosamente', type: 'success' });
    }
  };

  // Export database
  const handleExportDatabase = () => {
    // Create a JSON object with all the data
    const exportData = {
      companySettings,
      users,
      securitySettings,
      backupSchedule
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const a = document.createElement('a');
    a.href = url;
    a.download = `contabilidad_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setAlert({ message: 'Base de datos exportada exitosamente', type: 'success' });
  };

  // Import database
  const handleImportDatabase = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          // Update state with imported data
          if (data.companySettings) setCompanySettings(data.companySettings);
          if (data.users) setUsers(data.users);
          if (data.securitySettings) setSecuritySettings(data.securitySettings);
          if (data.backupSchedule) setBackupSchedule(data.backupSchedule);
          
          setAlert({ message: 'Base de datos importada exitosamente', type: 'success' });
        } catch (error) {
          setAlert({ message: 'Error al importar el archivo', type: 'error' });
          console.error('Error parsing JSON:', error);
        }
      };
      
      reader.readAsText(file);
    };
    
    // Trigger file selection dialog
    fileInput.click();
  };

  // Save all settings
  const handleSaveSettings = () => {
    // In a real app, this would make an API call to save all settings
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    localStorage.setItem('backupSchedule', JSON.stringify(backupSchedule));
    
    setAlert({ message: 'Configuración guardada exitosamente', type: 'success' });
  };
  
  // Clear alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Configuración del Sistema</h1>
      
      {/* Alert message */}
      {alert && (
        <div className={`mb-4 p-4 rounded-md ${alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{alert.message}</p>
          </div>
        </div>
      )}
      
      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingUserId ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
              <button 
                onClick={() => setShowUserForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {!editingUserId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      value={userForm.password}
                      onChange={handleUserFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!editingUserId}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={userForm.confirmPassword}
                      onChange={handleUserFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!editingUserId}
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrador</option>
                  <option value="accountant">Contador</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* General Configuration */}
        <div>
          <div className="flex items-center mb-3">
            <h2 className="text-lg font-semibold">Configuración General</h2>
            <Save className="ml-2 text-gray-400" size={18} />
          </div>
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                <input
                  type="text"
                  name="name"
                  value={companySettings.name}
                  onChange={handleCompanySettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIT/RUT</label>
                <input
                  type="text"
                  name="taxId"
                  value={companySettings.taxId}
                  onChange={handleCompanySettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={companySettings.address}
                  onChange={handleCompanySettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  value={companySettings.phone}
                  onChange={handleCompanySettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div>
          <div className="flex items-center mb-3">
            <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
            <UserPlus className="ml-2 text-gray-400" size={18} />
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? 'Administrador' : 
                         user.role === 'accountant' ? 'Contador' : 'Visualizador'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={handleAddUser}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Agregar Usuario
            </button>
          </div>
        </div>

        {/* Security Configuration */}
        <div>
          <div className="flex items-center mb-3">
            <h2 className="text-lg font-semibold">Configuración de Seguridad</h2>
            <Lock className="ml-2 text-gray-400" size={18} />
          </div>
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitud mínima de contraseña</label>
                <input
                  type="number"
                  name="passwordMinLength"
                  value={securitySettings.passwordMinLength}
                  onChange={handleSecuritySettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de sesión (minutos)</label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecuritySettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requireSpecialChar"
                  checked={securitySettings.requireSpecialChar}
                  onChange={handleSecuritySettingsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Requerir caracteres especiales en contraseñas</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requireNumber"
                  checked={securitySettings.requireNumber}
                  onChange={handleSecuritySettingsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Requerir números en contraseñas</label>
              </div>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div>
          <div className="flex items-center mb-3">
            <h2 className="text-lg font-semibold">Respaldo y Restauración</h2>
            <Database className="ml-2 text-gray-400" size={18} />
          </div>
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="enabled"
                checked={backupSchedule.enabled}
                onChange={handleBackupSettingsChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Habilitar respaldos automáticos</label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                <select
                  name="frequency"
                  value={backupSchedule.frequency}
                  onChange={handleBackupSettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <input
                  type="time"
                  name="time"
                  value={backupSchedule.time}
                  onChange={handleBackupSettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días de retención</label>
                <input
                  type="number"
                  name="retentionDays"
                  value={backupSchedule.retentionDays}
                  onChange={handleBackupSettingsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={handleExportDatabase}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Exportar Base de Datos
              </button>
              <button 
                onClick={handleImportDatabase}
                className="ml-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none"
              >
                Importar Base de Datos
              </button>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button 
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none flex items-center"
          >
            <Save className="mr-2" size={18} />
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;