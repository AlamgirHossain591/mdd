'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalOrders: number;
  totalSpent: string;
  lastOrderDate: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load customers from localStorage
  useEffect(() => {
    try {
      // First check if orders exist to extract customer data
      const ordersJSON = localStorage.getItem('orders');
      
      if (ordersJSON) {
        const orders = JSON.parse(ordersJSON);
        
        // Create a map to track unique customers and their stats
        const customerMap = new Map();
        
        orders.forEach((order: any) => {
          const { customer, totalAmount, date } = order;
          
          // কাস্টমার ফোন নাম্বার পাওয়া
          const customerPhone = customer?.phone || '';
          
          if (customerMap.has(customerPhone)) {
            // Update existing customer data
            const existingCustomer = customerMap.get(customerPhone);
            existingCustomer.totalOrders += 1;
            
            // Add to total spent (remove currency symbol and commas)
            let totalNumeric = 0;
            if (totalAmount) {
              if (typeof totalAmount === 'string') {
                totalNumeric = parseFloat(totalAmount.replace('৳', '').replace(/,/g, '')) || 0;
              } else if (typeof totalAmount === 'number') {
                totalNumeric = totalAmount;
              }
            }
            let currentSpent = 0;
            if (typeof existingCustomer.totalSpent === 'string') {
              currentSpent = parseFloat(existingCustomer.totalSpent.replace('৳', '').replace(/,/g, '')) || 0;
            } else if (typeof existingCustomer.totalSpent === 'number') {
              currentSpent = existingCustomer.totalSpent;
            }
            
            existingCustomer.totalSpent = '৳' + (currentSpent + totalNumeric).toLocaleString('bn-BD');
            
            // Update last order date if this order is more recent
            if (date && new Date(date) > new Date(existingCustomer.lastOrderDate || '2000-01-01')) {
              existingCustomer.lastOrderDate = date;
            }
          } else {
            // Create new customer entry
            let totalNumeric = 0;
            if (totalAmount) {
              if (typeof totalAmount === 'string') {
                totalNumeric = parseFloat(totalAmount.replace('৳', '').replace(/,/g, '')) || 0;
              } else if (typeof totalAmount === 'number') {
                totalNumeric = totalAmount;
              }
            }
            
            // কাস্টমারের নাম এবং তথ্য পাওয়া
            const customerName = typeof customer === 'string' ? customer : (customer?.name || 'অজানা গ্রাহক');
            const customerEmail = customer?.email || '';
            const customerAddress = order.shippingAddress?.address || customer?.address || 'অজানা';
            
            customerMap.set(customerPhone, {
              id: 'CUST' + (customerPhone ? customerPhone.substring(Math.max(0, customerPhone.length - 4)) : Math.floor(Math.random() * 10000).toString().padStart(4, '0')),
              name: customerName,
              phone: customerPhone || 'অজানা',
              email: customerEmail,
              address: customerAddress,
              totalOrders: 1,
              totalSpent: '৳' + totalNumeric.toLocaleString('bn-BD'),
              lastOrderDate: date || 'অজানা'
            });
          }
        });
        
        // Convert map values to array and set state
        setCustomers(Array.from(customerMap.values()));
      } else {
        // If no orders, create some sample customers
        const defaultCustomers = [
          {
            id: 'CUST1234',
            name: 'রহিম আহমেদ',
            phone: '০১৭১২৩৪৫৬৭৮',
            email: 'rahim@example.com',
            address: 'বাড়ি #১২, রোড #৫, ব্লক-বি, বনশ্রী, ঢাকা',
            totalOrders: 3,
            totalSpent: '৳১২,৫০০',
            lastOrderDate: '২০/০৩/২০২৪'
          },
          {
            id: 'CUST5678',
            name: 'সালমা খাতুন',
            phone: '০১৯১২৩৪৫৬৭৮',
            address: 'বাসা #৭, রোড #৪, সেকশন-৬, মিরপুর, ঢাকা',
            totalOrders: 2,
            totalSpent: '৳৭,৮০০',
            lastOrderDate: '১৮/০৩/২০২৪'
          },
          {
            id: 'CUST9012',
            name: 'করিম খান',
            phone: '০১৮১২৩৪৫৬৭৮',
            email: 'karim@example.com',
            address: 'ফ্ল্যাট #৫, বাড়ি #৮, রোড #১১, গুলশান-২, ঢাকা',
            totalOrders: 1,
            totalSpent: '৳২,৯০০',
            lastOrderDate: '১৯/০৩/২০২৪'
          }
        ];
        
        setCustomers(defaultCustomers);
        localStorage.setItem('customers', JSON.stringify(defaultCustomers));
      }
    } catch (error) {
      console.error('Error loading customers from localStorage:', error);
    }
  }, []);

  const filteredCustomers = customers.filter(customer => 
    (customer.name && typeof customer.name === 'string' && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.id && typeof customer.id === 'string' && customer.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && typeof customer.phone === 'string' && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.email && typeof customer.email === 'string' && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="flex-1 p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">গ্রাহকবৃন্দ</h1>
          <div>
            <input
              type="text"
              placeholder="গ্রাহক খুঁজুন..."
              className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">আইডি</th>
                <th className="py-2 px-4 text-left">নাম</th>
                <th className="py-2 px-4 text-left">ফোন</th>
                <th className="py-2 px-4 text-left">ঠিকানা</th>
                <th className="py-2 px-4 text-left">মোট অর্ডার</th>
                <th className="py-2 px-4 text-left">মোট খরচ</th>
                <th className="py-2 px-4 text-left">সর্বশেষ অর্ডার</th>
                <th className="py-2 px-4 text-left">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{customer.id}</td>
                  <td className="py-3 px-4">{customer.name}</td>
                  <td className="py-3 px-4">{customer.phone}</td>
                  <td className="py-3 px-4 truncate max-w-[200px]" title={customer.address}>
                    {customer.address}
                  </td>
                  <td className="py-3 px-4 text-center">{customer.totalOrders}</td>
                  <td className="py-3 px-4 font-medium">{customer.totalSpent}</td>
                  <td className="py-3 px-4">{customer.lastOrderDate}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => {
                        window.location.href = `/dashboard/customers/view/${customer.id}`;
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      দেখুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">কোন গ্রাহক পাওয়া যায়নি</p>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            মোট {filteredCustomers.length} জন গ্রাহক
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded text-sm bg-gray-200">পূর্ববর্তী</button>
            <button className="px-3 py-1 border rounded text-sm bg-pink-500 text-white">১</button>
            <button className="px-3 py-1 border rounded text-sm">২</button>
            <button className="px-3 py-1 border rounded text-sm">৩</button>
            <button className="px-3 py-1 border rounded text-sm">পরবর্তী</button>
          </div>
        </div>
      </div>
    </div>
  );
} 