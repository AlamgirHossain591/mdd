'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  title: string;
  price: string;
  category: string;
  stock: number;
  image: string;
};

type OrderItem = {
  productId: string;
  title: string;
  quantity: number;
  price: string;
};

export default function AddOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [status, setStatus] = useState('প্রসেসিং');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const statuses = ['প্রসেসিং', 'ডেলিভারি', 'সম্পন্ন', 'বাতিল'];
  
  useEffect(() => {
    // Load products from localStorage
    try {
      const productsJSON = localStorage.getItem('products');
      if (productsJSON) {
        const loadedProducts = JSON.parse(productsJSON);
        setProducts(loadedProducts);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('পণ্যসমূহ লোড করতে সমস্যা হয়েছে');
    }
  }, []);
  
  const addProductToOrder = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if the product is already in the order
    const existingItem = selectedProducts.find(item => item.productId === productId);
    
    if (existingItem) {
      // Update quantity if product already in order
      setSelectedProducts(prev => 
        prev.map(item => 
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new product to order
      setSelectedProducts(prev => [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          quantity: 1,
          price: product.price
        }
      ]);
    }
  };
  
  const removeProductFromOrder = (productId: string) => {
    setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
  };
  
  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedProducts(prev => 
      prev.map(item => 
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const priceNumeric = parseInt(item.price.replace('৳', '').replace(',', ''));
      return total + (priceNumeric * item.quantity);
    }, 0);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Form validation
    if (!customerName || !customerPhone || !customerAddress || selectedProducts.length === 0) {
      setError('অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন');
      setLoading(false);
      return;
    }
    
    try {
      // Get existing orders from localStorage
      const existingOrdersJSON = localStorage.getItem('orders');
      let existingOrders = existingOrdersJSON ? JSON.parse(existingOrdersJSON) : [];
      
      // Generate order ID
      const orderId = `#${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Format items for display in the orders list
      const itemsText = selectedProducts
        .map(item => `${item.title} (${item.quantity})`)
        .join(', ');
      
      // Create new order
      const newOrder = {
        id: orderId,
        customer: customerName,
        phone: customerPhone,
        address: customerAddress,
        items: itemsText,
        itemsDetailed: selectedProducts,
        total: `৳${calculateTotal().toLocaleString('bn-BD')}`,
        status: status,
        statusColor: status === 'সম্পন্ন' ? 'green' : 
                     status === 'প্রসেসিং' ? 'blue' :
                     status === 'ডেলিভারি' ? 'yellow' : 'red',
        date: new Date().toLocaleDateString('bn-BD')
      };
      
      // Add new order to existing orders
      existingOrders.unshift(newOrder);
      
      // Save to localStorage
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // Redirect to orders page after successful addition
      setTimeout(() => {
        setLoading(false);
        router.push('/dashboard/orders');
      }, 1000);
    } catch (err) {
      setError('অর্ডার যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setLoading(false);
    }
  };
  
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
            
            <Link href="/dashboard/orders" className="block px-4 py-2 rounded bg-pink-100 text-pink-600">
              অর্ডারসমূহ
            </Link>
            
            <button className="w-full text-left px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              গ্রাহকবৃন্দ
            </button>
            
            <button className="w-full text-left px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              সেটিংস
            </button>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">নতুন অর্ডার যোগ করুন</h1>
              <Link href="/dashboard/orders" className="text-pink-600 hover:text-pink-800">
                ← অর্ডার তালিকায় ফিরে যান
              </Link>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">গ্রাহকের নাম *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">ফোন নম্বর *</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">ঠিকানা *</label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">স্ট্যাটাস *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">মোট মূল্য</label>
                  <div className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 font-bold text-pink-600">
                    ৳{calculateTotal().toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-xl font-semibold mb-4">পণ্য নির্বাচন করুন</h2>
                
                <div className="mb-4">
                  <select
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    onChange={(e) => addProductToOrder(e.target.value)}
                    value=""
                  >
                    <option value="" disabled>পণ্য নির্বাচন করুন</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.title} - {product.price} ({product.stock} পিস বাকি)
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedProducts.length > 0 ? (
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পণ্য</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মূল্য</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পরিমাণ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মোট</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedProducts.map((item) => {
                          const priceNumeric = parseInt(item.price.replace('৳', '').replace(',', ''));
                          return (
                            <tr key={item.productId}>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.price}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => updateProductQuantity(item.productId, item.quantity - 1)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateProductQuantity(item.productId, parseInt(e.target.value) || 1)}
                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateProductQuantity(item.productId, item.quantity + 1)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                ৳{(priceNumeric * item.quantity).toLocaleString('bn-BD')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  type="button"
                                  onClick={() => removeProductFromOrder(item.productId)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  বাদ দিন
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-500">পণ্য নির্বাচন করুন</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <Link
                  href="/dashboard/orders"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  বাতিল করুন
                </Link>
                <button
                  type="submit"
                  disabled={loading || selectedProducts.length === 0}
                  className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition disabled:opacity-50"
                >
                  {loading ? 'প্রসেসিং...' : 'অর্ডার যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 