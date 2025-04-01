'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

type ProductVariant = {
  size: string;
  color: string;
  price: number;
  stock: number;
};

export default function ProductClient({ product }: { product: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  
  // টুলটিপ স্টেট
  const [showWhatsappTooltip, setShowWhatsappTooltip] = useState(false);
  const [showMessengerTooltip, setShowMessengerTooltip] = useState(false);
  const [pulseWhatsappTooltip, setPulseWhatsappTooltip] = useState(false);
  const [pulseMessengerTooltip, setPulseMessengerTooltip] = useState(false);
  const [showCartTooltip, setShowCartTooltip] = useState(false);
  const [pulseCartTooltip, setPulseCartTooltip] = useState(false);
  const [cartBackgroundColor, setCartBackgroundColor] = useState('from-pink-600 to-yellow-500');
  const [cartTooltipText, setCartTooltipText] = useState('পছন্দ করা গুলো কার্টে যোগ করুন');
  
  // ভেরিয়েন্ট সিলেকশন এর জন্য স্টেট
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  
  // প্রাথমিক ভেরিয়েন্ট সিলেকশন
  useEffect(() => {
    if (!product?.variants) return;
    
    const inStockVariant = product.variants.find((variant: ProductVariant) => variant.stock > 0);
    if (inStockVariant) {
      setSelectedVariant(inStockVariant);
      setSelectedColor(inStockVariant.color);
      setSelectedSize(inStockVariant.size);
    } else if (product.variants[0]) {
      setSelectedVariant(product.variants[0]);
      setSelectedColor(product.variants[0].color);
      setSelectedSize(product.variants[0].size);
    }
  }, [product]);
  
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
  
  // ইউনিক কালার ও সাইজ পাওয়ার জন্য ফাংশন
  const uniqueColors = [...new Set(product.variants.map((v: any) => v.color))] as string[];
  const uniqueSizes = [...new Set(product.variants.map((v: any) => v.size))] as string[];
  
  // কার্টে যোগ করার ফাংশন
  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    addToCart(
      product.id,
      selectedVariant,
      quantity,
      product.title,
      product.image
    );
    
    // আপডেট করা হয়েছে
    setIsAddedToCart(true);
    
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
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/products" className="text-pink-600 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            সব প্রোডাক্ট
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* প্রোডাক্ট ইমেজ */}
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.discountedPrice && (
                <div className="absolute top-3 right-3 bg-pink-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                  {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% ছাড়
                </div>
              )}
            </div>
            
            {/* প্রোডাক্ট ডিটেইলস */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
              
              <div className="flex items-center mb-4">
                {product.ratings && (
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(product.ratings || 0) ? (
                          "★"
                        ) : i < Math.ceil(product.ratings || 0) && (product.ratings || 0) % 1 !== 0 ? (
                          "★"
                        ) : (
                          <span className="text-gray-300">★</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {product.reviewCount && (
                  <span className="text-gray-600">({product.reviewCount} রিভিউ)</span>
                )}
              </div>
              
              <div className="mb-6">
                {product.discountedPrice ? (
                  <div className="flex items-center">
                    <span className="text-gray-400 line-through text-lg mr-2">৳{product.price}</span>
                    <span className="text-2xl font-bold text-pink-600">৳{product.discountedPrice}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-pink-600">৳{product.price}</span>
                )}
              </div>
              
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">বিবরণ</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}
              
              {/* কালার অপশন */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">কালার</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border ${
                        selectedColor === color ? 'ring-2 ring-pink-600' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              {/* সাইজ অপশন */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">সাইজ</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map(size => (
                    <button
                      key={size}
                      className={`px-4 py-2 border rounded ${
                        selectedSize === size 
                        ? 'bg-pink-600 text-white border-pink-600' 
                        : 'border-gray-300 hover:border-pink-600'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* পরিমাণ বাছাই */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">পরিমাণ</h3>
                <div className="flex items-center">
                  <button 
                    className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center text-xl"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="w-12 h-10 border-t border-b border-gray-300 flex items-center justify-center">
                    {quantity}
                  </div>
                  <button 
                    className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center text-xl"
                    onClick={() => setQuantity(prev => Math.min(selectedVariant?.stock || 1, prev + 1))}
                    disabled={!selectedVariant || quantity >= selectedVariant.stock}
                  >
                    +
                  </button>
                  
                  <span className="ml-4 text-gray-500">
                    {selectedVariant?.stock || 0} পিস স্টকে আছে
                  </span>
                </div>
              </div>
              
              {/* একশন বাটন */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors flex-1"
                >
                  কার্টে যোগ করুন
                </button>
                
                <Link href="/checkout" className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors flex-1 text-center">
                  এখনই কিনুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
            href={product ? `https://wa.me/+8801920660591?text=আমি+আপনার+ওয়েবসাইটে+${encodeURIComponent(product.title)}+প্রোডাক্টটি+দেখছি।+দাম:+৳${(product.discountedPrice || product.price)}।+এই+পণ্য+সম্পর্কে+বিস্তারিত+জানতে+চাই।` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BD5C] transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setShowWhatsappTooltip(true)}
            onMouseLeave={() => setShowWhatsappTooltip(false)}
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
            href={product ? `https://m.me/AyyanFashion?text=আমি+আপনার+ওয়েবসাইটে+${encodeURIComponent(product.title)}+প্রোডাক্টটি+দেখছি।+দাম:+৳${(product.discountedPrice || product.price)}।+এই+পণ্য+সম্পর্কে+বিস্তারিত+জানতে+চাই।` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#00B2FF] to-[#006AFF] text-white shadow-lg hover:from-[#00B2FF] hover:to-[#0055FF] transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setShowMessengerTooltip(true)}
            onMouseLeave={() => setShowMessengerTooltip(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="28px" height="28px">
              <radialGradient id="messengerGradient" cx="50%" cy="50%" r="50%" fx="10%" fy="10%">
                <stop offset="0%" stopColor="#00C6FF" />
                <stop offset="60%" stopColor="#0078FF" />
                <stop offset="100%" stopColor="#0068FF" />
              </radialGradient>
              <path fill="#FFFFFF" d="M400,0C174.7,0,0,165.1,0,388c0,116.6,47.8,217.4,125.6,287c6.5,5.8,10.5,14,10.7,22.8l2.2,71.2c0.7,22.7,24.1,37.5,44.9,28.3 l79.4-27.8c7.5-2.6,15.8-2.2,23,1.1c34.5,14,72.7,21.4,114.2,21.4c225.3,0,400-165.1,400-388S625.3,0,400,0z M217,501l-93,165 c-5.7,10.1-20,8.9-24.4-2.1L2.1,424.7c-4.5-11.3,5.8-22.3,17.1-18.5l95.8,32.1c13.8,4.6,28,4.7,41.8,0.1L400,317.3 c15.7-5.3,30.8,9.9,25.5,25.6L324.9,437.1C310,476.6,267.9,505.9,217,501z M598,501l93,165c5.7,10.1,20,8.9,24.4-2.1l97.5-239.2 c4.5-11.3-5.8-22.3-17.1-18.5l-95.8,32.1c-13.8,4.6,28,4.7,41.8,0.1L415,317.3c-15.7-5.3,30.8,9.9,25.5,25.6l100.6,94.1 C505,476.6,547.1,505.9,598,501z"/>
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