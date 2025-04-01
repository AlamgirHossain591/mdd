'use client';

import { useState, useEffect } from "react";
import { useCart, ProductVariant } from "../../context/CartContext";
import { use, Usable } from "react";
import Image from 'next/image';
import ProductCard from "../../components/product/ProductCard";
import Link from "next/link";
import { motion } from "framer-motion";

type ProductType = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  image: string;
  category: string;
  stock: number;
  variants: Array<{
    size: string;
    color: string;
    price: number;
    stock: number;
  }>;
  description?: string;
  ratings?: number;
  reviewCount?: number;
};

export default function CategoryPage({ params }: { params: { name: string } }) {
  const typedParams = params as unknown as Usable<{ name: string }>;
  const decodedName = decodeURIComponent(use(typedParams).name);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const productsPerPage = 8;
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  
  // টুলটিপ স্টেট
  const [showWhatsappTooltip, setShowWhatsappTooltip] = useState(false);
  const [showMessengerTooltip, setShowMessengerTooltip] = useState(false);
  const [pulseWhatsappTooltip, setPulseWhatsappTooltip] = useState(false);
  const [pulseMessengerTooltip, setPulseMessengerTooltip] = useState(false);
  const [showCartTooltip, setShowCartTooltip] = useState(false);
  const [pulseCartTooltip, setPulseCartTooltip] = useState(false);
  const [cartBackgroundColor, setCartBackgroundColor] = useState('from-pink-600 to-yellow-500');
  const [cartTooltipText, setCartTooltipText] = useState('পছন্দ করা গুলো কার্টে যোগ করুন');
  
  // RGB এফেক্ট
  useEffect(() => {
    const colors = [
      'from-pink-600 to-yellow-500',
      'from-purple-600 to-pink-500',
      'from-indigo-600 to-blue-500',
      'from-blue-600 to-teal-500',
      'from-teal-600 to-green-500',
      'from-green-600 to-yellow-500',
      'from-yellow-600 to-orange-500',
      'from-orange-600 to-red-500',
      'from-red-600 to-pink-500'
    ];
    
    let colorIndex = 0;
    
    const rgbInterval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length;
      setCartBackgroundColor(colors[colorIndex]);
    }, 2000);
    
    return () => {
      clearInterval(rgbInterval);
    };
  }, []);
  
  // টুলটিপ পালস এফেক্ট
  useEffect(() => {
    const whatsappInterval = setInterval(() => {
      setPulseWhatsappTooltip(true);
      setTimeout(() => {
        setPulseWhatsappTooltip(false);
      }, 2000);
    }, 5000);
    
    const messengerInterval = setInterval(() => {
      setPulseMessengerTooltip(true);
      setTimeout(() => {
        setPulseMessengerTooltip(false);
      }, 2000);
    }, 5000);
    
    const cartInterval = setInterval(() => {
      // ঝুড়ির টুলটিপ 10 সেকেন্ড দেখাবে
      setPulseCartTooltip(true);
      
      // 10 সেকেন্ড পর টুলটিপ অদৃশ্য হবে
      setTimeout(() => {
        setPulseCartTooltip(false);
        
        // 3 সেকেন্ড অদৃশ্য থাকার পর আবার লুপ চালু হবে
      }, 10000);
    }, 13000); // 10 সেকেন্ড দেখাবে + 3 সেকেন্ড অদৃশ্য থাকবে = 13 সেকেন্ড চক্র
    
    return () => {
      clearInterval(whatsappInterval);
      clearInterval(messengerInterval);
      clearInterval(cartInterval);
    };
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ক্যাটাগরি ডাটা ফেচ করা
        const categoryResponse = await fetch('/api/categories');
        if (!categoryResponse.ok) {
          throw new Error('ক্যাটাগরি ডাটা লোড করতে সমস্যা হয়েছে');
        }
        const categoriesData = await categoryResponse.json();
        setCategories(categoriesData);
        
        // এখানে ক্যাটাগরি প্যারামিটার API প্যারাম হিসেবে পাঠানোর আগে ডিকোড করা হয়েছে
        // API থেকে সরাসরি ক্যাটাগরি অনুযায়ী প্রোডাক্ট নিয়ে আসা
        const productsResponse = await fetch(`/api/products?category=${encodeURIComponent(decodedName)}&showAllStock=${showOutOfStock}`);
        if (!productsResponse.ok) {
          throw new Error('প্রোডাক্ট ডাটা লোড করতে সমস্যা হয়েছে');
        }
        
        const filteredProducts = await productsResponse.json();
        
        console.log('ক্যাটাগরি পেজে লোড করা প্রোডাক্ট:', filteredProducts);
        console.log('নির্বাচিত ক্যাটাগরি:', decodedName);
        
        setProducts(filteredProducts);
        setError(null);
      } catch (error) {
        console.error('ডাটা লোড করতে সমস্যা:', error);
        setError('ডাটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [decodedName, showOutOfStock]);
  
  // কার্টে যোগ করার ফাংশন
  const handleAddToCart = (productId: string, variant: ProductVariant, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(
        productId,
        variant,
        quantity,
        product.title,
        product.image
      );
      
      // টুলটিপ টেক্সট আপডেট
      setCartTooltipText('এখানে ক্লিক করে অর্ডারটি কনফার্ম করুন');
      
      // কার্ট আইকন অ্যানিমেশন ট্রিগার করা
      const cartButton = document.querySelector('.cart-button');
      if (cartButton) {
        cartButton.classList.add('cart-added');
        setTimeout(() => {
          cartButton.classList.remove('cart-added');
        }, 1000);
      }
    }
  };
  
  // আরো প্রোডাক্ট লোড করার ফাংশন
  const loadMoreProducts = () => {
    if ((page + 1) * productsPerPage < products.length) {
      setPage(prevPage => prevPage + 1);
    }
  };
  
  // আগের প্রোডাক্ট দেখানোর ফাংশন
  const loadPreviousProducts = () => {
    if (page > 0) {
      setPage(prevPage => prevPage - 1);
    }
  };
  
  // বর্তমান পেজে দেখানোর জন্য প্রোডাক্ট
  const currentProducts = products.slice(0, (page + 1) * productsPerPage);
  
  // স্টক শেষ পণ্য দেখানোর টগল
  const toggleStockVisibility = () => {
    setShowOutOfStock(prev => !prev);
  };
  
  // স্টাইল সেকশন
  useEffect(() => {
    // CSS অ্যানিমেশন স্টাইল যোগ
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes wiggle {
        0% { transform: rotate(0deg); }
        15% { transform: rotate(-15deg); }
        30% { transform: rotate(10deg); }
        45% { transform: rotate(-10deg); }
        60% { transform: rotate(6deg); }
        75% { transform: rotate(-4deg); }
        100% { transform: rotate(0deg); }
      }
      
      .cart-added {
        animation: wiggle 0.5s ease;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ক্যাটাগরি হেডার সেকশন */}
      <section className="py-14 bg-gradient-to-b from-gray-100 to-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative mb-10 text-center">
            <h1 className="inline-block text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-yellow-500 pb-2">{decodedName}</h1>
            <div className="absolute w-36 h-1 bg-gradient-to-r from-pink-500 to-yellow-400 bottom-0 left-1/2 transform -translate-x-1/2 rounded-full"></div>
          </div>
          
          {/* লোডিং স্টেট */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 p-3 rounded-lg shadow-sm">
                  <div className="h-48 bg-gray-200 rounded mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : products.length > 0 ? (
            <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm p-4 border border-pink-100">
              {/* ফিল্টার সাইডবার */}
              <div className="w-full md:w-1/6 mb-6 md:mb-0 flex flex-row md:flex-col justify-between items-center md:items-start md:mr-6 bg-gradient-to-b from-pink-50 to-purple-50 p-4 rounded-lg">
                <div className="mb-4 w-full text-center">
                  <h3 className="text-lg font-semibold text-purple-700 mb-2">ফিল্টার</h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-pink-400 to-yellow-300 mx-auto rounded-full mb-4"></div>
                </div>
                
                <button 
                  onClick={loadPreviousProducts} 
                  disabled={page === 0}
                  className={`flex justify-center items-center w-10 h-10 rounded-full ${page === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors duration-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-center md:text-center text-purple-600 my-4 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <p>দেখানো হচ্ছে</p>
                  <p className="font-semibold text-pink-600">{Math.min(currentProducts.length, products.length)} / {products.length}</p>
                </div>
                
                <button 
                  onClick={loadMoreProducts} 
                  disabled={(page + 1) * productsPerPage >= products.length}
                  className={`flex justify-center items-center w-10 h-10 rounded-full ${(page + 1) * productsPerPage >= products.length ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors duration-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* স্টক শেষ দেখানোর টগল */}
                <div className="mt-8 w-full p-4 bg-white rounded-md border border-pink-200 shadow-sm">
                  <div className="text-sm font-medium text-purple-600 mb-2">স্টক শেষ পণ্য দেখান</div>
                  <button 
                    onClick={toggleStockVisibility}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      showOutOfStock ? 'bg-pink-600' : 'bg-gray-300'
                    } transition-colors duration-300 focus:outline-none`}
                  >
                    <span 
                      className={`inline-block w-4 h-4 transform transition-transform duration-300 bg-white rounded-full ${
                        showOutOfStock ? 'translate-x-6' : 'translate-x-1'
                      }`} 
                    />
                  </button>
                </div>
              </div>
              
              {/* প্রোডাক্ট গ্রিড */}
              <div className="w-full md:w-5/6">
                {/* ফিল্টার করা প্রোডাক্ট দেখানো */}
                {currentProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-600">দুঃখিত, এই শ্রেণীতে কোন পণ্য খুঁজে পাওয়া যায়নি</h3>
                    <p className="text-gray-500 mt-1">অনুগ্রহ করে ফিল্টার পরিবর্তন করুন বা পরে আবার চেষ্টা করুন</p>
                    <button 
                      onClick={toggleStockVisibility}
                      className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    >
                      ফিল্টার রিসেট করুন
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProducts.map((product) => (
                      <ProductCard 
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        discountedPrice={product.discountedPrice}
                        image={product.image}
                        variants={product.variants}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-lg shadow-md text-center border border-pink-100">
              <h3 className="text-xl font-semibold text-pink-600 mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি!</h3>
              <p className="text-purple-600 mb-4">এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
              <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-yellow-300 mx-auto rounded-full"></div>
            </div>
          )}
        </div>
      </section>
      
      {/* ভাসমান বাটনগুলো */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-center gap-3">
        {/* শপিং কার্ট বাটন */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          <Link
            href="/checkout"
            className={`cart-button flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r ${cartBackgroundColor} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            onMouseEnter={() => setShowCartTooltip(true)}
            onMouseLeave={() => setShowCartTooltip(false)}
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </Link>
          
          {/* কার্ট টুলটিপ */}
          <motion.div
            className={`absolute right-16 top-2 px-4 py-2 rounded-lg shadow-md z-10 w-64 bg-gradient-to-r ${cartBackgroundColor}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: showCartTooltip || pulseCartTooltip ? 1 : 0, 
              x: showCartTooltip || pulseCartTooltip ? 0 : -10 
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-white text-sm">
              <span className={`font-medium animate-pulse`}>{cartTooltipText}</span>
            </div>
            <div className={`absolute top-3 right-[-6px] transform rotate-45 w-3 h-3 bg-gradient-to-r ${cartBackgroundColor}`}></div>
          </motion.div>
        </motion.div>
        
        {/* হোয়াটসঅ্যাপ বাটন */}
        <div className="relative">
          <motion.a 
            href={`https://wa.me/+8801920660591?text=আমি+আপনার+ওয়েবসাইটের+${decodedName}+ক্যাটাগরি+পেজ+থেকে+পণ্য+সম্পর্কে+জানতে+চাই।+${decodedName}+ক্যাটাগরির+পণ্য+সম্পর্কে+বিস্তারিত+জানতে+আগ্রহী।`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BD5C] transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onHoverStart={() => setShowWhatsappTooltip(true)}
            onHoverEnd={() => setShowWhatsappTooltip(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" width="28px" height="28px">
              <defs><linearGradient id="a" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#57d163"/><stop offset="1" stopColor="#23b33a"/></linearGradient></defs>
              <path fill="#fff" d="M87.4 14.6C45.6 14.6 11.9 48.3 11.9 90.1c0 14.8 4.2 28.8 11.6 40.5l-12.5 44.8 46.3-12c11.2 6.1 24 9.6 37.7 9.6 41.8 0 75.5-33.7 75.5-75.5s-33.7-75.5-75.5-75.5"/><path fill="url(#a)" d="M87.4 27.1c-34.7 0-62.9 28.2-62.9 62.9 0 13.5 4.3 26.5 12.3 37.3l-8 28.9 29.9-7.8c10.4 6.6 22.3 10.1 34.8 10.1 34.7 0 62.9-28.2 62.9-62.9s-28.3-62.9-62.9-62.9m0 121.2c-11.9 0-23.5-3.8-33.1-10.8l-2.3-1.4-25 6.5 6.8-24-1.6-2.6c-7.6-12-11.6-25.9-11.6-40.2 0-41.9 34.1-75.9 75.9-75.9s75.9 34.1 75.9 75.9-34 76-76 76"/>
              <path fill="#fff" d="M64.8 51.2c-1.7-3.8-3.4-3.9-5.1-4-1.3 0-2.8-.1-4.4-.1s-4 .6-6.1 2.8c-2.1 2.3-8.1 7.9-8.1 19.3s8.3 22.4 9.5 24 16.2 26 40.3 35.2c19.9 7.6 24 6.1 28.3 5.7s14-5.7 15.9-11.2c2-5.5 2-10.2 1.4-11.2s-2-1.7-4.3-2.8c-2.2-1.1-13.2-6.5-15.3-7.3s-3.6-1.1-5 1.1c-1.5 2.2-5.6 7.3-6.9 8.8s-2.5 1.7-4.7.6c-2.2-1.1-9.3-3.4-17.7-10.9-6.5-5.8-11-13-12.3-15.1s-.1-3.4 1-4.5c1-1 2.3-2.6 3.4-3.9s1.5-2.2 2.3-3.7.4-2.8-.1-3.9-4.6-11.5-6.4-15.9"/>
            </svg>
          </motion.a>
          
          {/* হোয়াটসঅ্যাপ টুলটিপ */}
          <motion.div
            className="absolute right-16 top-2 bg-white px-4 py-2 rounded-lg shadow-md z-10 w-52 border border-green-100"
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: showWhatsappTooltip || pulseWhatsappTooltip ? 1 : 0, 
              x: showWhatsappTooltip || pulseWhatsappTooltip ? 0 : -10 
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-gray-700 text-sm">
              <span className="font-medium">হোয়াটসঅ্যাপে মেসেজ করুন</span>
            </div>
            <div className="absolute top-3 right-[-6px] transform rotate-45 w-3 h-3 bg-white border-r border-t border-green-100"></div>
          </motion.div>
        </div>
        
        {/* মেসেঞ্জার বাটন */}
        <div className="relative">
          <motion.a 
            href={`https://m.me/AyyanFashion?text=আমি+আপনার+ওয়েবসাইটের+${decodedName}+ক্যাটাগরি+পেজ+থেকে+পণ্য+সম্পর্কে+জানতে+চাই।+${decodedName}+ক্যাটাগরির+পণ্য+সম্পর্কে+বিস্তারিত+জানতে+আগ্রহী।`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#00B2FF] to-[#006AFF] text-white shadow-lg hover:from-[#00B2FF] hover:to-[#0055FF] transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onHoverStart={() => setShowMessengerTooltip(true)}
            onHoverEnd={() => setShowMessengerTooltip(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="28px" height="28px">
              <radialGradient id="messengerGradient" cx="50%" cy="50%" r="50%" fx="10%" fy="10%">
                <stop offset="0%" stopColor="#00C6FF" />
                <stop offset="60%" stopColor="#0078FF" />
                <stop offset="100%" stopColor="#0068FF" />
              </radialGradient>
              <path fill="#FFFFFF" d="M400,0C174.7,0,0,165.1,0,388c0,116.6,47.8,217.4,125.6,287c6.5,5.8,10.5,14,10.7,22.8l2.2,71.2c0.7,22.7,24.1,37.5,44.9,28.3 l79.4-27.8c7.5-2.6,15.8-2.2,23,1.1c34.5,14,72.7,21.4,114.2,21.4c225.3,0,400-165.1,400-388S625.3,0,400,0z M217,501l-93,165 c-5.7,10.1-20,8.9-24.4-2.1L2.1,424.7c-4.5-11.3,5.8-22.3,17.1-18.5l95.8,32.1c13.8,4.6,28,4.7,41.8,0.1L400,317.3 c15.7-5.3,30.8,9.9,25.5,25.6L324.9,437.1C310,476.6,267.9,505.9,217,501z M598,501l93,165c5.7,10.1,20,8.9,24.4-2.1l97.5-239.2 c4.5-11.3-5.8-22.3-17.1-18.5l-95.8,32.1c-13.8,4.6-28,4.7,41.8,0.1L415,317.3c-15.7-5.3,30.8,9.9,25.5,25.6l100.6,94.1 C505,476.6,547.1,505.9,598,501z"/>
            </svg>
          </motion.a>
          
          {/* মেসেঞ্জার টুলটিপ */}
          <motion.div
            className="absolute right-16 top-2 bg-white px-4 py-2 rounded-lg shadow-md z-10 w-52 border border-blue-100"
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: showMessengerTooltip || pulseMessengerTooltip ? 1 : 0, 
              x: showMessengerTooltip || pulseMessengerTooltip ? 0 : -10 
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-gray-700 text-sm">
              <span className="font-medium">মেসেঞ্জারে মেসেজ করুন</span>
            </div>
            <div className="absolute top-3 right-[-6px] transform rotate-45 w-3 h-3 bg-white border-r border-t border-blue-100"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 