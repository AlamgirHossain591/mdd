'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';

type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  variant: {
    size: string;
    color: string;
  };
  image?: string;
};

type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
};

type ShippingAddress = {
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

type Order = {
  id: string;
  date: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  completedAt?: string;
};

type Product = {
  id: string;
  title: string;
  price: string;
  category: string;
  stock: number;
  image: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('সব');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // মাল্টিপল সিলেকশনের জন্য
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('প্রক্রিয়াধীন');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // ছবি মোডালের জন্য
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedOrderImages, setSelectedOrderImages] = useState<{title: string, image: string, quantity: number}[]>([]);
  
  // স্টেডফাস্ট কুরিয়ার API সেটিংস
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [courierStatus, setCourierStatus] = useState<{[key: string]: {status: string, trackingCode?: string, consignmentId?: string}}>({});
  const [savingApiKeys, setSavingApiKeys] = useState(false);
  const [sendingToCourier, setSendingToCourier] = useState<string | null>(null);
  
  // পেজিনেশন স্টেট
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 30;
  
  // API থেকে অর্ডার লোড করা
  const loadOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      // API থেকে অর্ডার লোড করা
      console.log('অর্ডার API কল করা হচ্ছে...');
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });
      
      console.log('API রেসপন্স স্ট্যাটাস:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API রেসপন্স এরর:', errorData);
        throw new Error(errorData.error || `অর্ডার লোড করতে সমস্যা হয়েছে (${response.status})`);
      }
      
      const data = await response.json();
      
      // API থেকে প্রাপ্ত অর্ডার সেট করা
      console.log('API থেকে লোড করা অর্ডার (প্রথম 2টি):', data.slice(0, 2));
      console.log('মোট অর্ডার সংখ্যা:', data.length);
      
      if (Array.isArray(data)) {
        // ডাটা স্ট্রাকচার চেক করা
        if (data.length > 0) {
          console.log('প্রথম অর্ডারের স্ট্রাকচার:', JSON.stringify(data[0], null, 2));
        }
        
        setOrders(data);
        console.log(`${data.length}টি অর্ডার লোড হয়েছে এবং স্টেটে সেট করা হয়েছে`);
        
        // ফিল্টারড অর্ডার চেক করা
        setTimeout(() => {
          console.log('অর্ডার স্টেট আপডেট হয়েছে কিনা চেক করা:', orders.length);
        }, 100);
      } else {
        console.error('প্রাপ্ত ডাটা অ্যারে নয়:', data);
        setError('অবৈধ অর্ডার ডাটা ফরম্যাট');
        // ফলব্যাক হিসেবে লোকাল স্টোরেজে চেক করা
        tryLoadFromLocalStorage();
      }
      
    } catch (err: any) {
      console.error('অর্ডার লোড করতে সমস্যা:', err);
      setError(err.message || 'অর্ডার লোড করতে সমস্যা হয়েছে');
      
      // এরর হলে লোকাল স্টোরেজ থেকে লোড করার চেষ্টা করা
      tryLoadFromLocalStorage();
    } finally {
      setLoading(false);
      console.log('লোডিং শেষ করা হয়েছে');
    }
  };
  
  // লোকাল স্টোরেজ থেকে অর্ডার লোড করা
  const tryLoadFromLocalStorage = () => {
    try {
      const ordersJSON = localStorage.getItem('orders');
      if (ordersJSON) {
        const ordersData = JSON.parse(ordersJSON);
        
        if (Array.isArray(ordersData) && ordersData.length > 0) {
          // লোকাল স্টোরেজের ফরম্যাট ঠিক করা যদি প্রয়োজন হয়
          const formattedOrders = ordersData.map(order => {
            // যদি অর্ডার অবজেক্টে 'order' কী থাকে তাহলে ব্যবহার করা
            if (order.order) {
              return order.order;
            }
            
            // যদি অর্ডার ফরম্যাট লোকাল স্টোরেজের মত অন্য হয় তাহলে কনভার্ট করা
            if (order.orderId && !order.id) {
              return {
                id: order.orderId,
                date: order.orderDate || new Date().toISOString(),
                customer: {
                  name: order.customerInfo?.name || order.customer || 'অজানা',
                  phone: order.customerInfo?.phone || order.phone || '',
                  email: order.customerInfo?.email || order.email || ''
                },
                shippingAddress: {
                  address: order.customerInfo?.address || order.address || '',
                  city: order.customerInfo?.city || order.city || '',
                  postalCode: order.customerInfo?.postalCode || '',
                  country: 'বাংলাদেশ'
                },
                items: order.items || [],
                totalAmount: order.total || order.totalAmount || 0,
                status: order.status || 'প্রক্রিয়াধীন',
                paymentMethod: order.paymentMethod || order.customerInfo?.paymentMethod || 'ক্যাশ অন ডেলিভারি'
              };
            }
            
            return order;
          });
          
          setOrders(formattedOrders);
          console.log('লোকাল স্টোরেজ থেকে অর্ডার লোড করা হয়েছে:', formattedOrders.length);
        } else {
          console.log('লোকাল স্টোরেজে কোন অর্ডার নেই, ডিফল্ট অর্ডার তৈরি করা হচ্ছে');
          createDefaultOrders();
        }
      } else {
        console.log('লোকাল স্টোরেজে অর্ডার কী নেই, ডিফল্ট অর্ডার তৈরি করা হচ্ছে');
        createDefaultOrders();
      }
    } catch (localError) {
      console.error('লোকাল স্টোরেজ থেকে লোড করতে সমস্যা:', localError);
      createDefaultOrders();
    }
  };
  
  // কম্পোনেন্ট লোড হওয়ার সময় API কী লোড করা
  useEffect(() => {
    console.log('useEffect চালু হয়েছে - অর্ডার লোড করা হচ্ছে');
    
    // API এবং Secret কী লোড করা লোকাল স্টোরেজ থেকে
    const savedApiKey = localStorage.getItem('steadfast_api_key');
    const savedSecretKey = localStorage.getItem('steadfast_secret_key');
    const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedSecretKey) setSecretKey(savedSecretKey);
    if (savedCourierStatus) {
      try {
        setCourierStatus(JSON.parse(savedCourierStatus));
      } catch (e) {
        console.error('কুরিয়ার স্ট্যাটাস পার্স করতে সমস্যা:', e);
      }
    }
    
    // কম্পোনেন্ট লোড হওয়ামাত্র অর্ডার লোড করা
    loadOrders();
    
    // ইন্টারভাল সেট করা যাতে প্রতি 30 সেকেন্ডে অর্ডার আপডেট হয়
    const intervalId = setInterval(() => {
      console.log('ইন্টারভাল দ্বারা অর্ডার রিফ্রেশ হচ্ছে');
      loadOrders();
    }, 30000);
    
    // ক্লিনআপ ফাংশন
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // API কী সেভ করার ফাংশন
  const saveApiKeys = () => {
    setSavingApiKeys(true);
    
    try {
      localStorage.setItem('steadfast_api_key', apiKey);
      localStorage.setItem('steadfast_secret_key', secretKey);
      
      setSuccess('API কী সফলভাবে সেভ করা হয়েছে');
      setTimeout(() => setSuccess(''), 3000);
      setShowApiModal(false);
    } catch (e) {
      setError('API কী সেভ করতে সমস্যা হয়েছে');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingApiKeys(false);
    }
  };

  // স্টেডফাস্টে অর্ডার পাঠানোর ফাংশন
  const sendOrderToCourier = async (orderId: string) => {
    // পাঠানো হচ্ছে স্টেটাস সেট করা
    setSendingToCourier(orderId);
    
    try {
      // অর্ডার খুঁজে বের করা
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('অর্ডার খুঁজে পাওয়া যায়নি');
      }
      
      // API কী চেক করা
      if (!apiKey || !secretKey) {
        throw new Error('API কী এবং সিক্রেট কী সেট করুন');
      }
      
      // স্টেডফাস্ট API কল করা
      const response = await fetch('/api/courier/send-to-steadfast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          secretKey,
          order: {
            invoice: order.id,
            recipient_name: order.customer.name,
            recipient_phone: order.customer.phone,
            recipient_address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
            cod_amount: order.totalAmount,
            note: `অর্ডার আইডি: ${order.id}. পণ্য সংখ্যা: ${order.items.length}. প্রোডাক্টস: ${order.items.map(item => `${item.title} - ${item.quantity} পিস`).join(', ')}`
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'কুরিয়ারে অর্ডার পাঠাতে সমস্যা হয়েছে');
      }
      
      const responseData = await response.json();
      
      // কুরিয়ার স্ট্যাটাস আপডেট করা
      const newCourierStatus = {
        ...courierStatus,
        [orderId]: {
          status: 'sent',
          trackingCode: responseData.tracking_code,
          consignmentId: responseData.consignment_id
        }
      };
      
      setCourierStatus(newCourierStatus);
      localStorage.setItem('steadfast_courier_status', JSON.stringify(newCourierStatus));
      
      // সাকসেস মেসেজ
      setSuccess(`অর্ডার #${orderId} কুরিয়ারে সফলভাবে পাঠানো হয়েছে। ট্র্যাকিং কোড: ${responseData.tracking_code}`);
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err: any) {
      console.error('কুরিয়ারে পাঠাতে সমস্যা:', err);
      setError(err.message || 'কুরিয়ারে পাঠাতে সমস্যা হয়েছে');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSendingToCourier(null);
    }
  };
  
  // সম্পূর্ণ খালি হলে ডিফল্ট অর্ডার তৈরি করা
  const createDefaultOrders = () => {
    const defaultOrders = [
      {
        id: 'ORD001',
        date: new Date().toISOString(),
        customer: {
          name: 'রহিম আহমেদ',
          phone: '০১৭১২৩৪৫৬৭৮',
          email: ''
        },
        shippingAddress: {
          address: 'বাড়ি #১২, রোড #৫, ব্লক-বি, বনশ্রী',
          city: 'ঢাকা',
          postalCode: '১২১২',
          country: 'বাংলাদেশ'
        },
        items: [
          {
            id: 'PRD001',
            title: 'প্রিমিয়াম টি-শার্ট',
            price: 800,
            quantity: 2,
            variant: {
              size: 'M',
              color: 'নীল'
            }
          },
          {
            id: 'PRD002',
            title: 'ডেনিম জিন্স',
            price: 1800,
            quantity: 1,
            variant: {
              size: '32',
              color: 'গাঢ় নীল'
            }
          }
        ],
        totalAmount: 3400,
        status: 'সম্পন্ন',
        paymentMethod: 'ক্যাশ অন ডেলিভারি',
        completedAt: new Date(Date.now() - 86400000).toISOString() // ১ দিন আগে
      },
      {
        id: 'ORD002',
        date: new Date().toISOString(),
        customer: {
          name: 'সালমা খাতুন',
          phone: '০১৯১২৩৪৫৬৭৮',
          email: 'salma@example.com'
        },
        shippingAddress: {
          address: 'বাসা #৭, রোড #৪, সেকশন-৬, মিরপুর',
          city: 'ঢাকা',
          postalCode: '১২১৬',
          country: 'বাংলাদেশ'
        },
        items: [
          {
            id: 'PRD003',
            title: 'ফ্লোরাল ড্রেস',
            price: 2200,
            quantity: 1,
            variant: {
              size: 'M',
              color: 'মালটি কালার'
            }
          },
          {
            id: 'PRD007',
            title: 'লেদার ব্যাগ',
            price: 1800,
            quantity: 1,
            variant: {
              size: 'Standard',
              color: 'কালো'
            }
          }
        ],
        totalAmount: 4000,
        status: 'প্রক্রিয়াধীন',
        paymentMethod: 'বিকাশ'
      },
      {
        id: 'ORD003',
        date: new Date().toISOString(),
        customer: {
          name: 'করিম খান',
          phone: '০১৮১২৩৪৫৬৭৮',
          email: ''
        },
        shippingAddress: {
          address: 'ফ্ল্যাট #৫, বাড়ি #৮, রোড #১১, গুলশান-২',
          city: 'ঢাকা',
          postalCode: '১২১২',
          country: 'বাংলাদেশ'
        },
        items: [
          {
            id: 'PRD005',
            title: 'লেদার জ্যাকেট',
            price: 3500,
            quantity: 1,
            variant: {
              size: 'L',
              color: 'বাদামী'
            }
          },
          {
            id: 'PRD006',
            title: 'স্নিকার্স',
            price: 2500,
            quantity: 1,
            variant: {
              size: '42',
              color: 'কালো'
            }
          }
        ],
        totalAmount: 6000,
        status: 'শিপিং হয়েছে',
        paymentMethod: 'ক্যাশ অন ডেলিভারি'
      }
    ];
    
    setOrders(defaultOrders);
    localStorage.setItem('orders', JSON.stringify(defaultOrders));
    console.log("ডিফল্ট অর্ডার তৈরি করা হয়েছে:", defaultOrders.length);
  };
  
  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'সব' ? true : order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // সর্টিং এবং পেজিনেশন লজিক
  const sortOrders = (ordersToSort: Order[]) => {
    return [...ordersToSort].sort((a, b) => {
      // যারা পাঠানো হয়নি এগুলো উপরে থাকবে
      const aNotSent = !courierStatus[a.id] || !courierStatus[a.id].trackingCode;
      const bNotSent = !courierStatus[b.id] || !courierStatus[b.id].trackingCode;
      
      if (aNotSent && !bNotSent) return -1;
      if (!aNotSent && bNotSent) return 1;
      
      // রিভিউ এর অপেক্ষায় এরপরে থাকবে
      const aReview = a.status === 'রিভিউ এর অপেক্ষায়';
      const bReview = b.status === 'রিভিউ এর অপেক্ষায়';
      
      if (aReview && !bReview) return -1;
      if (!aReview && bReview) return 1;
      
      // বাকি অর্ডারগুলো তারিখ অনুযায়ী সাজানো (নতুন থেকে পুরানো)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };
  
  // সর্ট করা অর্ডার
  const sortedFilteredOrders = sortOrders(filteredOrders);
  
  // পেজিনেশনের জন্য অর্ডার ভাগ করা
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedFilteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedFilteredOrders.length / ordersPerPage);
  
  // পেজ চেঞ্জ হ্যান্ডেল করা
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // টেবিল হেডারে চেকবক্স টগল করা
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    
    if (!selectAll) {
      // ফিল্টার করা অর্ডারগুলো থেকে আইডি একসাথে নেওয়া
      const filteredOrderIds = filteredOrders.map(order => order.id);
      setSelectedOrders(filteredOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };
  
  // একটি অর্ডার সিলেক্ট/আনসিলেক্ট করা
  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    } else {
      setSelectedOrders(prev => [...prev, orderId]);
    }
  };
  
  // একাধিক অর্ডারের স্ট্যাটাস আপডেট করা
  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      setError('');
      setSuccess('');
      
      // API কল করে বাল্ক আপডেট করা
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: statusToUpdate
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'অর্ডার আপডেট করতে সমস্যা হয়েছে');
      }
      
      // আপডেট সফল হলে
      setSuccess(`${selectedOrders.length}টি অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে`);
      setSelectedOrders([]);
      setSelectAll(false);
      
      // আপডেট করা অর্ডার সেট করা
      setOrders(data.orders);
      
    } catch (err: any) {
      console.error('অর্ডার আপডেট করতে সমস্যা:', err);
      setError(err.message || 'অর্ডার আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // সিঙ্গেল অর্ডার ডিলিট করা
  const handleDeleteSingleOrder = async (id: string) => {
    try {
      setError('');
      setSuccess('');
      
      // অর্ডার আছে কিনা চেক করা
      const orderExists = orders.find(order => order.id === id);
      if (!orderExists) {
        throw new Error('অর্ডার পাওয়া যায়নি');
      }
      
      // API কল করে অর্ডার ডিলিট করা
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'অর্ডার ডিলিট করতে সমস্যা হয়েছে');
      }
      
      // সফল হলে অর্ডার লিস্ট থেকে রিমুভ করা
      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      setSuccess(`অর্ডার #${id} সফলভাবে ডিলিট করা হয়েছে`);
      
      // লোকাল স্টোরেজেও আপডেট করা
      try {
        const ordersJSON = localStorage.getItem('orders');
        if (ordersJSON) {
          const orders = JSON.parse(ordersJSON);
          const updatedOrders = orders.filter((o: any) => o.id !== id);
          localStorage.setItem('orders', JSON.stringify(updatedOrders));
        }
      } catch (err) {
        console.error('লোকাল স্টোরেজ আপডেট করতে সমস্যা:', err);
      }
      
    } catch (err: any) {
      console.error('অর্ডার ডিলিট করতে সমস্যা:', err);
      setError(err.message || 'অর্ডার ডিলিট করতে সমস্যা হয়েছে');
    }
  };
  
  // অর্ডার স্ট্যাটাসের কালার ক্লাস
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'প্রক্রিয়াধীন':
        return 'bg-blue-100 text-blue-800';
      case 'শিপিং হয়েছে':
        return 'bg-orange-100 text-orange-800';
      case 'সম্পন্ন':
        return 'bg-green-100 text-green-800';
      case 'বাতিল':
        return 'bg-red-100 text-red-800';
      case 'অপেক্ষমান':
        return 'bg-blue-100 text-blue-800';
      case 'পিকআপ নির্ধারিত হয়েছে':
        return 'bg-purple-100 text-purple-800';
      case 'পিকআপ হয়েছে':
        return 'bg-indigo-100 text-indigo-800';
      case 'ট্রানজিটে আছে':
        return 'bg-cyan-100 text-cyan-800';
      case 'ডেলিভারির জন্য বের হয়েছে':
        return 'bg-teal-100 text-teal-800';
      case 'ডেলিভারি হয়েছে':
        return 'bg-green-100 text-green-800';
      case 'ডেলিভারি ব্যর্থ হয়েছে':
        return 'bg-orange-100 text-orange-800';
      case 'ফেরত পাঠানো হয়েছে':
        return 'bg-amber-100 text-amber-800';
      case 'আংশিক ডেলিভারি হয়েছে':
        return 'bg-yellow-100 text-yellow-800';
      case 'হোল্ড করা হয়েছে':
        return 'bg-gray-100 text-gray-800';
      case 'হারিয়ে গেছে':
        return 'bg-rose-100 text-rose-800';
      case 'ক্ষতিগ্রস্ত হয়েছে':
        return 'bg-pink-100 text-pink-800';
      case 'কুরিয়ারে পাঠানো হয়েছে':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // অর্ডারের তারিখ ফরম্যাট করা
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'অবৈধ তারিখ';
    }
  };
  
  // ছবি মোডাল দেখানোর ফাংশন
  const handleShowImages = (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    e.stopPropagation();
    
    // অর্ডারের সব ছবি নিয়ে আসা
    const images = order.items.map(item => ({
      title: item.title,
      image: item.image || `/images/products/placeholder.jpg`,
      quantity: item.quantity
    }));
    
    setSelectedOrderImages(images);
    setShowImageModal(true);
  };
  
  // কুরিয়ার কলাম যোগ করা হচ্ছে
  const OrdersTable = ({ orders, onStatusChange, onDeleteOrder }: { 
    orders: Order[], 
    onStatusChange: (id: string, status: string) => void,
    onDeleteOrder: (id: string) => void 
  }) => {
    // কুরিয়ার স্ট্যাটাস স্ট্যাটাস ম্যানেজমেন্ট
    const [isCheckingStatus, setIsCheckingStatus] = useState<{ [key: string]: boolean }>({});
    const [courierStatuses, setCourierStatuses] = useState<{ [key: string]: any }>({});
    const [apiConfig, setApiConfig] = useState<{ apiKey: string, secretKey: string }>({ apiKey: '', secretKey: '' });
    
    // কম্পোনেন্ট লোড হওয়ার সময় API কী এবং কুরিয়ার স্ট্যাটাস লোড করা
    useEffect(() => {
      // API এবং Secret কী লোড করা লোকাল স্টোরেজ থেকে
      const savedApiKey = localStorage.getItem('steadfast_api_key');
      const savedSecretKey = localStorage.getItem('steadfast_secret_key');
      const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
      
      if (savedApiKey) setApiConfig(prev => ({ ...prev, apiKey: savedApiKey }));
      if (savedSecretKey) setApiConfig(prev => ({ ...prev, secretKey: savedSecretKey }));
      
      if (savedCourierStatus) {
        try {
          const courierStatusData = JSON.parse(savedCourierStatus);
          setCourierStatuses(courierStatusData);
        } catch (e) {
          console.error('কুরিয়ার স্ট্যাটাস পার্স করতে সমস্যা:', e);
        }
      }
    }, []);
    
    // কুরিয়ার স্ট্যাটাস চেক করার ফাংশন
    const checkCourierStatus = async (orderId: string) => {
      if (!courierStatuses[orderId] || !courierStatuses[orderId].trackingCode) {
        alert('এই অর্ডারটি কুরিয়ারে পাঠানো হয়নি');
        return;
      }
      
      // স্ট্যাটাস চেক করা হচ্ছে
      setIsCheckingStatus(prev => ({ ...prev, [orderId]: true }));
      
      try {
        // API কী চেক করা
        if (!apiConfig.apiKey || !apiConfig.secretKey) {
          throw new Error('API কী এবং সিক্রেট কী সেট করুন');
        }
        
        // স্টেডফাস্ট API কল করা
        const response = await fetch(`/api/courier/send-to-steadfast?apiKey=${apiConfig.apiKey}&secretKey=${apiConfig.secretKey}&trackingCode=${courierStatuses[orderId].trackingCode}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'কুরিয়ার স্ট্যাটাস চেক করতে সমস্যা হয়েছে');
        }
        
        const responseData = await response.json();
        
        // কুরিয়ার স্ট্যাটাস আপডেট করা
        const newCourierStatus = {
          ...courierStatuses[orderId],
          status: responseData.status,
          banglaStatus: responseData.banglaStatus || getStatusTranslation(responseData.status)
        };
        
        // স্ট্যাটাস আপডেট করা
        setCourierStatuses(prev => ({
          ...prev,
          [orderId]: newCourierStatus
        }));
        
        // লোকাল স্টোরেজে সেভ করা
        try {
          const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
          const courierStatusData = savedCourierStatus ? JSON.parse(savedCourierStatus) : {};
          
          courierStatusData[orderId] = newCourierStatus;
          localStorage.setItem('steadfast_courier_status', JSON.stringify(courierStatusData));
          
          // সাকসেস মেসেজ
          alert(`কুরিয়ার স্ট্যাটাস: ${newCourierStatus.banglaStatus || getStatusTranslation(newCourierStatus.status)}`);
        } catch (e) {
          console.error('কুরিয়ার স্ট্যাটাস সেভ করতে সমস্যা:', e);
        }
        
      } catch (err: any) {
        console.error('কুরিয়ার স্ট্যাটাস চেক করতে সমস্যা:', err);
        alert(err.message || 'কুরিয়ার স্ট্যাটাস চেক করতে সমস্যা হয়েছে');
      } finally {
        setIsCheckingStatus(prev => ({ ...prev, [orderId]: false }));
      }
    };
    
    // কুরিয়ার সার্ভিসের সকল সম্ভাব্য স্ট্যাটাস
    const getStatusTranslation = (status: string): string => {
      const statusMap: {[key: string]: string} = {
        'pending': 'অপেক্ষমান',
        'pickup_assigned': 'পিকআপ নির্ধারিত হয়েছে',
        'picked_up': 'পিকআপ হয়েছে',
        'in_transit': 'ট্রানজিটে আছে',
        'out_for_delivery': 'ডেলিভারির জন্য বের হয়েছে',
        'delivered': 'ডেলিভারি হয়েছে',
        'cancelled': 'বাতিল হয়েছে',
        'failed_delivery': 'ডেলিভারি ব্যর্থ হয়েছে',
        'returned': 'ফেরত পাঠানো হয়েছে',
        'partial_delivered': 'আংশিক ডেলিভারি হয়েছে',
        'hold': 'হোল্ড করা হয়েছে',
        'lost': 'হারিয়ে গেছে',
        'damaged': 'ক্ষতিগ্রস্ত হয়েছে',
        'sent': 'কুরিয়ারে পাঠানো হয়েছে'
      };
      
      return statusMap[status] || status;
    };
    
    // স্ট্যাটাসের রঙ পাওয়া
    const getStatusColor = (status: string): string => {
      const colorMap: {[key: string]: string} = {
        'pending': 'text-blue-600',
        'pickup_assigned': 'text-purple-600',
        'picked_up': 'text-indigo-600',
        'in_transit': 'text-cyan-600',
        'out_for_delivery': 'text-teal-600',
        'delivered': 'text-green-600',
        'cancelled': 'text-red-600',
        'failed_delivery': 'text-orange-600',
        'returned': 'text-amber-600',
        'partial_delivered': 'text-yellow-600',
        'hold': 'text-gray-600',
        'lost': 'text-rose-600',
        'damaged': 'text-pink-600',
        'sent': 'text-blue-600'
      };
      
      return colorMap[status] || 'text-blue-600';
    };
    
    // টেবিল রেন্ডার
    return (
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              অর্ডার আইডি
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              তারিখ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              কুরিয়ার
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              গ্রাহক
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              মূল্য
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              অ্যাকশন
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                <Link href={`/dashboard/orders/view/${order.id}`}>
                  #{order.id}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.date)}
              </td>
              <td className="px-6 py-4 text-sm">
                {courierStatuses[order.id] && courierStatuses[order.id].trackingCode ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center mb-1">
                      <span className={`inline-block h-2 w-2 rounded-full mr-2 ${courierStatuses[order.id].status ? `bg-${courierStatuses[order.id].status === 'delivered' ? 'green' : courierStatuses[order.id].status === 'cancelled' ? 'red' : 'blue'}-500` : 'bg-gray-400'}`}></span>
                      <span className={`text-xs font-medium ${getStatusColor(courierStatuses[order.id].status)}`}>
                        {courierStatuses[order.id].banglaStatus || getStatusTranslation(courierStatuses[order.id].status)}
                      </span>
                    </div>
                    <button
                      onClick={() => checkCourierStatus(order.id)}
                      disabled={isCheckingStatus[order.id]}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
                    >
                      {isCheckingStatus[order.id] ? 'চেক করা হচ্ছে...' : 'স্ট্যাটাস চেক'}
                    </button>
                    
                    {/* কনসাইনমেন্ট আইডি এবং ট্র্যাকিং আইডি যোগ করা হয়েছে */}
                    <div className="mt-1 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">কনসাইনমেন্ট আইডি:</span> {courierStatuses[order.id].consignmentId || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">ট্র্যাকিং কোড:</span> {courierStatuses[order.id].trackingCode}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <span className="text-xs text-gray-500">কুরিয়ারে পাঠানো হয়নি</span>
                    <button
                      onClick={() => sendOrderToCourier(order.id)}
                      disabled={sendingToCourier === order.id}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
                    >
                      {sendingToCourier === order.id ? 'পাঠানো হচ্ছে...' : 'সেন্ড'}
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {typeof order.customer === 'string' 
                  ? order.customer 
                  : order.customer?.name || 'অজানা গ্রাহক'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-600">
                ৳{typeof order.totalAmount === 'number' 
                    ? order.totalAmount 
                    : parseFloat((order as any).total?.replace('৳', '') || '0')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <div className="flex space-x-2">
                  <Link 
                    href={`/dashboard/orders/view/${order.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    দেখুন
                  </Link>
                  
                  <button
                    onClick={() => onDeleteOrder(order.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    মুছুন
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">অর্ডার লোড হচ্ছে...</p>
          <p className="mt-2 text-sm text-gray-500">অনুগ্রহ করে অপেক্ষা করুন, ডাটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* ছবি মোডাল */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">অর্ডারের পণ্যসমূহ</h3>
              <button 
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedOrderImages.map((item, index) => (
                  <div key={index} className="relative group">
                    <div className="relative h-60 w-full rounded-lg overflow-hidden border border-gray-200">
                      {/* পরিমাণ ব্যাজ */}
                      <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-2 py-1 rounded-bl-md font-bold z-10">
                        {item.quantity} পিস
                      </div>
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transform transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700 truncate">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">অর্ডার ম্যানেজমেন্ট</h1>
        <p className="text-gray-600">সকল অর্ডার দেখুন এবং স্ট্যাটাস আপডেট করুন</p>
      </div>
      
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
      
      {/* ফিল্টার অপশন */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 mb-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            {/* স্ট্যাটাস ফিল্টার */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">অর্ডার স্ট্যাটাস:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="সব">সব স্ট্যাটাস</option>
                <option value="প্রক্রিয়াধীন">প্রক্রিয়াধীন</option>
                <option value="শিপিং হয়েছে">শিপিং হয়েছে</option>
                <option value="অপেক্ষমান">অপেক্ষমান</option>
                <option value="পিকআপ নির্ধারিত হয়েছে">পিকআপ নির্ধারিত হয়েছে</option>
                <option value="পিকআপ হয়েছে">পিকআপ হয়েছে</option>
                <option value="ট্রানজিটে আছে">ট্রানজিটে আছে</option>
                <option value="ডেলিভারির জন্য বের হয়েছে">ডেলিভারির জন্য বের হয়েছে</option>
                <option value="ডেলিভারি হয়েছে">ডেলিভারি হয়েছে</option>
                <option value="ডেলিভারি ব্যর্থ হয়েছে">ডেলিভারি ব্যর্থ হয়েছে</option>
                <option value="ফেরত পাঠানো হয়েছে">ফেরত পাঠানো হয়েছে</option>
                <option value="আংশিক ডেলিভারি হয়েছে">আংশিক ডেলিভারি হয়েছে</option>
                <option value="হোল্ড করা হয়েছে">হোল্ড করা হয়েছে</option>
                <option value="হারিয়ে গেছে">হারিয়ে গেছে</option>
                <option value="ক্ষতিগ্রস্ত হয়েছে">ক্ষতিগ্রস্ত হয়েছে</option>
                <option value="কুরিয়ারে পাঠানো হয়েছে">কুরিয়ারে পাঠানো হয়েছে</option>
                <option value="সম্পন্ন">সম্পন্ন</option>
                <option value="বাতিল">বাতিল</option>
              </select>
            </div>
            
            {/* অর্ডার সার্চ ইনপুট */}
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">অর্ডার সার্চ:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="অর্ডার আইডি, গ্রাহকের নাম বা ফোন নাম্বার"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            {/* স্টেডফাস্ট API সেটিংস বাটন */}
            <button
              onClick={() => setShowApiModal(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <span>স্টেডফাস্ট API</span>
            </button>
            
            {/* রিফ্রেশ বাটন */}
            <button
              onClick={loadOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>
        
        {/* বাল্ক একশন - একাধিক অর্ডার আপডেট করার বাটন */}
        {selectedOrders.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {selectedOrders.length}টি অর্ডার সিলেক্ট করা হয়েছে
                </span>
              </div>
              
              <div className="flex-1 flex items-center space-x-4">
                <select
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="প্রক্রিয়াধীন">প্রক্রিয়াধীন</option>
                  <option value="শিপিং হয়েছে">শিপিং হয়েছে</option>
                  <option value="অপেক্ষমান">অপেক্ষমান</option>
                  <option value="পিকআপ নির্ধারিত হয়েছে">পিকআপ নির্ধারিত হয়েছে</option>
                  <option value="পিকআপ হয়েছে">পিকআপ হয়েছে</option>
                  <option value="ট্রানজিটে আছে">ট্রানজিটে আছে</option>
                  <option value="ডেলিভারির জন্য বের হয়েছে">ডেলিভারির জন্য বের হয়েছে</option>
                  <option value="ডেলিভারি হয়েছে">ডেলিভারি হয়েছে</option>
                  <option value="ডেলিভারি ব্যর্থ হয়েছে">ডেলিভারি ব্যর্থ হয়েছে</option>
                  <option value="ফেরত পাঠানো হয়েছে">ফেরত পাঠানো হয়েছে</option>
                  <option value="আংশিক ডেলিভারি হয়েছে">আংশিক ডেলিভারি হয়েছে</option>
                  <option value="হোল্ড করা হয়েছে">হোল্ড করা হয়েছে</option>
                  <option value="হারিয়ে গেছে">হারিয়ে গেছে</option>
                  <option value="ক্ষতিগ্রস্ত হয়েছে">ক্ষতিগ্রস্ত হয়েছে</option>
                  <option value="কুরিয়ারে পাঠানো হয়েছে">কুরিয়ারে পাঠানো হয়েছে</option>
                  <option value="সম্পন্ন">সম্পন্ন</option>
                  <option value="বাতিল">বাতিল</option>
                </select>
                
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || selectedOrders.length === 0}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                >
                  {updatingStatus ? 'আপডেট হচ্ছে...' : 'স্ট্যাটাস আপডেট করুন'}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedOrders([]);
                    setSelectAll(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  বাছাই বাতিল
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* অর্ডার টেবিল */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length > 0 ? (
          <OrdersTable orders={filteredOrders} onStatusChange={handleUpdateStatus} onDeleteOrder={(id) => {
            // যদি ইউজার ডিলিট করতে চায়
            if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি মুছতে চান?')) {
              handleDeleteSingleOrder(id);
            }
          }} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">কোন অর্ডার পাওয়া যায়নি</p>
          </div>
        )}
      </div>
      
      {/* অর্ডার টেবিল */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {sortedFilteredOrders.length > 0 ? (
          <>
            <OrdersTable 
              orders={currentOrders} 
              onStatusChange={handleUpdateStatus} 
              onDeleteOrder={(id) => {
                // যদি ইউজার ডিলিট করতে চায়
                if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি মুছতে চান?')) {
                  handleDeleteSingleOrder(id);
                }
              }} 
            />
            
            {/* পেজিনেশন */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    দেখানো হচ্ছে {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, sortedFilteredOrders.length)} (মোট {sortedFilteredOrders.length}টি)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      আগের পাতা
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage > 3 && totalPages > 5
                        ? (currentPage - 3) + i + 1
                        : i + 1;
                        
                      if (pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 border rounded-md text-sm ${
                              pageNum === currentPage
                                ? 'bg-pink-600 text-white border-pink-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-1 self-end">...</span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className={`px-3 py-1 border rounded-md text-sm border-gray-300`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      পরের পাতা
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">কোন অর্ডার পাওয়া যায়নি</p>
          </div>
        )}
      </div>
      
      {/* API কী সেটিংস মোডাল */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">স্টেডফাস্ট কুরিয়ার API সেটিংস</h3>
                <button 
                  onClick={() => setShowApiModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="স্টেডফাস্ট API কী"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="স্টেডফাস্ট সিক্রেট কী"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="border-t pt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowApiModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  বাতিল
                </button>
                <button
                  onClick={saveApiKeys}
                  disabled={savingApiKeys || !apiKey || !secretKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {savingApiKeys ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <p>API কী পেতে স্টেডফাস্ট কুরিয়ার সাপোর্ট এর সাথে যোগাযোগ করুন।</p>
                <p className="mt-1">
                  <a 
                    href="https://docs.google.com/document/d/e/2PACX-1vTi0sTyR353xu1AK0nR8E_WKe5onCkUXGEf8ch8uoJy9qxGfgGnboSIkNosjQ0OOdXkJhgGuAsWxnIh/pub" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    ডকুমেন্টেশন দেখুন
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 