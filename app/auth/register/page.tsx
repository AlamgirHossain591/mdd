'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/components/auth/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // যদি ইউজার ইতিমধ্যে লগইন করা থাকে তাহলে ড্যাশবোর্ডে রিডাইরেক্ট করা
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ফর্ম ভ্যালিডেশন
    if (!name || !email || !password || !confirmPassword) {
      toast.error('সমস্ত ফিল্ড পূরণ করুন');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না');
      return;
    }
    
    if (password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await register(email, password, name);
      
      if (result.success) {
        setRegistrationSuccess(true);
        toast.success('রেজিস্ট্রেশন সফল হয়েছে! অনুমোদনের জন্য অপেক্ষা করুন।');
        // ফর্ম রিসেট করা
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.message || 'রেজিস্ট্রেশন সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('রেজিস্ট্রেশন সমস্যা:', error);
      toast.error('রেজিস্ট্রেশন করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // সফল রেজিস্ট্রেশন মেসেজ
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900">রেজিস্ট্রেশন সফল হয়েছে!</h2>
              <p className="mt-2 text-sm text-gray-500">
                আপনার রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে। সুপার এডমিনের অনুমোদনের জন্য অপেক্ষা করুন।
                অনুমোদন হওয়ার পর আপনি লগইন করতে পারবেন।
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  লগইন পেজে যান
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          এডমিন রেজিস্ট্রেশন
        </h1>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                নাম
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="আপনার নাম লিখুন"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                ইমেইল ঠিকানা
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="আপনার ইমেইল লিখুন"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                পাসওয়ার্ড
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    প্রক্রিয়াকরণ হচ্ছে...
                  </>
                ) : (
                  'রেজিস্ট্রেশন করুন'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  অথবা
                </span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ইতিমধ্যে একাউন্ট আছে?{' '}
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                  লগইন করুন
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 