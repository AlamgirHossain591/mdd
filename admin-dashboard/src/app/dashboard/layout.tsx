'use client';

import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';
import { RiBellLine, RiSearchLine, RiUserLine } from 'react-icons/ri';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* সাইডবার */}
      <Sidebar />

      {/* মেইন কন্টেন্ট এরিয়া */}
      <main className="md:ml-72 min-h-screen">
        {/* হেডার/টপবার */}
        <header className="sticky top-0 z-30 bg-white shadow-sm h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            {/* সার্চ বার */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-md px-3 py-2 flex-1 max-w-md">
              <RiSearchLine className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="সার্চ করুন..."
                className="bg-transparent border-none focus:outline-none flex-1 text-sm"
              />
            </div>

            {/* অপশন বাটন/আইকন */}
            <div className="flex items-center space-x-4 ml-auto">
              <button className="p-1.5 rounded-full hover:bg-gray-100">
                <RiBellLine className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-gray-100">
                <RiUserLine className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">আদমিন</div>
                <div className="text-xs text-gray-500">admin@ayanfashion.com</div>
              </div>
            </div>
          </div>
        </header>

        {/* পেজ কন্টেন্ট */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 