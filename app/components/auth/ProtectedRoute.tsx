'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'superadmin'>;
};

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // লোডিং চলাকালীন কিছু করা হবে না
    if (isLoading) return;

    // ইউজার লগইন করা না থাকলে লগইন পেজে রিডাইরেক্ট করা হবে
    if (!isAuthenticated) {
      toast.error('এই পেজ দেখার জন্য লগইন করা আবশ্যক');
      router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
      return;
    }

    // যদি স্পেসিফিক রোল চেক করার প্রয়োজন হয়
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      toast.error('আপনার এই পেজ দেখার অনুমতি নেই');
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles]);

  // লোডিং অবস্থায় একটি লোডিং ইনডিকেটর দেখানো হবে
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ইউজার লগইন করা না থাকলে কিছুই দেখানো হবে না (রিডাইরেক্ট হওয়ার আগ পর্যন্ত)
  if (!isAuthenticated) {
    return null;
  }

  // ইউজারের রোল চেক করা
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  // সব ঠিক থাকলে চাইল্ড রেন্ডার করা হবে
  return <>{children}</>;
} 