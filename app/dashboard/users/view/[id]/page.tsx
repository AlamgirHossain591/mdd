'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: string;
  phone?: string;
  joinDate?: string;
  permissions?: string[];
  activities?: {
    date: string;
    action: string;
  }[];
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user data from localStorage
        const usersJSON = localStorage.getItem('users');
        
        if (usersJSON) {
          const users = JSON.parse(usersJSON);
          const foundUser = users.find((u: User) => u.id === id);
          
          if (foundUser) {
            // Add extra details if not already present
            const enhancedUser = {
              ...foundUser,
              phone: foundUser.phone || '০১৭১২৩৪৫৬৭৮',
              joinDate: foundUser.joinDate || '০১/০১/২০২৪',
              permissions: foundUser.permissions || [
                'পণ্য ব্যবস্থাপনা',
                'অর্ডার ব্যবস্থাপনা',
                'গ্রাহক ব্যবস্থাপনা',
                foundUser.role === 'এডমিন' ? 'ব্যবহারকারী ব্যবস্থাপনা' : ''
              ].filter(Boolean),
              activities: foundUser.activities || [
                { date: foundUser.lastLogin, action: 'সাইন ইন করেছেন' },
                { date: '১৮/০৩/২০২৪ ১১:২২', action: 'পণ্য আপডেট করেছেন' },
                { date: '১৭/০৩/২০২৪ ১৬:৩০', action: 'অর্ডার স্ট্যাটাস পরিবর্তন করেছেন' },
                { date: '১৫/০৩/২০২৪ ০৯:৪৫', action: 'নতুন পণ্য যোগ করেছেন' }
              ]
            };
            
            setUser(enhancedUser);
          } else {
            setError('ব্যবহারকারী খুঁজে পাওয়া যায়নি');
          }
        } else {
          setError('ব্যবহারকারী তথ্য খুঁজে পাওয়া যায়নি');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ব্যবহারকারী পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-6">{error || 'আপনি যে ব্যবহারকারী খুঁজছেন তা পাওয়া যায়নি।'}</p>
          <Link 
            href="/dashboard/users" 
            className="inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
          >
            ব্যবহারকারী তালিকায় ফিরে যান
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-pink-600">আয়ান ফ্যাশন</h2>
            <p className="text-sm text-gray-600">এডমিন প্যানেল</p>
          </div>
          
          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              ড্যাশবোর্ড
            </Link>
            
            <Link href="/dashboard/products" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              পণ্যসমূহ
            </Link>
            
            <Link href="/dashboard/orders" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              অর্ডারসমূহ
            </Link>
            
            <Link href="/dashboard/customers" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              গ্রাহকবৃন্দ
            </Link>
            
            <Link href="/dashboard/users" className="block px-4 py-2 rounded bg-pink-100 text-pink-600">
              ব্যবহারকারী
            </Link>
            
            <button className="w-full text-left px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              সেটিংস
            </button>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ব্যবহারকারীর বিবরণ</h1>
                <p className="text-gray-600">ব্যবহারকারী আইডি: {user.id}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/users" className="text-pink-600 hover:text-pink-800">
                  ← ব্যবহারকারী তালিকায় ফিরে যান
                </Link>
                <Link 
                  href={`/dashboard/users/edit/${user.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  এডিট করুন
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">ব্যক্তিগত তথ্য</h2>
                  <div className="mt-3 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">নাম:</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ইমেইল:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ফোন:</span>
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ভূমিকা:</span>
                      <span className="font-medium">{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">স্ট্যাটাস:</span>
                      <span className={`py-1 px-2 rounded-full text-xs ${
                        user.status === 'সক্রিয়' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">অ্যাকাউন্ট তথ্য</h2>
                  <div className="mt-3 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">যোগদানের তারিখ:</span>
                      <span>{user.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">সর্বশেষ লগইন:</span>
                      <span>{user.lastLogin}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">অনুমতিসমূহ</h2>
                  <div className="mt-3">
                    <ul className="space-y-1 list-disc list-inside">
                      {user.permissions?.map((permission, index) => (
                        <li key={index} className="text-gray-700">{permission}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Activity Log */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">সাম্প্রতিক কার্যকলাপ</h2>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 py-2 px-4 border-b">
                    <div className="grid grid-cols-3">
                      <div className="text-xs font-medium text-gray-500 uppercase">তারিখ</div>
                      <div className="text-xs font-medium text-gray-500 uppercase col-span-2">কার্যকলাপ</div>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {user.activities?.map((activity, index) => (
                      <div key={index} className="py-3 px-4 hover:bg-gray-50">
                        <div className="grid grid-cols-3">
                          <div className="text-sm text-gray-600">{activity.date}</div>
                          <div className="text-sm text-gray-900 col-span-2">{activity.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  <button className="text-pink-600 hover:text-pink-800 text-sm">
                    সকল কার্যকলাপ দেখুন
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে নিষ্ক্রিয় করতে চান?')) {
                  // Toggle user status
                  const newStatus = user.status === 'সক্রিয়' ? 'নিষ্ক্রিয়' : 'সক্রিয়';
                  
                  // Update user in localStorage
                  const usersJSON = localStorage.getItem('users');
                  if (usersJSON) {
                    const users = JSON.parse(usersJSON);
                    const updatedUsers = users.map((u: User) => 
                      u.id === user.id ? { ...u, status: newStatus } : u
                    );
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    
                    // Update state
                    setUser({ ...user, status: newStatus });
                  }
                }
              }}
              className={`px-4 py-2 rounded-md ${
                user.status === 'সক্রিয়' 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white transition`}
            >
              {user.status === 'সক্রিয়' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।')) {
                  // Delete user from localStorage
                  const usersJSON = localStorage.getItem('users');
                  if (usersJSON) {
                    const users = JSON.parse(usersJSON);
                    const updatedUsers = users.filter((u: User) => u.id !== user.id);
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    
                    // Redirect to users list
                    window.location.href = '/dashboard/users';
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              ব্যবহারকারী মুছুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 