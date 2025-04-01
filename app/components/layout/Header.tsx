'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // উইশলিস্ট চেক করা
  useEffect(() => {
    const checkWishlist = () => {
      try {
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
          const wishlistItems = JSON.parse(storedWishlist);
          setWishlistCount(wishlistItems.length);
        }
      } catch (e) {
        console.error('উইশলিস্ট চেক করতে সমস্যা:', e);
      }
    };
    
    checkWishlist();
    
    // স্টোরেজ ইভেন্ট লিসেন করা
    const handleStorageChange = () => {
      checkWishlist();
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('wishlistUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-pink-600">আয়ান ফ্যাশন</h1>
        </Link>

        {/* মোবাইল মেনু বাটন */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* ডেস্কটপ নেভিগেশন */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-pink-600">হোম</Link>
          <Link href="/products" className="text-gray-700 hover:text-pink-600">প্রোডাক্ট</Link>
          <Link href="/categories" className="text-gray-700 hover:text-pink-600">ক্যাটাগরি</Link>
          <Link href="/about" className="text-gray-700 hover:text-pink-600">আমাদের সম্পর্কে</Link>
          <Link href="/contact" className="text-gray-700 hover:text-pink-600">যোগাযোগ</Link>
        </nav>

        {/* সার্চ ও কার্ট */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-700 hover:text-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {/* উইশলিস্ট আইকন */}
          <Link href="/wishlist" className="text-gray-700 hover:text-pink-600 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{wishlistCount}</span>
            )}
          </Link>
          
          {/* কার্ট আইকন */}
          <Link href="/checkout" className="text-gray-700 hover:text-pink-600 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{cartCount}</span>
            )}
          </Link>
        </div>

        {/* মোবাইল মেনু */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-md p-4 md:hidden">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 hover:text-pink-600">হোম</Link>
              <Link href="/products" className="text-gray-700 hover:text-pink-600">প্রোডাক্ট</Link>
              <Link href="/categories" className="text-gray-700 hover:text-pink-600">ক্যাটাগরি</Link>
              <Link href="/about" className="text-gray-700 hover:text-pink-600">আমাদের সম্পর্কে</Link>
              <Link href="/contact" className="text-gray-700 hover:text-pink-600">যোগাযোগ</Link>
              <div className="flex items-center space-x-4 pt-2 border-t">
                <button className="text-gray-700 hover:text-pink-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                
                {/* উইশলিস্ট আইকন মোবাইল */}
                <Link href="/wishlist" className="text-gray-700 hover:text-pink-600 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{wishlistCount}</span>
                  )}
                </Link>
                
                {/* কার্ট আইকন মোবাইল */}
                <Link href="/checkout" className="text-gray-700 hover:text-pink-600 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{cartCount}</span>
                  )}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 