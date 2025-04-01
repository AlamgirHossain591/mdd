'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-800">সেটিংস</h1>
        <p className="text-blue-600">আপনার ওয়েবসাইটের বিভিন্ন সেটিংস ম্যানেজ করুন</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/settings/pixel" 
          className="block p-6 bg-white shadow-md rounded-lg border border-blue-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-2">ফেসবুক পিক্সেল</h2>
              <p className="text-blue-600">আপনার ওয়েবসাইটে ফেসবুক পিক্সেল সেট করুন</p>
            </div>
            <div className="text-pink-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
          </div>
        </Link>
        
        {/* অন্যান্য সেটিংস কার্ড যোগ করতে পারেন */}
        <div className="block p-6 bg-white shadow-md rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-2">সাইট সেটিংস</h2>
              <p className="text-blue-600">ওয়েবসাইটের বেসিক ইনফরমেশন সেট করুন</p>
            </div>
            <div className="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="block p-6 bg-white shadow-md rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-2">পেমেন্ট সেটিংস</h2>
              <p className="text-blue-600">পেমেন্ট গেটওয়ে এবং অন্যান্য পেমেন্ট অপশন সেট করুন</p>
            </div>
            <div className="text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 