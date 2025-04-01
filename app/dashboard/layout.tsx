'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../components/auth/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <div className="min-h-screen bg-blue-50">
        <div className="flex">
          <Sidebar />
          
          {/* Main Content */}
          <div className="flex-1">
            {/* User Info Bar */}
            <div className="bg-white shadow-sm border-b border-blue-100 p-4 sticky top-0 z-10">
              <div className="flex justify-end items-center">
                <div className="text-blue-800">
                  <span className="font-medium">{user?.name || 'অজানা ব্যবহারকারী'}</span>
                  <span className="mx-2">|</span>
                  <span className="text-sm text-blue-600">{user?.role === 'superadmin' ? 'সুপার এডমিন' : 'এডমিন'}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 