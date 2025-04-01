'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type ProductVariant = {
  size: string;
  color: string;
  price: number;
  stock: number;
};

type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  image: string;
  variants: ProductVariant[];
  onAddToCart: (productId: string, variant: ProductVariant, quantity: number) => void;
};

export default function ProductCard({ 
  id, 
  title, 
  price, 
  discountedPrice, 
  image,
  variants,
  onAddToCart 
}: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [forceTick, setForceTick] = useState(false);

  // প্রথম ভ্যারিয়েন্ট যেটার স্টক আছে সেটি সিলেক্ট করা
  useEffect(() => {
    const inStockVariant = variants.find(variant => variant.stock > 0);
    setSelectedVariant(inStockVariant || variants[0]);
  }, [variants]);

  // কার্ট এবং উইশলিস্ট স্ট্যাটাস চেক করার ফাংশন
  const checkCartAndWishlist = () => {
    try {
      // কার্ট চেক করা
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        const isInCart = parsedCart.some((item: any) => 
          item.id === id && 
          (selectedVariant ? 
            item.variant.size === selectedVariant.size && 
            item.variant.color === selectedVariant.color 
            : true)
        );
        setIsAddedToCart(isInCart);
      }
      
      // উইশলিস্ট চেক করা
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        const parsedWishlist = JSON.parse(storedWishlist);
        const inWishlist = parsedWishlist.some((item: any) => item.id === id);
        setIsInWishlist(inWishlist);
      }
    } catch (e) {
      console.error('কার্ট/উইশলিস্ট চেক করতে সমস্যা:', e);
    }
  };

  // প্রথম রেন্ডারে এবং ভ্যারিয়েন্ট চেঞ্জে স্ট্যাটাস চেক করা
  useEffect(() => {
    checkCartAndWishlist();
  }, [id, selectedVariant]);
  
  // স্টোরেজ ইভেন্ট লিসেন করা
  useEffect(() => {
    const handleStorageChange = () => {
      checkCartAndWishlist();
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('cartUpdated', handleStorageChange);
    document.addEventListener('wishlistUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('cartUpdated', handleStorageChange);
      document.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, []);

  // কার্টে যোগ করার ফাংশন
  const handleAddToCart = () => {
    if (selectedVariant) {
      // UI স্টেট আপডেট
      setIsAddedToCart(true);
      setForceTick(true);
      
      onAddToCart(id, selectedVariant, quantity);
      
      // অ্যানিমেশন দেখানো
      setIsLongPress(true);
      setTimeout(() => {
        setIsLongPress(false);
      }, 1500);
      
      // কার্ট আপডেট ইভেন্ট ডিসপ্যাচ করা
      const cartUpdatedEvent = new Event('cartUpdated');
      document.dispatchEvent(cartUpdatedEvent);
      
      // লোকাল স্টোরেজ সরাসরি আপডেট করা (কার্ট কন্টেক্সট ছাড়াও)
      try {
        const storedCart = localStorage.getItem('cart') || '[]';
        const cartItems = JSON.parse(storedCart);
        
        // চেক করা যে এই আইটেম আগে থেকে আছে কিনা
        const existingItemIndex = cartItems.findIndex(
          (item: any) => item.id === id && 
                         item.variant.size === selectedVariant.size && 
                         item.variant.color === selectedVariant.color
        );
        
        if (existingItemIndex >= 0) {
          // আগে থেকে থাকলে পরিমাণ বাড়ানো
          cartItems[existingItemIndex].quantity += quantity;
          cartItems[existingItemIndex].total = cartItems[existingItemIndex].quantity * cartItems[existingItemIndex].price;
        } else {
          // নতুন আইটেম যোগ করা
          cartItems.push({
            id,
            title: title,
            price: selectedVariant.price,
            quantity,
            image: image,
            variant: selectedVariant,
            total: quantity * selectedVariant.price
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (e) {
        console.error('কার্ট আপডেট করতে সমস্যা:', e);
      }
    }
  };

  // উইশলিস্টে যোগ/বাদ দেওয়ার ফাংশন
  const toggleWishlist = () => {
    try {
      const storedWishlist = localStorage.getItem('wishlist') || '[]';
      const wishlistItems = JSON.parse(storedWishlist);
      
      // উইশলিস্টে আছে কিনা চেক করা
      const existingIndex = wishlistItems.findIndex((item: any) => item.id === id);
      
      if (existingIndex >= 0) {
        // উইশলিস্ট থেকে রিমুভ করা
        wishlistItems.splice(existingIndex, 1);
        setIsInWishlist(false);
      } else {
        // উইশলিস্টে যোগ করা
        wishlistItems.push({
          id,
          title,
          price: discountedPrice || price,
          image,
          variant: selectedVariant
        });
        setIsInWishlist(true);
      }
      
      // আপডেট করা উইশলিস্ট সেভ করা
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      
      // উইশলিস্ট আপডেট ইভেন্ট ডিসপ্যাচ করা
      const wishlistUpdatedEvent = new Event('wishlistUpdated');
      document.dispatchEvent(wishlistUpdatedEvent);
    } catch (e) {
      console.error('উইশলিস্ট আপডেট করতে সমস্যা:', e);
    }
  };

  // লং প্রেস হ্যান্ডেল করার জন্য ফাংশন
  const handleMouseDown = () => {
    if (pressTimer) clearTimeout(pressTimer);
    const timer = setTimeout(() => {
      handleAddToCart();
    }, 500); // 500ms লং প্রেস
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  console.log('কার্ড রেন্ডার হচ্ছে, কার্টে আছে?', isAddedToCart);

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 relative border border-transparent hover:border-pink-100">
      <div 
        className="relative h-60 md:h-72 overflow-hidden cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-110 duration-700"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        />
        {discountedPrice && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-600 to-yellow-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
            {Math.round(((price - discountedPrice) / price) * 100)}% ছাড়
          </div>
        )}
        
        {/* কার্টে এড হওয়ার এনিমেশন */}
        {isLongPress && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
          >
            <div className="bg-white p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 hover:text-pink-600 transition-colors mb-2 line-clamp-2">{title}</h3>
        </Link>
        
        <div className="flex items-center mt-2">
          {discountedPrice ? (
            <>
              <span className="text-gray-500 line-through mr-2 text-sm md:text-base">৳{price}</span>
              <span className="text-pink-600 font-bold text-lg md:text-xl">৳{discountedPrice}</span>
            </>
          ) : (
            <span className="text-pink-600 font-bold text-lg md:text-xl">৳{price}</span>
          )}
        </div>
        
        {/* কুয়ান্টিটি এবং অ্যাকশন বাটন */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="px-3 py-1.5 text-center w-8 font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={toggleWishlist}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              aria-label="Toggle wishlist"
            >
              {isInWishlist ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock <= 0 || isAddedToCart}
              className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm md:text-base transition-colors ${
                isAddedToCart && forceTick ? 
                'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' : 
                !selectedVariant || selectedVariant.stock <= 0 ? 
                'bg-gray-300 text-gray-500 cursor-not-allowed' :
                'bg-gradient-to-r from-pink-600 to-yellow-500 text-white shadow-md hover:from-pink-700 hover:to-yellow-600'
              }`}
            >
              {isAddedToCart && forceTick ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <>কার্টে যোগ</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 