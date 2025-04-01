'use client';

import { RiShoppingBag3Line, RiUserLine, RiCurrencyLine, RiFileListLine } from 'react-icons/ri';

// স্ট্যাটিক কার্ড ডাটা
const overviewCards = [
  {
    title: 'মোট বিক্রয়',
    value: '১২,৫৬৭',
    change: '+১৫%',
    icon: RiShoppingBag3Line,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'মোট গ্রাহক',
    value: '১,২৩৪',
    change: '+৭%',
    icon: RiUserLine,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'মোট আয়',
    value: '৳১,৫৬,৭৮৯',
    change: '+১২%',
    icon: RiCurrencyLine,
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'মোট অর্ডার',
    value: '৩,৪৫৬',
    change: '+৯%',
    icon: RiFileListLine,
    color: 'bg-pink-100 text-pink-600'
  }
];

// সম্প্রতি অর্ডার ডাটা
const recentOrders = [
  { id: '#ORD-1001', customer: 'সাকিব হাসান', date: '০৫/০৮/২০২৩', status: 'সম্পন্ন', amount: '৳৩,৪৫০' },
  { id: '#ORD-1002', customer: 'মেহজাবিন চৌধুরী', date: '০৫/০৮/২০২৩', status: 'প্রক্রিয়াধীন', amount: '৳১,৮৯০' },
  { id: '#ORD-1003', customer: 'তানভীর আহমেদ', date: '০৪/০৮/২০২৩', status: 'বাতিল', amount: '৳৪,২০০' },
  { id: '#ORD-1004', customer: 'সাবরিনা নাহার', date: '০৪/০৮/২০২৩', status: 'প্রক্রিয়াধীন', amount: '৳২,৭৮০' },
  { id: '#ORD-1005', customer: 'রাকিব হাসান', date: '০৩/০৮/২০২৩', status: 'সম্পন্ন', amount: '৳৯৯০' },
];

// শীর্ষ পণ্য ডাটা
const topProducts = [
  { name: 'প্রিমিয়াম সিল্ক শাড়ি', sales: '৪৫৬', revenue: '৳৩,৪৫,০০০' },
  { name: 'লেডিস কুর্তি সেট', sales: '৩৮৭', revenue: '৳২,৭০,৯০০' },
  { name: 'ম্যানস কটন পাঞ্জাবি', sales: '৩৪৫', revenue: '৳২,৫৮,৭৫০' },
  { name: 'কিডস ড্রেস', sales: '৩০১', revenue: '৳১,৫০,৫০০' },
  { name: 'জারদৌসি লেহেঙ্গা', sales: '২৭৮', revenue: '৳৪,১৭,০০০' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* পেজ টাইটেল */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">ড্যাশবোর্ড</h1>
        <p className="mt-1 text-sm text-gray-600">আপনার বিজনেস পারফরম্যান্স ওভারভিউ দেখুন</p>
      </div>

      {/* স্ট্যাটস কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">{card.title}</span>
                <span className="text-2xl font-semibold mt-1">{card.value}</span>
                <span className="text-sm font-medium text-green-600 mt-1">{card.change} গত মাস থেকে</span>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* চার্ট এবং টেবিল সেকশন */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* সম্প্রতি অর্ডার */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">সম্প্রতি অর্ডার</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অর্ডার আইডি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">গ্রাহক</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'সম্পন্ন' ? 'bg-green-100 text-green-800' : 
                          order.status === 'প্রক্রিয়াধীন' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 text-center">
            <button className="text-sm font-medium text-pink-600 hover:text-pink-500">সব অর্ডার দেখুন</button>
          </div>
        </div>

        {/* শীর্ষ বিক্রয় পণ্য */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">শীর্ষ বিক্রিত পণ্য</h2>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <li key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">বিক্রয়: {product.sales}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{product.revenue}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border-t border-gray-200 text-center">
            <button className="text-sm font-medium text-pink-600 hover:text-pink-500">সকল পণ্য দেখুন</button>
          </div>
        </div>
      </div>
    </div>
  );
} 