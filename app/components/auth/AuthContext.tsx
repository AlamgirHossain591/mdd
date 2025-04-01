'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// টোকেন স্টোরেজ কী
const AUTH_TOKEN_KEY = 'auth_token';

// ইউজার টাইপ
type UserRole = 'admin' | 'superadmin';

type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
};

// অথেন্টিকেশন কনটেক্সট টাইপ
type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  approveUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  getPendingUsers: () => Promise<any[]>;
};

// ডিফল্ট কনটেক্সট ভ্যালু
const defaultContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false, message: '' }),
  register: async () => ({ success: false, message: '' }),
  logout: () => {},
  approveUser: async () => ({ success: false, message: '' }),
  getPendingUsers: async () => [],
};

// কনটেক্সট তৈরি করা
const AuthContext = createContext<AuthContextType>(defaultContext);

// কনটেক্সট হুক
export const useAuth = () => useContext(AuthContext);

// অথেন্টিকেশন প্রোভাইডার
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // টোকেন থেকে ইউজার তথ্য লোড করা
  const loadUserFromToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'verify', token }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        });
        setToken(token);
        return true;
      } else {
        // টোকেন ভ্যালিড না হলে লগআউট করা
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setToken(null);
        return false;
      }
    } catch (error) {
      console.error('টোকেন ভেরিফাই করতে সমস্যা:', error);
      return false;
    }
  };

  // প্রথম লোডে টোকেন চেক করা
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        
        if (storedToken) {
          await loadUserFromToken(storedToken);
        }
      } catch (error) {
        console.error('অথেন্টিকেশন চেক করতে সমস্যা:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // লগইন ফাংশন
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }

      return data;
    } catch (error) {
      console.error('লগইন করতে সমস্যা:', error);
      return { success: false, message: 'লগইন করতে সমস্যা হয়েছে' };
    }
  };

  // রেজিস্ট্রেশন ফাংশন
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'register', email, password, name }),
      });

      return await response.json();
    } catch (error) {
      console.error('রেজিস্ট্রেশন করতে সমস্যা:', error);
      return { success: false, message: 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে' };
    }
  };

  // লগআউট ফাংশন
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setToken(null);
    router.push('/auth/login');
  };

  // ইউজার এপ্রুভ করার ফাংশন
  const approveUser = async (userId: string) => {
    if (!token || user?.role !== 'superadmin') {
      return { success: false, message: 'এই অপারেশন করার অনুমতি নেই' };
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve', token, userId }),
      });

      return await response.json();
    } catch (error) {
      console.error('ইউজার অনুমোদন করতে সমস্যা:', error);
      return { success: false, message: 'ইউজার অনুমোদন করতে সমস্যা হয়েছে' };
    }
  };

  // পেন্ডিং ইউজার পাওয়ার ফাংশন
  const getPendingUsers = async () => {
    if (!token || user?.role !== 'superadmin') {
      return [];
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'getPendingUsers', token }),
      });

      const data = await response.json();
      
      if (data.success && data.pendingUsers) {
        return data.pendingUsers;
      }
      
      return [];
    } catch (error) {
      console.error('পেন্ডিং ইউজার পাওয়া যায়নি:', error);
      return [];
    }
  };

  // কনটেক্সট ভ্যালু
  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    approveUser,
    getPendingUsers,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 