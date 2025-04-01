'use client';

import Cart from '../components/checkout/Cart';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-purple-800 mb-3">চেকআউট</h1>
          <p className="text-lg text-purple-600">আপনার অর্ডার কনফার্ম করুন</p>
        </div>
        <Cart />
      </div>
    </div>
  );
} 