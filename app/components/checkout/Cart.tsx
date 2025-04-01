'use client';

import { useState, useEffect, useRef } from 'react';
import CartItem from './CartItem';
import CheckoutForm from './CheckoutForm';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export type CartItemType = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  variant: {
    size: string;
    color: string;
    price?: number;
    stock?: number;
  };
  weight?: number; // প্রোডাক্টের ওজন (কেজিতে)
  maxQuantity: number;
};

export type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  location: string; // 'inside_dhaka' অথবা 'outside_dhaka'
  deliveryMethod: string;
  deliveryCharge: number;
  paymentMethod: string;
};

export default function Cart() {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const orderReceiptRef = useRef<HTMLDivElement>(null);
  
  // প্রোডাক্টের মোট ওজন ক্যালকুলেট করা
  const calculateTotalWeight = () => {
    return cartItems.reduce((total, item) => {
      // যদি প্রোডাক্টের ওজন থাকে তবে যোগ করব, না থাকলে প্রতি আইটেমের জন্য ০.৫ কেজি ধরব (ডিফল্ট)
      const itemWeight = item.weight || 0.5;
      return total + (itemWeight * item.quantity);
    }, 0);
  };
  
  // মোট ওজন ক্যালকুলেট
  const totalWeight = calculateTotalWeight();
  
  // HTML কে ইমেজ হিসেবে সেভ করার ফাংশন
  const downloadOrderReceipt = async () => {
    if (!orderReceiptRef.current) return;
    
    try {
      // এখানে আমরা অস্থায়ীভাবে ওকেএলসিএইচ কালার সমস্যা সমাধান করছি
      const tempStyles = document.createElement('style');
      tempStyles.innerHTML = `
        * {
          color-scheme: light !important;
        }
        .text-green-500 { color: #10b981 !important; }
        .text-purple-600 { color: #9333ea !important; }
        .text-purple-500 { color: #a855f7 !important; }
        .bg-purple-50 { background-color: #faf5ff !important; }
        .bg-white { background-color: #ffffff !important; }
        .border-purple-200 { border-color: #e9d5ff !important; }
        .border-purple-100 { border-color: #f3e8ff !important; }
        .border-purple-300 { border-color: #d8b4fe !important; }
      `;
      
      // হেডে স্টাইল যোগ করি
      document.head.appendChild(tempStyles);
      
      // এখানে আমরা html2canvas লাইব্রেরি ইমপোর্ট করছি
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(orderReceiptRef.current, {
        scale: 2, // উচ্চ রেজোলিউশন
        useCORS: true, // Cross-Origin ইমেজ লোড করার জন্য
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true, // অপশনাল: কন্টেইনার রিমুভ করা হবে
        ignoreElements: (element) => {
          // সমস্যাযুক্ত এলিমেন্ট স্কিপ করা
          return false;
        }
      });
      
      // অস্থায়ী স্টাইল রিমুভ করি
      document.head.removeChild(tempStyles);
      
      // ক্যানভাস থেকে ইমেজ URL তৈরি করা
      const image = canvas.toDataURL('image/png');
      
      // ডাউনলোড লিংক তৈরি করা
      const link = document.createElement('a');
      link.href = image;
      link.download = `অর্ডার-রসিদ-${orderId}.png`;
      link.click();
    } catch (error) {
      console.error('অর্ডার রসিদ ডাউনলোড করতে সমস্যা:', error);
      alert('অর্ডার রসিদ ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };
  
  // অর্ডার সাকসেস হওয়ার পর স্বয়ংক্রিয়ভাবে ডাউনলোড করা
  useEffect(() => {
    if (orderSuccess && orderData) {
      // অর্ডার সাকসেস হওয়ার ১ সেকেন্ড পর অটো ডাউনলোড
      const timer = setTimeout(() => {
        downloadOrderReceipt();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [orderSuccess, orderData]);
  
  // চেকআউট সাবমিট করা
  const handleCheckoutSubmit = async (customerInfo: CustomerInfo) => {
    // বেস ডেলিভারি চার্জ ক্যালকুলেশন
    const baseDeliveryCharge = customerInfo.location === 'inside_dhaka' ? 100 : 120;
    
    // অতিরিক্ত ওজনের চার্জ ক্যালকুলেশন
    const weightCharge = Math.max(0, totalWeight - 1) * 20;
    
    // সবচেয়ে আপডেটেড ডেলিভারি চার্জ
    const totalDeliveryCharge = baseDeliveryCharge + weightCharge;
    
    // ডেলিভারি চার্জ আপডেট করা
    customerInfo.deliveryCharge = totalDeliveryCharge;
    
    // অর্ডার ডাটা তৈরি
    const orderData = {
      items: cartItems,
      customer: {
        name: customerInfo.name,
        email: customerInfo.email || `customer_${Date.now()}@example.com`,
        phone: customerInfo.phone
      },
      shippingAddress: {
        address: customerInfo.address,
        city: customerInfo.city || (customerInfo.location === 'inside_dhaka' ? 'ঢাকা' : 'অন্যান্য'),
        postalCode: customerInfo.postalCode || '',
        country: 'বাংলাদেশ',
        location: customerInfo.location // ঢাকার ভিতরে বা বাইরে
      },
      deliveryInfo: {
        deliveryCharge: totalDeliveryCharge,
        baseCharge: baseDeliveryCharge,
        weightCharge: weightCharge,
        totalWeight: totalWeight
      },
      totalAmount: cartTotal + totalDeliveryCharge,
      paymentMethod: customerInfo.paymentMethod,
      orderDate: new Date().toISOString()
    };
    
    try {
      // API কল করে অর্ডার সেভ করা
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'অর্ডার সেভ করতে সমস্যা হয়েছে');
      }
      
      // অর্ডার ডাটা স্টেটে সেভ করা
      setOrderData({...orderData, id: result.order.id});
      
      // অর্ডার সাকসেস মেসেজ দেখানো
      setOrderSuccess(true);
      setOrderId(result.order.id);
      
      // কার্ট খালি করা
      clearCart();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('অর্ডার সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      
      // এরর হলে ব্যাকআপ হিসেবে লোকাল স্টোরেজে সেভ করা
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const localOrderData = {
          ...orderData,
          orderId: `ORD-${Date.now()}`,
          orderDate: new Date().toISOString(),
          status: 'প্রক্রিয়াধীন'
        };
        orders.push(localOrderData);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // অর্ডার ডাটা স্টেটে সেভ করা
        setOrderData({...localOrderData});
        
        setOrderSuccess(true);
        setOrderId(localOrderData.orderId);
        clearCart();
      } catch (localError) {
        console.error('Local storage error:', localError);
        alert('অর্ডার সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    }
  };
  
  if (orderSuccess) {
    // অর্ডার সফল হলে যে পেজ দেখানো হবে
    return (
      <div className="max-w-4xl mx-auto my-6 bg-white rounded-lg shadow-md">
        <div ref={orderReceiptRef} className="p-6">
          <div className="text-center mb-6">
            <div className="mb-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-purple-600">অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h2>
            <p className="text-purple-500 mb-2">আপনার অর্ডার আইডি: <span className="font-semibold">{orderId}</span></p>
            <p className="text-purple-500 mb-2">অর্ডারের তারিখ: <span className="font-semibold">
              {orderData && new Date(orderData.orderDate).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span></p>
          </div>
          
          <div className="border-t border-b border-purple-200 py-4 mb-4">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">অর্ডার সামারি</h3>
            
            {/* অর্ডারকৃত প্রোডাক্টগুলোর তালিকা */}
            <div className="space-y-4 mb-4">
              {orderData && orderData.items.map((item: CartItemType, index: number) => (
                <div key={`${item.id}-${index}`} className="flex items-center border-b border-purple-100 pb-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                      sizes="64px"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="text-base font-medium text-purple-600">{item.title}</h4>
                    <div className="text-sm text-purple-500">
                      <span>পরিমাণ: {item.quantity} টি</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-600">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* কাস্টমার ইনফো */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-base font-semibold mb-2 text-purple-600">শিপিং ঠিকানা</h4>
                <p className="text-purple-500">{orderData?.customer.name}</p>
                <p className="text-purple-500">{orderData?.shippingAddress.address}</p>
                <p className="text-purple-500">
                  {orderData?.shippingAddress.city}, {orderData?.shippingAddress.country}
                </p>
                <p className="text-purple-500">ফোন: {orderData?.customer.phone}</p>
              </div>
              <div>
                <h4 className="text-base font-semibold mb-2 text-purple-600">পেমেন্ট এবং ডেলিভারি</h4>
                <p className="text-purple-500">
                  পেমেন্ট মেথড: <span className="font-medium">ক্যাশ অন ডেলিভারি</span>
                </p>
                <p className="text-purple-500">
                  ডেলিভারি লোকেশন: <span className="font-medium">
                    {orderData?.shippingAddress.location === 'inside_dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}
                  </span>
                </p>
                <p className="text-purple-500">
                  মোট ওজন: <span className="font-medium">{orderData?.deliveryInfo.totalWeight.toFixed(1)} কেজি</span>
                </p>
              </div>
            </div>
            
            {/* মূল্য বিবরণ */}
            <div className="bg-purple-50 p-4 rounded">
              <div className="space-y-2 text-purple-600">
                <div className="flex justify-between">
                  <span>পণ্যের মূল্য (সাবটোটাল):</span>
                  <span>৳{orderData?.totalAmount - orderData?.deliveryInfo.deliveryCharge}</span>
                </div>
                
                <div className="pl-4 text-sm text-purple-500">
                  <div className="flex justify-between">
                    <span>বেস ডেলিভারি চার্জ:</span>
                    <span>৳{orderData?.deliveryInfo.baseCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>অতিরিক্ত ওজনের চার্জ:</span>
                    <span>৳{orderData?.deliveryInfo.weightCharge}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-semibold text-purple-600">
                  <span>মোট ডেলিভারি চার্জ:</span>
                  <span>৳{orderData?.deliveryInfo.deliveryCharge}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg text-purple-600 pt-2 border-t border-purple-300">
                  <span>সর্বমোট পরিশোধযোগ্য:</span>
                  <span>৳{orderData?.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-purple-500 mb-4">
            <p>অর্ডার সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের হটলাইন নাম্বারে কল করুন:</p>
            <p className="font-semibold">+৮৮ ০১৯২০৬৬০৫৯১</p>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-b-lg flex flex-col sm:flex-row justify-between items-center">
          <button 
            onClick={downloadOrderReceipt}
            className="bg-pink-600 text-white py-2 px-6 rounded-full hover:bg-pink-700 transition-colors mb-3 sm:mb-0 w-full sm:w-auto"
          >
            অর্ডার রসিদ ডাউনলোড করুন
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/" className="text-center bg-purple-200 text-purple-600 py-2 px-6 rounded-full hover:bg-purple-300 transition-colors w-full sm:w-auto">
              হোম পেজে ফিরে যান
            </Link>
            <Link href="/products" className="text-center bg-pink-100 text-pink-700 py-2 px-6 rounded-full hover:bg-pink-200 transition-colors w-full sm:w-auto">
              আরও শপিং করুন
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md text-center">
        <div className="mb-6 text-purple-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-purple-600 mb-4">আপনার কার্ট খালি আছে</h2>
        <p className="text-purple-500 mb-6">কার্টে প্রোডাক্ট যোগ করে অর্ডার করুন।</p>
        <Link 
          href="/products"
          className="bg-pink-600 text-white py-2 px-6 rounded-full hover:bg-pink-700 transition-colors"
        >
          প্রোডাক্ট দেখুন
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto my-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-purple-600">আপনার কার্ট</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-purple-600">কার্ট আইটেম ({cartItems.length})</h2>
            
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <CartItem
                  key={`${item.id}-${item.variant.size}-${item.variant.color}-${index}`}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  quantity={item.quantity}
                  image={item.image}
                  variant={item.variant}
                  maxQuantity={item.maxQuantity || item.variant.stock || 10} // স্টক অনুযায়ী ম্যাক্স কোয়ান্টিটি সেট করা
                  onUpdateQuantity={(id, quantity) => updateCartItemQuantity(id, quantity, item.variant.size, item.variant.color)}
                  onRemove={(id) => removeFromCart(id, item.variant.size, item.variant.color)}
                />
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700"
              >
                কার্ট খালি করুন
              </button>
              
              <div className="text-xl font-semibold">
                সর্বমোট: <span className="text-pink-600">৳{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-5">
          <CheckoutForm 
            subtotal={cartTotal} 
            onSubmit={handleCheckoutSubmit}
            totalWeight={totalWeight}
          />
        </div>
      </div>
    </div>
  );
} 