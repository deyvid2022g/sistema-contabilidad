import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
// Temporarily disable Firebase until proper credentials are set up
// import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (newUser: any) => void;
  allUsers: any[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Admin Usuario',
    email: 'admin@ejemplo.com',
    password: 'admin123',
    role: 'admin' as const,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '2',
    name: 'Contador Usuario',
    email: 'contador@ejemplo.com',
    password: 'contador123',
    role: 'accountant' as const,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add state to track all users including newly created ones
  const [allUsers, setAllUsers] = useState<Array<typeof mockUsers[0]>>(mockUsers);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load any saved users from localStorage, or use mockUsers as default
    const storedUsers = localStorage.getItem('allUsers');
    if (storedUsers) {
      setAllUsers(JSON.parse(storedUsers));
    } else {
      // If no users in localStorage, initialize with mockUsers and save them
      localStorage.setItem('allUsers', JSON.stringify(mockUsers));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the latest users from localStorage to ensure we have the most recent data
    const storedUsers = localStorage.getItem('allUsers');
    const currentUsers = storedUsers ? JSON.parse(storedUsers) : allUsers;
    
    // Check against all users, including newly created ones
    const foundUser = currentUsers.find((u: typeof mockUsers[0]) => u.email === email && u.password === password);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Credenciales inválidas');
    }
    
    // Remove password before storing
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Add a function to register new users
  const registerUser = (newUser: typeof mockUsers[0]) => {
    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      registerUser, // Expose the new function
      allUsers // Expose all users for admin functions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};