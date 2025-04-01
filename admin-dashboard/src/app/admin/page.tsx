'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-800">রিডাইরেক্ট করা হচ্ছে...</h1>
        <p className="text-gray-600 mt-2">আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে</p>
      </div>
    </div>
  );
} 