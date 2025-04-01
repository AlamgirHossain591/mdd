'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

type Order = {
  id: string;
  customer: string;
  phone: string;
  items: string;
  total: string;
  status: string;
  statusColor: string;
  date: string;
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        // Try to get customer data from localStorage
        const customersJSON = localStorage.getItem('customers');
        const ordersJSON = localStorage.getItem('orders');
        
        if (customersJSON) {
          const customers = JSON.parse(customersJSON);
          const foundCustomer = customers.find((c: Customer) => c.id === id);
          
          if (foundCustomer) {
            setCustomer(foundCustomer);
            
            // If orders exist, find orders for this customer
            if (ordersJSON) {
              const allOrders = JSON.parse(ordersJSON);
              const customerOrders = allOrders.filter((o: Order) => o.phone === foundCustomer.phone);
              setCustomerOrders(customerOrders);
            }
          } else {
            // If not found in customers, try to find from orders data
            if (ordersJSON) {
              const allOrders = JSON.parse(ordersJSON);
              const customerOrders = allOrders.filter((o: Order) => o.id === id);
              
              if (customerOrders.length > 0) {
                const order = customerOrders[0];
                
                // Create customer from order
                const customer = {
                  id: id,
                  name: order.customer,
                  phone: order.phone,
                  address: order.address || '',
                  totalOrders: customerOrders.length,
                  totalSpent: calculateTotalSpent(customerOrders),
                  lastOrderDate: order.date
                };
                
                setCustomer(customer);
                setCustomerOrders(customerOrders);
              } else {
                setError('গ্রাহক খুঁজে পাওয়া যায়নি');
              }
            } else {
              setError('গ্রাহক খুঁজে পাওয়া যায়নি');
            }
          }
        } else {
          setError('গ্রাহকের তথ্য খুঁজে পাওয়া যায়নি');
        }
      } catch (err) {
        console.error('Error loading customer data:', err);
        setError('গ্রাহকের তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomerData();
  }, [id]);
  
  const calculateTotalSpent = (orders: Order[]) => {
    const total = orders.reduce((sum, order) => {
      const orderAmount = parseInt(order.total.replace('৳', '').replace(/,/g, '')) || 0;
      return sum + orderAmount;
    }, 0);
    
    return '৳' + total.toLocaleString('bn-BD');
  };
  
  const getStatusBadge = (status: string, color: string) => {
    const colorMap: Record<string, string> = {
      'green': 'bg-green-100 text-green-700',
      'blue': 'bg-blue-100 text-blue-700',
      'yellow': 'bg-yellow-100 text-yellow-700',
      'red': 'bg-red-100 text-red-700'
    };
    
    return (
      <span className={`${colorMap[color]} py-1 px-2 rounded-full text-xs`}>
        {status}
      </span>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }
  
  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">গ্রাহক পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-6">{error || 'আপনি যে গ্রাহক খুঁজছেন তা পাওয়া যায়নি।'}</p>
          <Link 
            href="/dashboard/customers" 
            className="inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
          >
            গ্রাহক তালিকায় ফিরে যান
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-pink-600">আয়ান ফ্যাশন</h2>
            <p className="text-sm text-gray-600">এডমিন প্যানেল</p>
          </div>
          
          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              ড্যাশবোর্ড
            </Link>
            
            <Link href="/dashboard/products" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              পণ্যসমূহ
            </Link>
            
            <Link href="/dashboard/orders" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              অর্ডারসমূহ
            </Link>
            
            <Link href="/dashboard/customers" className="block px-4 py-2 rounded bg-pink-100 text-pink-600">
              গ্রাহকবৃন্দ
            </Link>
            
            <button className="w-full text-left px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              সেটিংস
            </button>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">গ্রাহকের বিবরণ</h1>
                <p className="text-gray-600">গ্রাহক আইডি: {customer.id}</p>
              </div>
              <Link href="/dashboard/customers" className="text-pink-600 hover:text-pink-800">
                ← গ্রাহক তালিকায় ফিরে যান
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">ব্যক্তিগত তথ্য</h2>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">নাম:</span>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ফোন:</span>
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ইমেইল:</span>
                        <span>{customer.email}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 block mb-1">ঠিকানা:</span>
                      <span className="block ml-4">{customer.address}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">অর্ডার সংক্রান্ত তথ্য</h2>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">মোট অর্ডার:</span>
                      <span className="font-medium">{customer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">মোট খরচ:</span>
                      <span className="font-bold text-pink-600">{customer.totalSpent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">সর্বশেষ অর্ডার:</span>
                      <span>{customer.lastOrderDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">অর্ডার ইতিহাস</h2>
            
            {customerOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">অর্ডার আইডি</th>
                      <th className="py-2 px-4 text-left">তারিখ</th>
                      <th className="py-2 px-4 text-left">পণ্য</th>
                      <th className="py-2 px-4 text-left">মূল্য</th>
                      <th className="py-2 px-4 text-left">স্ট্যাটাস</th>
                      <th className="py-2 px-4 text-left">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((order, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{order.id}</td>
                        <td className="py-3 px-4">{order.date}</td>
                        <td className="py-3 px-4">{order.items}</td>
                        <td className="py-3 px-4 font-medium">{order.total}</td>
                        <td className="py-3 px-4">
                          {getStatusBadge(order.status, order.statusColor)}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/orders/view/${order.id}`} className="text-blue-600 hover:text-blue-800">
                            দেখুন
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500">এই গ্রাহকের কোন অর্ডার ইতিহাস নেই</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 