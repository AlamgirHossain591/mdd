'use client';

import { useState } from 'react';
import { CustomerInfo } from './Cart';

interface CheckoutFormProps {
  subtotal: number;
  onSubmit: (customerInfo: CustomerInfo) => void;
  totalWeight?: number; // প্রোডাক্টগুলোর মোট ওজন কেজিতে
}

export default function CheckoutForm({ subtotal, onSubmit, totalWeight = 0 }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    location: 'inside_dhaka', // 'inside_dhaka' অথবা 'outside_dhaka'
    deliveryMethod: 'standard',
    deliveryCharge: 100, // ডিফল্ট চার্জ ঢাকার ভিতরে
    paymentMethod: 'cash'
  });
  
  // ডেলিভারি চার্জ ক্যালকুলেশন
  const calculateDeliveryCharge = (location: string) => {
    // বেস চার্জ (ঢাকার ভিতরে ১০০, বাইরে ১২০)
    const baseCharge = location === 'inside_dhaka' ? 100 : 120;
    
    // প্রতি কেজির জন্য অতিরিক্ত ২০ টাকা
    const weightCharge = Math.max(0, totalWeight - 1) * 20; // প্রথম কেজি ফ্রি, এর পরে প্রতি কেজি ২০ টাকা
    
    return baseCharge + weightCharge;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'location') {
      // লোকেশন পরিবর্তন হলে ডেলিভারি চার্জ আপডেট করা
      const newDeliveryCharge = calculateDeliveryCharge(value);
      setFormData({
        ...formData,
        [name]: value,
        deliveryCharge: newDeliveryCharge
      });
    } else if (name === 'phone') {
      // ফোন নাম্বারের জন্য শুধু সংখ্যা এবং সর্বোচ্চ ১১ ডিজিট অনুমতি দেওয়া
      const phoneNumber = value.replace(/\D/g, '');
      setFormData({
        ...formData,
        [name]: phoneNumber.slice(0, 11)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ফোন নাম্বার ভ্যালিডেশন (১১ সংখ্যা এবং 01 দিয়ে শুরু)
    const phonePattern = /^01\d{9}$/;
    if (!phonePattern.test(formData.phone)) {
      alert('অনুগ্রহ করে সঠিক বাংলাদেশী মোবাইল নাম্বার দিন (১১ ডিজিট এবং 01 দিয়ে শুরু হতে হবে)');
      return;
    }
    
    // ইমেইল, শহর, পোস্টাল কোড ফিল্ড না থাকলেও CustomerInfo এর জন্য ডিফল্ট ভ্যালু সেট করে দেওয়া
    formData.email = formData.email || `customer_${Date.now()}@example.com`;
    formData.city = formData.city || (formData.location === 'inside_dhaka' ? 'ঢাকা' : 'অন্যান্য');
    formData.postalCode = formData.postalCode || '';
    onSubmit(formData);
  };
  
  // বেস ডেলিভারি চার্জ ক্যালকুলেশন
  const baseDeliveryCharge = formData.location === 'inside_dhaka' ? 100 : 120;
  
  // অতিরিক্ত ওজনের চার্জ ক্যালকুলেশন
  const weightCharge = Math.max(0, totalWeight - 1) * 20;
  
  // সবচেয়ে আপডেটেড ডেলিভারি চার্জ নিশ্চিত করা
  const totalDeliveryCharge = baseDeliveryCharge + weightCharge;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-lg border border-purple-100">
      <h2 className="text-2xl font-bold mb-6 text-purple-700 pb-2 border-b border-purple-200">অর্ডার কনফার্মেশন</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* নাম */}
          <div>
            <label htmlFor="name" className="block text-purple-700 font-semibold mb-2 text-base">আপনার নাম <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm text-purple-800 font-medium text-base"
              required
              placeholder="নাম লিখুন"
            />
          </div>
          
          {/* ফোন */}
          <div>
            <label htmlFor="phone" className="block text-purple-700 font-semibold mb-2 text-base">ফোন নাম্বার <span className="text-red-500">*</span></label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm text-purple-800 font-medium text-base"
              required
              placeholder="01XXXXXXXXX"
              maxLength={11}
              pattern="01[0-9]{9}"
              title="বাংলাদেশী মোবাইল নাম্বার ১১ ডিজিটের হতে হবে এবং 01 দিয়ে শুরু হতে হবে"
            />
          </div>
          
          {/* ঠিকানা */}
          <div>
            <label htmlFor="address" className="block text-purple-700 font-semibold mb-2 text-base">বিস্তারিত ঠিকানা <span className="text-red-500">*</span></label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm text-purple-800 font-medium text-base"
              required
              placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
            ></textarea>
          </div>
          
          {/* লোকেশন (ঢাকার ভিতরে/বাইরে) */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-200">
            <label className="block text-purple-700 font-semibold mb-3 text-base">ডেলিভারি লোকেশন <span className="text-red-500">*</span></label>
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  id="inside_dhaka"
                  name="location"
                  value="inside_dhaka"
                  checked={formData.location === 'inside_dhaka'}
                  onChange={handleChange}
                  className="mr-3 h-5 w-5 text-purple-600 focus:ring-purple-500"
                  required
                />
                <label htmlFor="inside_dhaka" className="flex justify-between w-full cursor-pointer">
                  <span className="font-semibold text-purple-700 text-base">ঢাকার ভিতরে</span>
                  <span className="font-bold text-purple-700">৳100</span>
                </label>
              </div>
              <div className="flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  id="outside_dhaka"
                  name="location"
                  value="outside_dhaka"
                  checked={formData.location === 'outside_dhaka'}
                  onChange={handleChange}
                  className="mr-3 h-5 w-5 text-purple-600 focus:ring-purple-500"
                  required
                />
                <label htmlFor="outside_dhaka" className="flex justify-between w-full cursor-pointer">
                  <span className="font-semibold text-purple-700 text-base">ঢাকার বাইরে</span>
                  <span className="font-bold text-purple-700">৳120</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* পেমেন্ট মেথড */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-200">
            <label className="block text-purple-700 font-semibold mb-3 text-base">পেমেন্ট মেথড <span className="text-red-500">*</span></label>
            <div className="p-3 rounded-lg border border-purple-200 bg-purple-50">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cash"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="mr-3 h-5 w-5 text-purple-600 focus:ring-purple-500"
                  required
                />
                <label htmlFor="cash" className="font-semibold text-purple-700 cursor-pointer text-base">ক্যাশ অন ডেলিভারি</label>
              </div>
            </div>
          </div>
          
          {/* আর্ডার সামারি */}
          <div className="mt-8 pt-4 bg-gradient-to-r from-purple-100 to-pink-50 p-5 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-purple-700">অর্ডার সামারি</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-purple-700 font-medium">
                <span>পণ্যের মূল্য:</span>
                <span className="font-bold">৳{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="pl-4 text-base text-purple-700">
                <div className="flex justify-between">
                  <span>বেস ডেলিভারি চার্জ:</span>
                  <span className="font-medium">৳{baseDeliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span>অতিরিক্ত ওজনের চার্জ:</span>
                  <span className="font-medium">৳{weightCharge}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-semibold text-purple-700">
                <span>মোট ডেলিভারি চার্জ:</span>
                <span>৳{totalDeliveryCharge.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg text-purple-700 pt-3 mt-2 border-t border-purple-200">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span>৳{(subtotal + totalDeliveryCharge).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            অর্ডার কনফার্ম করুন
          </button>
        </div>
      </form>
    </div>
  );
} 