"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2024);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-purple-800/30 p-6 rounded-lg shadow-md backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4 text-pink-300">আয়ান ফ্যাশন</h3>
            <p className="mb-4 text-purple-200 leading-relaxed">আপনার ফ্যাশন চাহিদা পূরণের সেরা জায়গা। আমরা সর্বদা সেরা মানের প্রোডাক্ট সরবরাহ করি।</p>
            <div className="flex space-x-5 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-pink-400 transform hover:scale-110 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18,2h-3c-2.8,0-5,2.2-5,5v3H7v4h3v8h4v-8h3l1-4h-4V7c0-0.6,0.4-1,1-1h3V2z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-pink-400 transform hover:scale-110 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2c2.7,0,3,0,4.1,0.1c1,0,1.5,0.2,1.9,0.3c0.5,0.2,0.8,0.4,1.1,0.7c0.3,0.3,0.5,0.6,0.7,1.1c0.1,0.4,0.3,0.9,0.3,1.9C20,7,20,7.3,20,10c0,2.7,0,3-0.1,4.1c0,1-0.2,1.5-0.3,1.9c-0.2,0.5-0.4,0.8-0.7,1.1c-0.3,0.3-0.6,0.5-1.1,0.7c-0.4,0.1-0.9,0.3-1.9,0.3C15,18,14.7,18,12,18s-3,0-4.1-0.1c-1,0-1.5-0.2-1.9-0.3c-0.5-0.2-0.8-0.4-1.1-0.7c-0.3-0.3-0.5-0.6-0.7-1.1C4.2,15.5,4,15,4,14C4,12.9,4,12.7,4,10s0-3,0.1-4.1c0-1,0.2-1.5,0.3-1.9c0.2-0.5,0.4-0.8,0.7-1.1C5.4,2.7,5.7,2.5,6.2,2.3C6.6,2.2,7.1,2,8.1,2C9.1,2,9.3,2,12,2z M12,4c-2.7,0-3,0-4,0.1c-0.9,0-1.2,0.2-1.4,0.3C6.3,4.5,6.1,4.6,5.9,4.9C5.7,5.1,5.5,5.3,5.4,5.6C5.3,5.8,5.1,6.1,5.1,7C5,8,5,8.3,5,11s0,3,0.1,4c0,0.9,0.2,1.2,0.3,1.4c0.1,0.3,0.3,0.5,0.5,0.7c0.2,0.2,0.4,0.4,0.7,0.5c0.2,0.1,0.5,0.3,1.4,0.3c1,0.1,1.3,0.1,4,0.1s3,0,4-0.1c0.9,0,1.2-0.2,1.4-0.3c0.3-0.1,0.5-0.3,0.7-0.5c0.2-0.2,0.4-0.4,0.5-0.7c0.1-0.2,0.3-0.5,0.3-1.4c0.1-1,0.1-1.3,0.1-4s0-3-0.1-4c0-0.9-0.2-1.2-0.3-1.4c-0.1-0.3-0.3-0.5-0.5-0.7c-0.2-0.2-0.4-0.4-0.7-0.5c-0.2-0.1-0.5-0.3-1.4-0.3C15,4,14.7,4,12,4z M12,7c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5S14.8,7,12,7z M12,15c-1.7,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S13.7,15,12,15z M17,6.5c0,0.8-0.7,1.5-1.5,1.5S14,7.3,14,6.5S14.7,5,15.5,5S17,5.7,17,6.5z"/>
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-pink-400 transform hover:scale-110 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.6,5.3C15.9,4.7,15.5,3.9,15.5,3h-3v12.4c0,1.3-1.1,2.4-2.4,2.4c-1.3,0-2.4-1.1-2.4-2.4c0-1.3,1.1-2.4,2.4-2.4c0.3,0,0.6,0.1,0.9,0.2V10c-0.3-0.1-0.6-0.1-0.9-0.1c-2.8,0-5.1,2.3-5.1,5.1s2.3,5.1,5.1,5.1s5.1-2.3,5.1-5.1V8.6c1.1,0.8,2.5,1.2,3.9,1.2V7C17.6,7,17,6.2,16.6,5.3z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="bg-purple-800/30 p-6 rounded-lg shadow-md backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4 text-pink-300">দ্রুত লিঙ্ক</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-purple-200 hover:text-pink-300 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  হোম
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-purple-200 hover:text-pink-300 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  প্রোডাক্ট
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-purple-200 hover:text-pink-300 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  ক্যাটাগরি
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-purple-200 hover:text-pink-300 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-purple-200 hover:text-pink-300 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  যোগাযোগ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-purple-800/30 p-6 rounded-lg shadow-md backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4 text-pink-300">যোগাযোগ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-purple-200">ঢাকা, বাংলাদেশ</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-purple-200">info@ayanfashion.com</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-purple-200">+৮৮ ০১৯২০৬৬০৫৯১</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-purple-700/50 text-center">
          <p className="text-purple-200">&copy; {isClient ? currentYear : '2024'} আয়ান ফ্যাশন। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
} 