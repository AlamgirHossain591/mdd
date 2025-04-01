'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

type PendingUser = {
  id: string;
  email: string;
  name?: string;
  role: string;
  approved: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<string[]>([]);
  
  const { user, approveUser, getPendingUsers, logout } = useAuth();
  const router = useRouter();
  
  // পেন্ডিং ইউজারদের লোড করা
  const loadPendingUsers = async () => {
    try {
      setIsLoading(true);
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error('পেন্ডিং ইউজার লোড করতে সমস্যা:', error);
      toast.error('ইউজার ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };
  
  // পেজ লোড হওয়ার সময় পেন্ডিং ইউজারদের লোড করা
  useEffect(() => {
    if (user && user.role === 'superadmin') {
      loadPendingUsers();
    }
  }, [user]);
  
  // ইউজার অনুমোদন করার ফাংশন
  const handleApproveUser = async (userId: string) => {
    try {
      setProcessingUsers(prev => [...prev, userId]);
      
      const result = await approveUser(userId);
      
      if (result.success) {
        toast.success('ইউজার সফলভাবে অনুমোদিত হয়েছে');
        // পেন্ডিং ইউজার লিস্ট থেকে অনুমোদিত ইউজার রিমুভ করা
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
      } else {
        toast.error(result.message || 'ইউজার অনুমোদন করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('ইউজার অনুমোদন করতে সমস্যা:', error);
      toast.error('ইউজার অনুমোদন করতে সমস্যা হয়েছে');
    } finally {
      setProcessingUsers(prev => prev.filter(id => id !== userId));
    }
  };
  
  // লগআউট ফাংশন
  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };
  
  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">ইউজার ম্যানেজমেন্ট</h1>
            <p className="text-blue-600">এডমিন অনুমোদন এবং ইউজার ম্যানেজমেন্ট</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            লগআউট
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100">
            অনুমোদন অপেক্ষমান এডমিন
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              কোন অনুমোদন অপেক্ষমান এডমিন নেই
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      নাম
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      ইমেইল
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      রেজিস্ট্রেশন তারিখ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map((pendingUser) => (
                    <tr key={pendingUser.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pendingUser.name || 'অজানা'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{pendingUser.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(pendingUser.createdAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleApproveUser(pendingUser.id)}
                          disabled={processingUsers.includes(pendingUser.id)}
                          className="text-white py-1 px-3 rounded bg-green-600 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingUsers.includes(pendingUser.id) ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              অপেক্ষা করুন
                            </span>
                          ) : (
                            'অনুমোদন করুন'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100">
            সুপার এডমিন অ্যাকাউন্ট
          </h2>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">লগইন তথ্য</h3>
            <div className="space-y-2">
              <p className="text-blue-600">
                <span className="font-semibold">ইমেইল:</span> ch.th.m.d.b@gmail.com
              </p>
              <p className="text-blue-600">
                <span className="font-semibold">পাসওয়ার্ড:</span> ch.th.m.d.b@gmail.com
              </p>
              <div className="mt-4 text-blue-600 bg-white p-3 rounded border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block mr-1 text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="text-sm">
                  নিরাপত্তার জন্য পাসওয়ার্ড পরিবর্তন করা উচিত
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 