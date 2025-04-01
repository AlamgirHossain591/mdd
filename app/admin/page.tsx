'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 max-w-sm w-full bg-white shadow-md rounded-md">
        <h2 className="text-center text-2xl font-medium text-gray-900">লোড হচ্ছে...</h2>
        <p className="mt-2 text-center text-gray-600">এডমিন ড্যাশবোর্ডে প্রবেশ করা হচ্ছে</p>
        <div className="mt-4 flex justify-center">
          <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
} 