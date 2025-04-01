'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

type OrderItem = {
  productId: string;
  title: string;
  quantity: number;
  price: string;
  image?: string;
};

type Order = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: string;
  itemsDetailed: OrderItem[];
  total: string;
  status: string;
  statusColor: string;
  date: string;
};

type Product = {
  id: string;
  title: string;
  price: string;
  discountedPrice?: string;
  category: string;
  stock: number;
  image: string;
};

const statusOptions = [
  { value: 'প্রক্রিয়াধীন', color: 'blue' },
  { value: 'প্রেরিত হয়েছে', color: 'yellow' },
  { value: 'সম্পন্ন', color: 'green' },
  { value: 'বাতিল', color: 'red' }
];

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  useEffect(() => {
    // Load order data from localStorage
    try {
      const ordersJSON = localStorage.getItem('orders');
      const productsJSON = localStorage.getItem('products');
      
      if (ordersJSON) {
        const orders: Order[] = JSON.parse(ordersJSON);
        const foundOrder = orders.find(o => o.id === id);
        
        if (foundOrder) {
          setCustomer(foundOrder.customer);
          setPhone(foundOrder.phone);
          setAddress(foundOrder.address);
          setStatus(foundOrder.status);
          
          if (foundOrder.itemsDetailed && foundOrder.itemsDetailed.length > 0) {
            setItems(foundOrder.itemsDetailed);
          }
          
          // Load products
          if (productsJSON) {
            const products: Product[] = JSON.parse(productsJSON);
            setProducts(products);
            setAvailableProducts(products);
            
            // Add images to items
            if (foundOrder.itemsDetailed) {
              const updatedItems = foundOrder.itemsDetailed.map(item => {
                const matchingProduct = products.find(p => p.id === item.productId);
                if (matchingProduct) {
                  return { ...item, image: matchingProduct.image };
                }
                return item;
              });
              setItems(updatedItems);
            }
          } else {
            setAvailableProducts([]);
          }
        } else {
          setError('অর্ডার খুঁজে পাওয়া যায়নি');
        }
      } else {
        setError('অর্ডার তালিকা খুঁজে পাওয়া যায়নি');
      }
    } catch (err) {
      setError('অর্ডারের তথ্য লোড করতে সমস্যা হয়েছে');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  const calculateTotal = () => {
    let total = 0;
    items.forEach(item => {
      const price = parseInt(item.price.replace('৳', '').replace(',', ''));
      total += price * item.quantity;
    });
    return `৳${total.toLocaleString('bn-BD')}`;
  };
  
  const addProduct = () => {
    if (!selectedProductId) return;
    
    const product = availableProducts.find(p => p.id === selectedProductId);
    if (!product) return;
    
    // Check if product already exists in the order
    const existingItemIndex = items.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += selectedQuantity;
      setItems(updatedItems);
    } else {
      // Add new item
      const price = product.discountedPrice || product.price;
      const newItem: OrderItem = {
        productId: product.id,
        title: product.title,
        quantity: selectedQuantity,
        price: price,
        image: product.image
      };
      
      setItems([...items, newItem]);
    }
    
    // Reset selection
    setSelectedProductId('');
    setSelectedQuantity(1);
  };
  
  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    setItems(updatedItems);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer || !phone || !address || items.length === 0) {
      alert('সকল প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }
    
    try {
      const ordersJSON = localStorage.getItem('orders');
      let orders: Order[] = [];
      
      if (ordersJSON) {
        orders = JSON.parse(ordersJSON);
      }
      
      // Find the index of the order to update
      const orderIndex = orders.findIndex(o => o.id === id);
      
      if (orderIndex >= 0) {
        // Create updated order object
        const updatedOrder: Order = {
          id: id as string,
          customer,
          phone,
          address,
          items: items.map(item => `${item.title} (${item.quantity}x)`).join(', '),
          itemsDetailed: items,
          total: calculateTotal(),
          status,
          statusColor: statusOptions.find(opt => opt.value === status)?.color || 'blue',
          date: orders[orderIndex].date // Keep the original date
        };
        
        // Update the order in the array
        orders[orderIndex] = updatedOrder;
        
        // Save to localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Redirect to order details page
        router.push(`/dashboard/orders/view/${id}`);
      } else {
        setError('অর্ডার আপডেট করতে সমস্যা হয়েছে। অর্ডার খুঁজে পাওয়া যায়নি।');
      }
    } catch (err) {
      setError('অর্ডার আপডেট করতে সমস্যা হয়েছে');
      console.error('Error updating order:', err);
    }
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
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ত্রুটি</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/dashboard/orders" 
            className="inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
          >
            অর্ডার তালিকায় ফিরে যান
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
            
            <Link href="/dashboard/orders" className="block px-4 py-2 rounded bg-pink-100 text-pink-600">
              অর্ডারসমূহ
            </Link>
            
            <Link href="/dashboard/customers" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              গ্রাহকবৃন্দ
            </Link>
            
            <button className="w-full text-left px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              সেটিংস
            </button>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">অর্ডার এডিট করুন</h1>
                <p className="text-gray-600">অর্ডার আইডি: {id}</p>
              </div>
              <Link href="/dashboard/orders" className="text-pink-600 hover:text-pink-800">
                ← অর্ডার তালিকায় ফিরে যান
              </Link>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Customer Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">গ্রাহকের তথ্য</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1" htmlFor="customer">
                      নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="customer"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1" htmlFor="phone">
                      ফোন <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-1" htmlFor="address">
                      ঠিকানা <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Order Status */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">অর্ডার স্ট্যাটাস</h2>
                
                <div className="flex flex-wrap gap-3">
                  {statusOptions.map((option) => (
                    <label 
                      key={option.value} 
                      className={`
                        px-4 py-2 rounded-full cursor-pointer border
                        ${status === option.value 
                          ? `bg-${option.color}-100 border-${option.color}-500 text-${option.color}-700` 
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={status === option.value}
                        onChange={() => setStatus(option.value)}
                        className="sr-only"
                      />
                      {option.value}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">অর্ডার আইটেমসমূহ</h2>
                
                {/* Current Items */}
                <div className="mb-6">
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ছবি</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পণ্য</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মূল্য</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পরিমাণ</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">মোট</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">অপশন</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.length > 0 ? (
                          items.map((item, index) => {
                            const priceNumeric = parseInt(item.price.replace('৳', '').replace(',', ''));
                            return (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                    <Image 
                                      src={item.image || `https://source.unsplash.com/random/100x100/?${item.title.split(' ')[0]}`}
                                      alt={item.title}
                                      width={48}
                                      height={48}
                                      className="object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(index, item.quantity - 1)}
                                      className="p-1 bg-gray-200 text-gray-700 rounded-l-md"
                                    >
                                      -
                                    </button>
                                    <span className="w-10 text-center">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(index, item.quantity + 1)}
                                      className="p-1 bg-gray-200 text-gray-700 rounded-r-md"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                  ৳{(priceNumeric * item.quantity).toLocaleString('bn-BD')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    অপসারণ
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              কোন আইটেম যোগ করা হয়নি
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-right font-medium">মোট:</td>
                          <td className="px-6 py-4 text-right font-bold text-pink-600">{calculateTotal()}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {/* Add New Item */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-md font-medium mb-3 text-gray-700">নতুন আইটেম যোগ করুন</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1" htmlFor="product">
                        পণ্য
                      </label>
                      <select
                        id="product"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">পণ্য নির্বাচন করুন</option>
                        {availableProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.title} - {product.discountedPrice || product.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1" htmlFor="quantity">
                        পরিমাণ
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        value={selectedQuantity}
                        min="1"
                        onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addProduct}
                        className="w-full p-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!selectedProductId}
                      >
                        আইটেম যোগ করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-between">
                <Link
                  href={`/dashboard/orders/view/${id}`}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </Link>
                
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
                  disabled={items.length === 0}
                >
                  অর্ডার আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 