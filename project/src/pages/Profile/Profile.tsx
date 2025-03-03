import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'viewer') return;

    // Reset messages
    setError(null);
    setSuccess(null);

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    // Here you would typically make an API call to change the password
    // For now, we'll just show a success message
    setSuccess('Contraseña actualizada exitosamente');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Perfil de Usuario</h1>
      
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          {user?.role !== 'viewer' && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none">
              Cambiar foto
            </button>
          )}
        </div>
        
        <div className="w-full md:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                {user?.name || 'N/A'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                {user?.email || 'N/A'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                {user?.role === 'admin' ? 'Administrador' : 
                 user?.role === 'accountant' ? 'Contador' : 'Visualizador'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de registro</label>
              <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {user?.role !== 'viewer' && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Cambiar contraseña</h2>
              {error && (
                <div className="mb-4 p-4 rounded-md bg-red-50 text-red-800">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
              {success && (
                <div className="mb-4 p-4 rounded-md bg-green-50 text-green-800">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>{success}</p>
                  </div>
                </div>
              )}
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                  <input 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  Actualizar contraseña
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;