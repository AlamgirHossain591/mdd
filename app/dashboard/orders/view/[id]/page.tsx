'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
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

export default function ViewOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  // স্টেডফাস্ট কুরিয়ার সম্পর্কিত স্টেট
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [courierStatus, setCourierStatus] = useState<{status: string, trackingCode?: string, consignmentId?: string, banglaStatus?: string} | null>(null);
  const [sendingToCourier, setSendingToCourier] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusHistory, setStatusHistory] = useState<Array<{status: string, timestamp: string, banglaStatus?: string}>>([]);
  
  // স্ট্যাটাস চেকিং টাইমার রেফারেন্স
  const statusCheckTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoStatusCheckEnabled, setAutoStatusCheckEnabled] = useState(true);
  
  // API থেকে অর্ডার লোড করা
  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      // সব অর্ডার লোড করা
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('অর্ডার লোড করতে সমস্যা হয়েছে');
      }
      
      const orders = await response.json();
      const foundOrder = orders.find((o: Order) => o.id === id);
      
      if (foundOrder) {
        setOrder(foundOrder);
        setUpdateStatus(foundOrder.status); // বর্তমান স্ট্যাটাস সেট করা
      } else {
        setError('অর্ডার খুঁজে পাওয়া যায়নি');
        // লোকাল স্টোরেজ থেকে চেক করা
        tryLoadFromLocalStorage();
      }
    } catch (err) {
      console.error('API থেকে অর্ডার লোড করতে সমস্যা:', err);
      // এরর হলে লোকাল স্টোরেজ থেকে চেষ্টা করা
      tryLoadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };
  
  // লোকাল স্টোরেজ থেকে অর্ডার লোড করার চেষ্টা করা
  const tryLoadFromLocalStorage = () => {
    try {
      const ordersJSON = localStorage.getItem('orders');
      const productsJSON = localStorage.getItem('products');
      
      if (ordersJSON) {
        const orders = JSON.parse(ordersJSON);
        const foundOrder = orders.find((o: any) => o.id === id);
        
        if (foundOrder) {
          // লোকাল স্টোরেজের ফরম্যাট API ফরম্যাটে কনভার্ট করা
          const convertedOrder = {
            id: foundOrder.id,
            date: foundOrder.date,
            customer: {
              name: foundOrder.customer,
              phone: foundOrder.phone,
              email: ''
            },
            shippingAddress: {
              address: foundOrder.address,
              city: '',
              postalCode: '',
              country: 'বাংলাদেশ'
            },
            items: foundOrder.itemsDetailed ? 
              foundOrder.itemsDetailed.map((item: any) => ({
                id: item.productId,
                title: item.title,
                price: parseFloat(item.price.replace('৳', '')),
                quantity: item.quantity,
                variant: {
                  size: 'Standard',
                  color: ''
                },
                image: item.image
              })) : [],
            totalAmount: parseFloat(foundOrder.total.replace('৳', '')),
            status: foundOrder.status,
            paymentMethod: 'ক্যাশ অন ডেলিভারি',
            completedAt: foundOrder.status === 'সম্পন্ন' ? new Date().toISOString() : undefined
          };
          
          setOrder(convertedOrder);
          setUpdateStatus(convertedOrder.status);
        } else {
          setError('অর্ডার খুঁজে পাওয়া যায়নি');
        }
      } else {
        setError('অর্ডার তালিকা খুঁজে পাওয়া যায়নি');
      }
      
      // প্রোডাক্ট ডাটা লোড করা
      if (productsJSON) {
        const products = JSON.parse(productsJSON);
        setProducts(products);
      }
    } catch (err) {
      setError('অর্ডারের তথ্য লোড করতে সমস্যা হয়েছে');
      console.error('Error loading order from localStorage:', err);
    }
  };
  
  useEffect(() => {
    fetchOrder();
  }, [id]);
  
  // স্টেডফাস্টে অর্ডার পাঠানোর ফাংশন
  const sendOrderToCourier = async () => {
    if (!order) return;
    
    // পাঠানো হচ্ছে স্টেটাস সেট করা
    setSendingToCourier(true);
    setError('');
    
    try {
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
        status: 'sent',
        banglaStatus: getStatusTranslation('sent'),
        trackingCode: responseData.tracking_code,
        consignmentId: responseData.consignment_id
      };
      
      setCourierStatus(newCourierStatus);
      
      // স্ট্যাটাস হিস্টোরি আপডেট করা
      setStatusHistory([
        { 
          status: 'sent', 
          banglaStatus: getStatusTranslation('sent'),
          timestamp: new Date().toISOString() 
        }
      ]);
      
      // লোকাল স্টোরেজে সেভ করা
      try {
        const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
        const courierStatusData = savedCourierStatus ? JSON.parse(savedCourierStatus) : {};
        
        // আমরা অতিরিক্ত ট্র্যাকিং ইনফরমেশন সেভ করবো
        courierStatusData[id] = {
          ...newCourierStatus,
          orderSentAt: new Date().toISOString(),
          nextCheckAt: new Date(Date.now() + 60000).toISOString(), // ১ মিনিট পর
          checkCount: 0,
          autoCheckEnabled: true,
          statusHistory: [
            { 
              status: 'sent', 
              banglaStatus: getStatusTranslation('sent'),
              timestamp: new Date().toISOString() 
            }
          ]
        };
        
        localStorage.setItem('steadfast_courier_status', JSON.stringify(courierStatusData));
        
        // ১ মিনিট পর প্রথম অটো-চেক সেট করা
        scheduleNextStatusCheck(60000); // 1 মিনিট (60 সেকেন্ড * 1000 মিলিসেকেন্ড)
      } catch (e) {
        console.error('কুরিয়ার স্ট্যাটাস সেভ করতে সমস্যা:', e);
      }
      
      // সাকসেস মেসেজ
      setUpdateSuccess(`অর্ডার #${order.id} কুরিয়ারে সফলভাবে পাঠানো হয়েছে। ট্র্যাকিং কোড: ${responseData.tracking_code}`);
      setTimeout(() => setUpdateSuccess(''), 5000);
      
    } catch (err: any) {
      console.error('কুরিয়ারে পাঠাতে সমস্যা:', err);
      setError(err.message || 'কুরিয়ারে পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSendingToCourier(false);
    }
  };
  
  // স্টেডফাস্ট কুরিয়ার স্ট্যাটাস চেক করার ফাংশন
  const checkCourierStatus = async (isAutoCheck = false) => {
    if (!courierStatus || !courierStatus.trackingCode) return;
    
    if (!isAutoCheck) setCheckingStatus(true);
    if (!isAutoCheck) setError('');
    
    try {
      // API কী চেক করা
      if (!apiKey || !secretKey) {
        throw new Error('API কী এবং সিক্রেট কী সেট করুন');
      }
      
      // স্টেডফাস্ট API কল করা
      const response = await fetch(`/api/courier/send-to-steadfast?apiKey=${apiKey}&secretKey=${secretKey}&trackingCode=${courierStatus.trackingCode}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'কুরিয়ার স্ট্যাটাস চেক করতে সমস্যা হয়েছে');
      }
      
      const responseData = await response.json();
      
      // যদি স্ট্যাটাস পরিবর্তন হয়, তাহলে হিস্টোরিতে যোগ করা
      const status = responseData.status;
      const currentStatus = courierStatus.status;
      const banglaStatus = responseData.banglaStatus || getStatusTranslation(status);
      
      // নতুন স্ট্যাটাস যোগ করা
      if (status !== currentStatus) {
        setStatusHistory(prev => [
          ...prev, 
          { 
            status, 
            banglaStatus,
            timestamp: new Date().toISOString() 
          }
        ]);
        
        // কুরিয়ার স্ট্যাটাস অনুযায়ী অর্ডার স্ট্যাটাস আপডেট করা
        updateOrderStatusBasedOnCourier(status);
      }
      
      // কুরিয়ার স্ট্যাটাস আপডেট করা
      const newCourierStatus = {
        ...courierStatus,
        status: status,
        banglaStatus
      };
      
      setCourierStatus(newCourierStatus);
      
      // লোকাল স্টোরেজে সেভ করা
      try {
        const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
        const courierStatusData = savedCourierStatus ? JSON.parse(savedCourierStatus) : {};
        
        // স্ট্যাটাস ইনফো আপডেট করা
        const currentStatusInfo = courierStatusData[id] || {};
        const checkCount = (currentStatusInfo.checkCount || 0) + 1;
        
        // পরবর্তী চেক সময় নির্ধারণ করা
        let nextCheckAt;
        let autoCheckEnabled = true;
        
        // "cancelled", "partial_delivered", "delivered" হলে আর চেক করবো না
        const finalStatuses = ["cancelled", "partial_delivered", "delivered"];
        if (finalStatuses.includes(status)) {
          autoCheckEnabled = false;
          nextCheckAt = null;
        } else if (checkCount === 1) {
          // প্রথম চেকের পর ২৪ ঘন্টা পর চেক করবে
          nextCheckAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // ২৪ ঘন্টা
        } else {
          // পরবর্তী চেকগুলি ১ ঘন্টা পর পর
          nextCheckAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // ১ ঘন্টা
        }
        
        // স্ট্যাটাস হিস্টোরি আপডেট করা
        let statusHistory = currentStatusInfo.statusHistory || [];
        if (status !== currentStatus) {
          statusHistory = [
            ...statusHistory,
            { 
              status, 
              banglaStatus,
              timestamp: new Date().toISOString() 
            }
          ];
        }
        
        // আপডেটেড ইনফো সেভ করা
        courierStatusData[id] = {
          ...newCourierStatus,
          orderSentAt: currentStatusInfo.orderSentAt,
          nextCheckAt,
          checkCount,
          lastCheckedAt: new Date().toISOString(),
          autoCheckEnabled,
          statusHistory
        };
        
        localStorage.setItem('steadfast_courier_status', JSON.stringify(courierStatusData));
        
        // পরবর্তী অটো-চেক সেট করা যদি সক্রিয় থাকে
        if (autoCheckEnabled && nextCheckAt) {
          if (checkCount === 1) {
            // প্রথম চেকের পর ২৪ ঘন্টা পর
            scheduleNextStatusCheck(24 * 60 * 60 * 1000); // 24 ঘন্টা
          } else {
            // পরবর্তী চেকগুলি ১ ঘন্টা পর পর
            scheduleNextStatusCheck(60 * 60 * 1000); // 1 ঘন্টা
          }
        } else {
          // যদি অটো-চেক বন্ধ থাকে
          if (statusCheckTimerRef.current) {
            clearTimeout(statusCheckTimerRef.current);
            statusCheckTimerRef.current = null;
          }
          setAutoStatusCheckEnabled(false);
        }
      } catch (e) {
        console.error('কুরিয়ার স্ট্যাটাস সেভ করতে সমস্যা:', e);
      }
      
      // সাকসেস মেসেজ (শুধু ম্যানুয়াল চেকে দেখাবে)
      if (!isAutoCheck) {
        setUpdateSuccess(`কুরিয়ার স্ট্যাটাস: ${responseData.banglaStatus}`);
        setTimeout(() => setUpdateSuccess(''), 5000);
      }
      
    } catch (err: any) {
      console.error('কুরিয়ার স্ট্যাটাস চেক করতে সমস্যা:', err);
      if (!isAutoCheck) {
        setError(err.message || 'কুরিয়ার স্ট্যাটাস চেক করতে সমস্যা হয়েছে');
      }
      
      // অটো চেকের সময় এরর হলেও পরবর্তী চেক সেট করা
      if (isAutoCheck) {
        scheduleNextStatusCheck(60 * 60 * 1000); // 1 ঘন্টা পর আবার চেষ্টা করবে
      }
    } finally {
      if (!isAutoCheck) setCheckingStatus(false);
    }
  };
  
  // কুরিয়ার স্ট্যাটাস অনুযায়ী অর্ডার স্ট্যাটাস আপডেট করার ফাংশন
  const updateOrderStatusBasedOnCourier = async (courierStatus: string) => {
    if (!order) return;
    
    let newOrderStatus = '';
    
    // কুরিয়ার স্ট্যাটাস অনুযায়ী অর্ডার স্ট্যাটাস ম্যাপিং
    switch (courierStatus) {
      case 'delivered':
        newOrderStatus = 'সম্পন্ন';
        break;
      case 'cancelled':
        newOrderStatus = 'বাতিল';
        break;
      case 'partial_delivered':
        newOrderStatus = 'আংশিক সম্পন্ন'; // এই স্ট্যাটাস ড্রপডাউন মেনুতে যোগ করতে হবে
        break;
      case 'returned':
        newOrderStatus = 'ফেরত দেওয়া হয়েছে'; // এই স্ট্যাটাস ড্রপডাউন মেনুতে যোগ করতে হবে
        break;
      case 'picked_up':
      case 'in_transit':
      case 'out_for_delivery':
      case 'pending':
      case 'pickup_assigned':
        newOrderStatus = 'শিপিং হয়েছে';
        break;
      default:
        return; // অন্যান্য স্ট্যাটাসের জন্য কোন আপডেট নয়
    }
    
    // অর্ডার স্ট্যাটাস আপডেট করা
    setUpdateStatus(newOrderStatus);
    
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: [order.id],
          status: newOrderStatus
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'অর্ডার আপডেট করতে সমস্যা হয়েছে');
      }
      
      // সফল হলে অর্ডার আপডেট করা
      setOrder({
        ...order,
        status: newOrderStatus,
        completedAt: newOrderStatus === 'সম্পন্ন' ? new Date().toISOString() : order.completedAt
      });
      
      setUpdateSuccess(`কুরিয়ার স্ট্যাটাস: ${getStatusTranslation(courierStatus)} অনুযায়ী অর্ডার স্ট্যাটাস ${newOrderStatus} করা হয়েছে`);
      
      // লোকাল স্টোরেজ থেকেও আপডেট করা (ব্যাকাপ হিসেবে)
      try {
        const ordersJSON = localStorage.getItem('orders');
        if (ordersJSON) {
          const orders = JSON.parse(ordersJSON);
          const updatedOrders = orders.map((o: any) => {
            if (o.id === order.id) {
              return { ...o, status: newOrderStatus };
            }
            return o;
          });
          localStorage.setItem('orders', JSON.stringify(updatedOrders));
        }
      } catch (err) {
        console.error('লোকাল স্টোরেজ আপডেট করতে সমস্যা:', err);
      }
      
    } catch (err: any) {
      console.error('অর্ডার আপডেট করতে সমস্যা:', err);
      setError(err.message || 'অর্ডার আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setUpdating(false);
    }
  };
  
  // অর্ডার ডিলিট করা
  const handleDelete = async () => {
    if (!order || !window.confirm('আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি মুছতে চান?')) {
      return;
    }
    
    try {
      // API কল করা
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'অর্ডার মুছতে সমস্যা হয়েছে');
      }
      
      // লোকাল স্টোরেজ থেকেও ডিলিট করা
      try {
        const ordersJSON = localStorage.getItem('orders');
        if (ordersJSON) {
          const orders = JSON.parse(ordersJSON);
          const updatedOrders = orders.filter((o: any) => o.id !== order.id);
          localStorage.setItem('orders', JSON.stringify(updatedOrders));
        }
      } catch (err) {
        console.error('লোকাল স্টোরেজ থেকে ডিলিট করতে সমস্যা:', err);
      }
      
      // অর্ডার তালিকায় ফিরে যাওয়া
      window.location.href = '/dashboard/orders';
      
    } catch (err: any) {
      setError(err.message || 'অর্ডার মুছতে সমস্যা হয়েছে');
      console.error('Error deleting order:', err);
    }
  };
  
  // স্ট্যাটাসের জন্য কালার ক্লাস
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'প্রক্রিয়াধীন':
        return 'bg-blue-100 text-blue-800';
      case 'শিপিং হয়েছে':
        return 'bg-orange-100 text-orange-800';
      case 'সম্পন্ন':
        return 'bg-green-100 text-green-800';
      case 'আংশিক সম্পন্ন':
        return 'bg-yellow-100 text-yellow-800';
      case 'ফেরত দেওয়া হয়েছে':
        return 'bg-amber-100 text-amber-800';
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
  
  // প্রোডাক্টের ডিফল্ট ইমেজ পাওয়া
  const getDefaultProductImage = (title: string) => {
    // Generate a default image based on product title
    const searchTerm = title.split(' ')[0].toLowerCase();
    return `https://source.unsplash.com/random/100x100/?${searchTerm}`;
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
  
  // কুরিয়ার সার্ভিসের সকল সম্ভাব্য স্ট্যাটাস একটি তালিকা আকারে দেখানোর জন্য UI আপডেট করছি
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

  // স্ট্যাটাসের ব্যাকগ্রাউন্ড কালার
  const getStatusBgColor = (status: string): string => {
    const bgColorMap: {[key: string]: string} = {
      'pending': 'bg-blue-100',
      'pickup_assigned': 'bg-purple-100',
      'picked_up': 'bg-indigo-100',
      'in_transit': 'bg-cyan-100',
      'out_for_delivery': 'bg-teal-100',
      'delivered': 'bg-green-100',
      'cancelled': 'bg-red-100',
      'failed_delivery': 'bg-orange-100',
      'returned': 'bg-amber-100',
      'partial_delivered': 'bg-yellow-100',
      'hold': 'bg-gray-100',
      'lost': 'bg-rose-100',
      'damaged': 'bg-pink-100',
      'sent': 'bg-blue-100'
    };
    
    return bgColorMap[status] || 'bg-blue-100';
  };
  
  // কম্পোনেন্ট লোড হওয়ার সময় API কী লোড করা
  useEffect(() => {
    // API এবং Secret কী লোড করা লোকাল স্টোরেজ থেকে
    const savedApiKey = localStorage.getItem('steadfast_api_key');
    const savedSecretKey = localStorage.getItem('steadfast_secret_key');
    const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedSecretKey) setSecretKey(savedSecretKey);
    
    if (savedCourierStatus) {
      try {
        const courierStatusData = JSON.parse(savedCourierStatus);
        if (courierStatusData[id]) {
          const statusInfo = courierStatusData[id];
          setCourierStatus(statusInfo);
          setAutoStatusCheckEnabled(statusInfo.autoCheckEnabled !== false);
          
          // স্ট্যাটাস হিস্টোরি লোড করা
          if (statusInfo.statusHistory) {
            setStatusHistory(statusInfo.statusHistory);
          }
          
          // পরবর্তী চেক সময় থাকলে এবং অটো-চেক সক্রিয় থাকলে টাইমার সেট করা
          if (statusInfo.nextCheckAt && statusInfo.autoCheckEnabled !== false) {
            const nextCheckTime = new Date(statusInfo.nextCheckAt).getTime();
            const now = Date.now();
            
            if (nextCheckTime > now) {
              // পরবর্তী চেক সময় এখনও আসেনি
              scheduleNextStatusCheck(nextCheckTime - now);
            } else {
              // পরবর্তী চেক সময় ইতিমধ্যে চলে গেছে, তাই এখনই চেক করা
              setTimeout(() => {
                checkCourierStatus(true);
              }, 5000); // 5 সেকেন্ড পর চেক করবে যাতে পেজ রেন্ডার হওয়ার সময় পায়
            }
          }
        }
      } catch (e) {
        console.error('কুরিয়ার স্ট্যাটাস পার্স করতে সমস্যা:', e);
      }
    }
  }, [id]);
  
  // কম্পোনেন্ট আনমাউন্ট হলে টাইমার ক্লিয়ার করা
  useEffect(() => {
    return () => {
      if (statusCheckTimerRef.current) {
        clearTimeout(statusCheckTimerRef.current);
      }
    };
  }, []);
  
  // পরবর্তী স্ট্যাটাস চেক সময় সেট করা
  const scheduleNextStatusCheck = (delay: number) => {
    // আগের টাইমার থাকলে ক্লিয়ার করা
    if (statusCheckTimerRef.current) {
      clearTimeout(statusCheckTimerRef.current);
    }
    
    // নতুন টাইমার সেট করা
    statusCheckTimerRef.current = setTimeout(() => {
      checkCourierStatus(true); // true পাস করা মানে অটো চেক
    }, delay);
    
    setAutoStatusCheckEnabled(true);
  };
  
  // অটো-চেক এনাবল/ডিজেবল করা
  const toggleAutoStatusCheck = () => {
    const newAutoCheckEnabled = !autoStatusCheckEnabled;
    setAutoStatusCheckEnabled(newAutoCheckEnabled);
    
    try {
      // লোকাল স্টোরেজে সেভ করা
      const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
      const courierStatusData = savedCourierStatus ? JSON.parse(savedCourierStatus) : {};
      
      if (courierStatusData[id]) {
        courierStatusData[id].autoCheckEnabled = newAutoCheckEnabled;
        localStorage.setItem('steadfast_courier_status', JSON.stringify(courierStatusData));
      }
      
      if (newAutoCheckEnabled) {
        // পুনরায় সক্রিয় করা হলে ১ ঘন্টা পর পরবর্তী চেক সেট করা
        scheduleNextStatusCheck(60 * 60 * 1000);
      } else {
        // বন্ধ করা হলে টাইমার ক্লিয়ার করা
        if (statusCheckTimerRef.current) {
          clearTimeout(statusCheckTimerRef.current);
          statusCheckTimerRef.current = null;
        }
      }
    } catch (e) {
      console.error('অটো-চেক স্টেটাস সেভ করতে সমস্যা:', e);
    }
  };
  
  // স্ট্যাটাস আপডেট করার আগের ফাংশন
  const handleUpdateStatus = async () => {
    if (!order) return;
    
    setUpdating(true);
    setUpdateSuccess('');
    
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: [order.id],
          status: updateStatus
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'অর্ডার আপডেট করতে সমস্যা হয়েছে');
      }
      
      // সফল হলে অর্ডার আপডেট করা
      setOrder({
        ...order,
        status: updateStatus,
        completedAt: updateStatus === 'সম্পন্ন' ? new Date().toISOString() : order.completedAt
      });
      
      setUpdateSuccess('অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে');
      
      // লোকাল স্টোরেজ থেকেও আপডেট করা (ব্যাকাপ হিসেবে)
      try {
        const ordersJSON = localStorage.getItem('orders');
        if (ordersJSON) {
          const orders = JSON.parse(ordersJSON);
          const updatedOrders = orders.map((o: any) => {
            if (o.id === order.id) {
              return { ...o, status: updateStatus };
            }
            return o;
          });
          localStorage.setItem('orders', JSON.stringify(updatedOrders));
        }
      } catch (err) {
        console.error('লোকাল স্টোরেজ আপডেট করতে সমস্যা:', err);
      }
      
    } catch (err: any) {
      console.error('অর্ডার আপডেট করতে সমস্যা:', err);
      setError(err.message || 'অর্ডার আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setUpdating(false);
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
  
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">অর্ডার পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-6">{error || 'আপনি যে অর্ডারটি খুঁজছেন তা পাওয়া যায়নি। এটি অপসারণ করা হয়েছে বা আইডি ভুল হতে পারে।'}</p>
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
  
  // পরবর্তী স্ট্যাটাস চেক সময় গণনা করা
  const getNextCheckTime = () => {
    try {
      const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
      if (savedCourierStatus) {
        const courierStatusData = JSON.parse(savedCourierStatus);
        if (courierStatusData[id] && courierStatusData[id].nextCheckAt) {
          const nextCheckTime = new Date(courierStatusData[id].nextCheckAt);
          return nextCheckTime;
        }
      }
    } catch (e) {
      console.error('পরবর্তী চেক সময় পার্স করতে সমস্যা:', e);
    }
    return null;
  };
  
  // চেকের সংখ্যা গণনা করা
  const getCheckCount = () => {
    try {
      const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
      if (savedCourierStatus) {
        const courierStatusData = JSON.parse(savedCourierStatus);
        if (courierStatusData[id]) {
          return courierStatusData[id].checkCount || 0;
        }
      }
    } catch (e) {
      console.error('চেক সংখ্যা পার্স করতে সমস্যা:', e);
    }
    return 0;
  };
  
  const nextCheckTime = getNextCheckTime();
  const checkCount = getCheckCount();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white shadow-md md:h-screen p-4">
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
            
            <Link href="/dashboard/categories" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              ক্যাটাগরি
            </Link>
            
            <Link href="/" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-100">
              হোমপেজ
            </Link>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          {updateSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {updateSuccess}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">অর্ডার বিবরণ</h1>
                <p className="text-gray-600">অর্ডার আইডি: {order.id}</p>
              </div>
              <div className="flex items-center mt-4 md:mt-0 space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">স্ট্যাটাস:</span>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                    disabled={updating || updateStatus === order.status}
                    className="px-3 py-1 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                  >
                    {updating ? 'আপডেট হচ্ছে...' : 'আপডেট'}
                  </button>
                </div>
                
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  অর্ডার বাতিল
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* অর্ডার ইনফরমেশন */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">অর্ডার সম্পর্কিত তথ্য</h2>
                
                <div className="space-y-3">
                  <div>
                    <span className="block text-sm font-medium text-gray-500">অর্ডারের তারিখ</span>
                    <span className="text-gray-800">{formatDate(order.date)}</span>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-gray-500">বর্তমান স্ট্যাটাস</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${getStatusColorClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-gray-500">পেমেন্ট মেথড</span>
                    <span className="text-gray-800">{order.paymentMethod}</span>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-gray-500">মোট মূল্য</span>
                    <span className="text-lg font-semibold text-pink-600">৳{order.totalAmount}</span>
                  </div>
                </div>
              </div>
              
              {/* গ্রাহকের তথ্য */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">গ্রাহকের তথ্য</h2>
                
                <div className="space-y-3">
                  <div>
                    <span className="block text-sm font-medium text-gray-500">নাম</span>
                    <span className="text-gray-800">{order.customer.name}</span>
                  </div>
                  
                  <div>
                    <span className="block text-sm font-medium text-gray-500">ফোন</span>
                    <span className="text-gray-800">{order.customer.phone}</span>
                  </div>
                  
                  {order.customer.email && (
                    <div>
                      <span className="block text-sm font-medium text-gray-500">ইমেইল</span>
                      <span className="text-gray-800">{order.customer.email}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="block text-sm font-medium text-gray-500">ঠিকানা</span>
                    <span className="text-gray-800">
                      {order.shippingAddress.address}, {order.shippingAddress.city}
                      {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* অর্ডার আইটেমসমূহ - টেবিল ভিউ */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">অর্ডারের বিস্তারিত তথ্য</h2>
              
              {/* অর্ডারের সব ছবি একসাথে দেখানো */}
              <div className="bg-gray-50 rounded-lg overflow-hidden p-4 mb-6">
                <h3 className="text-md font-semibold mb-3">অর্ডারের ছবিসমূহ</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="relative h-40 w-full rounded-md overflow-hidden border border-gray-200">
                      {/* পরিমাণ ব্যাজ */}
                      <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs p-1 px-2 rounded-bl-md font-bold z-10">
                        {item.quantity} পিস
                      </div>
                      
                      <Image
                        src={item.image || getDefaultProductImage(item.title)}
                        alt={item.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
                        {item.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">পণ্য</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">বিবরণ</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">দাম</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">পরিমাণ</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">মোট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-4 text-sm text-gray-800">
                          <div className="flex items-center space-x-3">
                            <div className="h-16 w-16 relative flex-shrink-0">
                              <Image
                                src={item.image || getDefaultProductImage(item.title)}
                                alt={item.title}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <span className="font-medium">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div>সাইজ: {item.variant.size}</div>
                          <div>রং: {item.variant.color}</div>
                          <div>প্রোডাক্ট আইডি: {item.id}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-right text-gray-800">৳{item.price}</td>
                        <td className="px-4 py-4 text-sm text-right text-gray-800">{item.quantity}</td>
                        <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">৳{item.price * item.quantity}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-600">সাবটোটাল:</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                        ৳{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-600">ডেলিভারি চার্জ:</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                        ৳{order.totalAmount - order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td colSpan={4} className="px-4 py-3 text-right text-base font-bold text-pink-600">সর্বমোট:</td>
                      <td className="px-4 py-3 text-right text-base font-bold text-pink-600">৳{order.totalAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* কুরিয়ার সার্ভিস সেকশন - আপডেট করা হয়েছে */}
            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">কুরিয়ার সার্ভিস</h2>
              
              {courierStatus && courierStatus.trackingCode ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ট্র্যাকিং কোড:</p>
                      <p className="text-lg font-semibold text-blue-600">{courierStatus.trackingCode}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">কনসাইনমেন্ট আইডি:</p>
                      <p className="text-lg font-semibold">{courierStatus.consignmentId || 'উপলব্ধ নয়'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">বর্তমান স্ট্যাটাস:</p>
                      <p className={`text-lg font-semibold ${getStatusColor(courierStatus.status)}`}>
                        {courierStatus.banglaStatus || getStatusTranslation(courierStatus.status) || 'অপেক্ষমান'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">মোট চেক সংখ্যা:</p>
                      <p className="text-lg font-semibold">{checkCount}</p>
                    </div>
                  </div>
                  
                  {/* স্ট্যাটাস হিস্টোরি */}
                  {statusHistory.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-md font-semibold mb-3">স্ট্যাটাস হিস্টোরি</h3>
                      <div className="relative">
                        {/* টাইমলাইন */}
                        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-300"></div>
                        
                        <div className="space-y-4 ml-10">
                          {statusHistory.map((historyItem, index) => (
                            <div key={index} className="relative">
                              {/* টাইমলাইন ডট */}
                              <div className={`absolute -left-6 mt-1.5 h-4 w-4 rounded-full ${getStatusBgColor(historyItem.status)} border-2 border-white`}></div>
                              
                              <div className={`p-3 rounded-lg ${getStatusBgColor(historyItem.status)}`}>
                                <p className={`font-medium ${getStatusColor(historyItem.status)}`}>
                                  {historyItem.banglaStatus || getStatusTranslation(historyItem.status)}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(historyItem.timestamp)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {nextCheckTime && autoStatusCheckEnabled && ['delivered', 'cancelled', 'partial_delivered'].indexOf(courierStatus.status) === -1 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        পরবর্তী স্ট্যাটাস চেক: {formatDate(nextCheckTime.toISOString())}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => checkCourierStatus()}
                      disabled={checkingStatus || !courierStatus.trackingCode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {checkingStatus ? 'চেক করা হচ্ছে...' : 'স্ট্যাটাস আপডেট করুন'}
                    </button>
                    
                    <button
                      onClick={toggleAutoStatusCheck}
                      className={`px-4 py-2 ${autoStatusCheckEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md transition`}
                      disabled={['delivered', 'cancelled', 'partial_delivered'].includes(courierStatus.status)}
                    >
                      {autoStatusCheckEnabled ? 'অটো চেকিং বন্ধ করুন' : 'অটো চেকিং চালু করুন'}
                    </button>
                  </div>
                  
                  {['delivered', 'cancelled', 'partial_delivered'].includes(courierStatus.status) && (
                    <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-gray-700">
                      <p>অর্ডারটি "{courierStatus.banglaStatus || getStatusTranslation(courierStatus.status)}" স্ট্যাটাসে আছে, তাই অটোমেটিক স্ট্যাটাস চেক বন্ধ করা হয়েছে।</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">এই অর্ডারটি কুরিয়ারে পাঠানো হয়নি।</p>
                  <button
                    onClick={sendOrderToCourier}
                    disabled={sendingToCourier || !apiKey || !secretKey}
                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition disabled:opacity-50"
                  >
                    {sendingToCourier ? 'পাঠানো হচ্ছে...' : 'কুরিয়ারে পাঠান'}
                  </button>
                  
                  {(!apiKey || !secretKey) && (
                    <p className="mt-2 text-xs text-red-500">API কী এবং সিক্রেট কী সেট করুন</p>
                  )}
                </div>
              )}
              
              {/* API কী ইনপুট ফর্ম */}
              <div className="mt-4 border-t border-blue-200 pt-4">
                <h3 className="text-md font-semibold mb-3">স্টেডফাস্ট API কী সেটিংস</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">API কী</label>
                    <input 
                      type="text" 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="আপনার API কী লিখুন"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">সিক্রেট কী</label>
                    <input 
                      type="password" 
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="আপনার সিক্রেট কী লিখুন"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <button 
                    onClick={() => {
                      localStorage.setItem('steadfast_api_key', apiKey);
                      localStorage.setItem('steadfast_secret_key', secretKey);
                      setUpdateSuccess('API কী সফলভাবে সেভ করা হয়েছে');
                      setTimeout(() => setUpdateSuccess(''), 3000);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                  >
                    API কী সেভ করুন
                  </button>
                </div>
              </div>
              
              {/* সম্ভাব্য কুরিয়ার স্ট্যাটাস তালিকা */}
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3">কুরিয়ার স্ট্যাটাসের তালিকা</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className={`p-2 rounded ${getStatusBgColor('pending')}`}>
                    <span className={`font-medium ${getStatusColor('pending')}`}>অপেক্ষমান</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('pickup_assigned')}`}>
                    <span className={`font-medium ${getStatusColor('pickup_assigned')}`}>পিকআপ নির্ধারিত হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('picked_up')}`}>
                    <span className={`font-medium ${getStatusColor('picked_up')}`}>পিকআপ হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('in_transit')}`}>
                    <span className={`font-medium ${getStatusColor('in_transit')}`}>ট্রানজিটে আছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('out_for_delivery')}`}>
                    <span className={`font-medium ${getStatusColor('out_for_delivery')}`}>ডেলিভারির জন্য বের হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('delivered')}`}>
                    <span className={`font-medium ${getStatusColor('delivered')}`}>ডেলিভারি হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('cancelled')}`}>
                    <span className={`font-medium ${getStatusColor('cancelled')}`}>বাতিল হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('failed_delivery')}`}>
                    <span className={`font-medium ${getStatusColor('failed_delivery')}`}>ডেলিভারি ব্যর্থ হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('returned')}`}>
                    <span className={`font-medium ${getStatusColor('returned')}`}>ফেরত পাঠানো হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('partial_delivered')}`}>
                    <span className={`font-medium ${getStatusColor('partial_delivered')}`}>আংশিক ডেলিভারি হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('hold')}`}>
                    <span className={`font-medium ${getStatusColor('hold')}`}>হোল্ড করা হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('lost')}`}>
                    <span className={`font-medium ${getStatusColor('lost')}`}>হারিয়ে গেছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('damaged')}`}>
                    <span className={`font-medium ${getStatusColor('damaged')}`}>ক্ষতিগ্রস্ত হয়েছে</span>
                  </div>
                  <div className={`p-2 rounded ${getStatusBgColor('sent')}`}>
                    <span className={`font-medium ${getStatusColor('sent')}`}>কুরিয়ারে পাঠানো হয়েছে</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link
              href="/dashboard/orders"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              অর্ডার তালিকায় ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 