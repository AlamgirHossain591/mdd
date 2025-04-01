'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { CartContext } from '../context/CartContext';

export default function CheckoutForm() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'বাংলাদেশ',
    paymentMethod: 'ক্যাশ অন ডেলিভারি'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ফর্ম ভ্যালিডেশন
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      setError('অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }
    
    if (cart.length === 0) {
      setError('আপনার কার্টে কোন পণ্য নেই');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // অর্ডার তৈরি করার জন্য ডাটা প্রস্তুত করা
      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant
        })),
        totalAmount: totalPrice,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      };
      
      // API কল করে অর্ডার তৈরি করা
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'অর্ডার করতে সমস্যা হয়েছে');
      }
      
      // সফল অর্ডার
      setSuccess('অর্ডার সফলভাবে সম্পন্ন হয়েছে! অর্ডার আইডি: ' + data.order.id);
      
      // কার্ট পরিষ্কার করা
      clearCart();
      
      // ৩ সেকেন্ড পর হোমপেজে ফিরে যাওয়া
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (err: any) {
      console.error('অর্ডার করতে সমস্যা:', err);
      setError(err.message || 'অর্ডার করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">শিপিং এবং পেমেন্ট তথ্য</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">
              নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">
              ফোন নাম্বার <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">
              ইমেইল (অপশনাল)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">
              শহর <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">
              ঠিকানা <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">
              পোস্টাল কোড
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">
              দেশ
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              readOnly
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">
              পেমেন্ট মেথড
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="ক্যাশ অন ডেলিভারি">ক্যাশ অন ডেলিভারি</option>
              <option value="বিকাশ">বিকাশ</option>
              <option value="নগদ">নগদ</option>
              <option value="রকেট">রকেট</option>
            </select>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 transition disabled:opacity-60"
          >
            {loading ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
          </button>
        </div>
      </form>
    </div>
  );
} 