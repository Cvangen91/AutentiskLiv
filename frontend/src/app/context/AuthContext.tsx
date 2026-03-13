import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@autentiskliv.no',
    password: 'admin123',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@autentiskliv.no',
      role: 'admin',
    },
  },
  {
    email: 'user@example.com',
    password: 'user123',
    user: {
      id: '2',
      name: 'Test User',
      email: 'user@example.com',
      role: 'user',
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('autentiskLivUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = mockUsers.find(
      u => u.email === email && u.password === password
    );

    if (mockUser) {
      setUser(mockUser.user);
      localStorage.setItem('autentiskLivUser', JSON.stringify(mockUser.user));
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      role: 'user',
    };

    setUser(newUser);
    localStorage.setItem('autentiskLivUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autentiskLivUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
