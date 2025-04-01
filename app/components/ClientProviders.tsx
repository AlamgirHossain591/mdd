'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './auth/AuthContext';
import { CartProvider } from '@/app/context/CartContext';
import { Toaster } from 'react-hot-toast';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  );
} 