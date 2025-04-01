'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Chart.js কম্পোনেন্ট রেজিস্টার করা
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

type DashboardStats = {
  totalSales: string;
  totalOrders: string;
  newCustomers: string;
  weeklyGrowth: {
    sales: string;
    orders: string;
    customers: string;
  };
};

type OrderItemDetailed = {
  id: string;
  title: string;
  quantity: number;
  price: string;
  image?: string;
};

type Order = {
  id: string;
  customer: string;
  date: string;
  items: string;
  itemsDetailed?: OrderItemDetailed[];
  total: string;
  status: string;
  statusColor: string;
  shippingAddress?: string;
  phoneNumber?: string;
};

type Product = {
  id: string;
  title: string;
  sales: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  orderCount: string;
  totalSpent: string;
};

type CourierStatus = {
  [key: string]: {
    status: string;
    banglaStatus?: string;
    trackingCode?: string;
    consignmentId?: string;
  };
};

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSales: '৳০',
    totalOrders: '০',
    newCustomers: '০',
    weeklyGrowth: {
      sales: '+০%',
      orders: '+০%',
      customers: '+০%'
    }
  });
  
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // নতুন স্টেট ভেরিয়েবল - কুরিয়ার স্ট্যাটাস, প্রোডাক্টস, অর্ডারস
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [courierStatuses, setCourierStatuses] = useState<CourierStatus>({});
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে');
        }
        
        const data = await response.json();
        
        // সেট স্টেট অবজেক্টস
        setDashboardStats(data.dashboardStats);
        setRecentOrders(data.recentOrders.slice(0, 3)); // শুধু সাম্প্রতিক ৩টি অর্ডার
        setTopProducts(data.topProducts);
        setRecentCustomers(data.recentCustomers);
        
        // সমস্ত অর্ডার সেট করা
        if (Array.isArray(data.recentOrders)) {
          setOrders(data.recentOrders);
        }
        
        // প্রোডাক্ট ডাটা লোড করা
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (Array.isArray(productsData)) {
            setProducts(productsData);
          }
        }
        
        // কুরিয়ার স্টেটাস লোড করা
        const savedCourierStatus = localStorage.getItem('steadfast_courier_status');
        if (savedCourierStatus) {
          setCourierStatuses(JSON.parse(savedCourierStatus));
        }
        
        setError(null);
      } catch (error) {
        console.error('ড্যাশবোর্ড ডাটা লোড করতে সমস্যা:', error);
        setError('ডাটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
        
        // ফলব্যাক: লোকাল স্টোরেজ থেকে অর্ডার ডাটা লোড করার চেষ্টা করা
        try {
          const ordersData = localStorage.getItem('orders');
          if (ordersData) {
            const orders = JSON.parse(ordersData);
            
            // Calculate total sales
            const totalSales = orders.reduce((sum: number, order: any) => {
              // Check if total exists and is a string before using replace
              let amount = 0;
              if (order.total) {
                if (typeof order.total === 'string') {
                  amount = parseFloat(order.total.replace('৳', '').replace(/,/g, ''));
                } else if (typeof order.total === 'number') {
                  amount = order.total;
                }
              }
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0);
            
            // Update stats
            setDashboardStats({
              ...dashboardStats,
              totalSales: `৳${totalSales.toLocaleString('bn-BD')}`,
              totalOrders: orders.length.toString()
            });
            
            // Update recent orders
            if (orders.length > 0) {
              // Get latest 3 orders
              const recent = orders.slice(0, 3).map((order: any) => ({
                id: order.id || '#অজানা',
                customer: order.customer || 'অজানা',
                date: order.date || 'অজানা',
                items: order.items || 'অজানা',
                itemsDetailed: order.itemsDetailed || [],
                total: order.total || '৳০',
                status: order.status || 'অজানা',
                statusColor: order.statusColor || 'gray',
                shippingAddress: order.shippingAddress || 'অজানা',
                phoneNumber: order.phoneNumber || 'অজানা'
              }));
              
              setRecentOrders(recent);
              setOrders(orders);
            }
            
            // প্রোডাক্ট ডাটা লোকাল স্টোরেজ থেকে
            const savedProducts = localStorage.getItem('products');
            if (savedProducts) {
              setProducts(JSON.parse(savedProducts));
            }
          }
        } catch (error) {
          console.error('লোকাল স্টোরেজ থেকে ডাটা লোড করতে সমস্যা:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Order card এর জন্য প্রোডাক্ট ইমেজ পাওয়ার ফাংশন
  const getOrderProductImages = (order: Order) => {
    if (order.itemsDetailed && order.itemsDetailed.length > 0) {
      return order.itemsDetailed.map(item => item.image || getDefaultProductImage(item.title)).slice(0, 3);
    } else if (order.items && typeof order.items === 'string') {
      const itemCount = parseInt(order.items.split(' ')[0] || '0');
      return Array(Math.min(itemCount, 3)).fill('https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image');
    }
    return ['https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image'];
  };
  
  // Default product image জেনারেট করার ফাংশন
  const getDefaultProductImage = (title: string) => {
    const encodedTitle = encodeURIComponent(title.substring(0, 20));
    return `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodedTitle}`;
  };
  
  // Status badge জেনারেট করার ফাংশন
  const getStatusBadge = (status: string, color: string) => {
    const colorClasses = {
      'green': 'bg-green-100 text-green-800',
      'yellow': 'bg-yellow-100 text-yellow-800',
      'red': 'bg-red-100 text-red-800'
    }[color] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
        {status}
      </span>
    );
  };
  
  // কুরিয়ার স্ট্যাটাস অনুযায়ী কত পারসেন্ট কোন স্ট্যাটাসে আছে
  const getCourierStatusStats = () => {
    const statusCounts: { [key: string]: number } = {};
    let totalCount = 0;
    
    // কুরিয়ার স্ট্যাটাস কাউন্ট করা
    Object.values(courierStatuses).forEach(item => {
      if (item.status) {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
        totalCount++;
      }
    });
    
    // স্ট্যাটাস বাংলা তে অনুবাদ করা
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
    
    // পাই চার্টের ডাটা তৈরি করা
    const statuses = Object.keys(statusCounts);
    const counts = statuses.map(status => statusCounts[status]);
    const labels = statuses.map(status => getStatusTranslation(status));
    
    const percentages = statuses.map(status => {
      return (statusCounts[status] / totalCount * 100).toFixed(1);
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'কুরিয়ার স্ট্যাটাস',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
          ],
          borderWidth: 1,
        },
      ],
      percentages,
      totalCount
    };
  };
  
  // প্রোডাক্ট স্টক স্ট্যাটাস (কত পারসেন্ট স্টক আছে, কত পারসেন্ট বিক্রি হয়েছে)
  const getProductStockStats = () => {
    let totalStock = 0;
    let totalSold = 0;
    
    // প্রতিটি প্রোডাক্টের স্টক ও বিক্রি কাউন্ট করা
    products.forEach((product: any) => {
      const stock = typeof product.stock === 'number' ? product.stock : 0;
      const sales = product.sales || 0;
      
      totalStock += stock;
      totalSold += sales;
    });
    
    const totalItems = totalStock + totalSold;
    
    // পাই চার্টের ডাটা
    return {
      labels: ['স্টক আছে', 'বিক্রি হয়েছে'],
      datasets: [
        {
          label: 'প্রোডাক্ট স্টক',
          data: [totalStock, totalSold],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
      inStockPercentage: totalItems > 0 ? (totalStock / totalItems * 100).toFixed(1) : '0',
      soldPercentage: totalItems > 0 ? (totalSold / totalItems * 100).toFixed(1) : '0',
      totalStock,
      totalSold
    };
  };
  
  // প্রোডাক্ট বাই প্রোডাক্ট স্টক এবং বিক্রির তথ্য পাওয়ার ফাংশন
  const getProductStockAndSalesStats = () => {
    // প্রোডাক্টগুলিকে বিক্রি অনুসারে সাজানো
    const sortedProducts = [...products].sort((a, b) => {
      const aSales = typeof a.sales === 'number' ? a.sales : parseInt(a.sales || '0');
      const bSales = typeof b.sales === 'number' ? b.sales : parseInt(b.sales || '0');
      return bSales - aSales;
    }).slice(0, 10); // শীর্ষ ১০টি প্রোডাক্ট

    // প্রোডাক্টের নাম এবং বিক্রি/স্টক তথ্য
    const labels = sortedProducts.map(p => {
      // প্রোডাক্ট নাম থেকে সাইজ এবং কালার সম্পর্কিত অংশ বাদ দেওয়া
      let title = p.title || 'অজানা প্রোডাক্ট';
      
      // সাইজ এবং কালার রিমুভ করার জন্য রেগুলার এক্সপ্রেশন
      // "Product Name - M/Red" হলে শুধু "Product Name" রাখা হবে
      if (title.includes('-')) {
        title = title.split('-')[0].trim();
      }
      
      // কোষ্ঠক সহ সাইজ/কালার বাদ দেওয়া (যেমন: "Product Name (XL/Black)")
      if (title.includes('(')) {
        title = title.split('(')[0].trim();
      }
      
      // স্ল্যাশ সহ সাইজ/কালার বাদ দেওয়া (যেমন: "Product Name M/Red")
      if (title.match(/\b[SMLXsmxl]+\/[A-Za-z]+\b/)) {
        title = title.replace(/\s+[SMLXsmxl]+\/[A-Za-z]+\b/, '');
      }
      
      return title;
    });
    
    const salesData = sortedProducts.map(p => {
      return typeof p.sales === 'number' ? p.sales : parseInt(p.sales || '0');
    });
    const stockData = sortedProducts.map(p => {
      return typeof p.stock === 'number' ? p.stock : parseInt(p.stock || '0');
    });

    // প্রতিটি প্রোডাক্টের জন্য বিক্রি পারসেন্টেজ ক্যালকুলেট
    const percentages = sortedProducts.map(p => {
      const sales = typeof p.sales === 'number' ? p.sales : parseInt(p.sales || '0');
      const stock = typeof p.stock === 'number' ? p.stock : parseInt(p.stock || '0');
      const total = sales + stock;
      
      // টাইটেল থেকে সাইজ এবং কালার বাদ দেওয়া
      let title = p.title || 'অজানা প্রোডাক্ট';
      
      // সাইজ এবং কালার রিমুভ করার জন্য রেগুলার এক্সপ্রেশন
      if (title.includes('-')) {
        title = title.split('-')[0].trim();
      }
      
      if (title.includes('(')) {
        title = title.split('(')[0].trim();
      }
      
      if (title.match(/\b[SMLXsmxl]+\/[A-Za-z]+\b/)) {
        title = title.replace(/\s+[SMLXsmxl]+\/[A-Za-z]+\b/, '');
      }
      
      return {
        id: p.id,
        title: title,
        salesPercent: total > 0 ? ((sales / total) * 100).toFixed(1) : '0',
        stockPercent: total > 0 ? ((stock / total) * 100).toFixed(1) : '0',
        sales: sales,
        stock: stock,
        total: total
      };
    });

    return {
      chartData: {
        labels,
        datasets: [
          {
            label: 'বিক্রি',
            data: salesData,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'স্টক',
            data: stockData,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }
        ]
      },
      detailedData: percentages
    };
  };
  
  // সমস্ত চার্ট ডাটা প্রস্তুত করা
  const courierStatusData = getCourierStatusStats();
  const productStockData = getProductStockStats();
  const productDetailedStats = getProductStockAndSalesStats();
  
  // রিফ্রেশ ফাংশন
  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-green-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ত্রুটি!</h1>
          <p className="text-green-700 mb-6">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-green-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-green-800">ড্যাশবোর্ড ওভারভিউ</h1>
              <button 
                onClick={handleRefresh}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                রিফ্রেশ করুন
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h3 className="text-lg font-medium text-pink-700">মোট বিক্রয়</h3>
                <p className="text-2xl font-bold">{dashboardStats.totalSales}</p>
                <p className="text-sm text-green-600">{dashboardStats.weeklyGrowth.sales} গত সপ্তাহের থেকে</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-green-700">মোট অর্ডার</h3>
                <p className="text-2xl font-bold">{dashboardStats.totalOrders}</p>
                <p className="text-sm text-green-600">{dashboardStats.weeklyGrowth.orders} গত সপ্তাহের থেকে</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-medium text-purple-700">নতুন গ্রাহক</h3>
                <p className="text-2xl font-bold">{dashboardStats.newCustomers}</p>
                <p className="text-sm text-green-600">{dashboardStats.weeklyGrowth.customers} গত সপ্তাহের থেকে</p>
              </div>
            </div>
            
            {/* পরিসংখ্যান এবং চার্ট */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* কুরিয়ার স্ট্যাটাস চার্ট */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-800 p-2 border-b-2 border-pink-500 inline-block">কুরিয়ার স্ট্যাটাস</h2>
                <div className="h-64">
                  {courierStatusData.totalCount > 0 ? (
                    <Pie data={courierStatusData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-green-600">কোন কুরিয়ার স্ট্যাটাস ডাটা নেই</p>
                    </div>
                  )}
                </div>
                
                {courierStatusData.totalCount > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2 text-green-800">কুরিয়ার স্ট্যাটাস বিস্তারিত তথ্য</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-green-50">
                            <th className="py-2 px-3 text-left text-green-700">স্ট্যাটাস</th>
                            <th className="py-2 px-3 text-center text-green-700">সংখ্যা</th>
                            <th className="py-2 px-3 text-center text-green-700">শতকরা হার</th>
                            <th className="py-2 px-3 text-center text-green-700">চার্ট</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courierStatusData.labels.map((label, index) => (
                            <tr key={label} className="border-t hover:bg-green-50">
                              <td className="py-2 px-3 font-medium text-green-700">{label}</td>
                              <td className="py-2 px-3 text-center text-green-700">{courierStatusData.datasets[0].data[index]}</td>
                              <td className="py-2 px-3 text-center text-green-700">{courierStatusData.percentages[index]}%</td>
                              <td className="py-2 px-3">
                                <div className="w-full bg-green-100 rounded-full h-2.5">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${courierStatusData.percentages[index]}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t font-medium">
                            <td className="py-2 px-3 text-green-800">মোট</td>
                            <td className="py-2 px-3 text-center text-green-800">{courierStatusData.totalCount}</td>
                            <td className="py-2 px-3 text-center text-green-800">100%</td>
                            <td className="py-2 px-3">
                              <div className="w-full bg-green-100 rounded-full h-2.5">
                                <div className="bg-green-600 h-2.5 rounded-full w-full"></div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              {/* প্রোডাক্ট স্টক স্ট্যাটাস */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-800 p-2 border-b-2 border-pink-500 inline-block">প্রোডাক্ট স্টক স্ট্যাটাস</h2>
                <div className="h-64">
                  {products.length > 0 ? (
                    <Pie data={productStockData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-green-600">কোন প্রোডাক্ট ডাটা নেই</p>
                    </div>
                  )}
                </div>
                
                {products.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-700">স্টক আছে</div>
                      <div className="text-xl font-bold">{productStockData.inStockPercentage}%</div>
                      <div className="text-sm text-green-600">মোট: {productStockData.totalStock} আইটেম</div>
                    </div>
                    
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <div className="text-sm text-pink-700">বিক্রি হয়েছে</div>
                      <div className="text-xl font-bold">{productStockData.soldPercentage}%</div>
                      <div className="text-sm text-pink-600">মোট: {productStockData.totalSold} আইটেম</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* প্রোডাক্ট-ওয়াইজ স্টক এবং বিক্রির বার চার্ট */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-green-100">
              <h2 className="text-xl font-semibold mb-4 text-green-800 p-2 border-b-2 border-pink-500 inline-block">প্রোডাক্ট অনুযায়ী স্টক এবং বিক্রি</h2>
              <div className="h-80">
                {products.length > 0 ? (
                  <Bar 
                    data={productDetailedStats.chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'প্রোডাক্ট অনুযায়ী স্টক এবং বিক্রি পরিমাণ'
                        }
                      },
                      scales: {
                        x: {
                          stacked: false,
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45
                          }
                        },
                        y: {
                          stacked: false,
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-green-600">কোন প্রোডাক্ট ডাটা নেই</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* প্রোডাক্ট অনুযায়ী বিস্তারিত তথ্য সহ টেবিল */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-green-100">
              <h2 className="text-xl font-semibold mb-4 text-purple-600 p-2 border-b-2 border-purple-500 inline-block">প্রোডাক্ট বিস্তারিত পরিসংখ্যান</h2>
              
              {products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="py-2 px-4 text-left text-purple-700">প্রোডাক্ট নাম</th>
                        <th className="py-2 px-4 text-center text-purple-700">স্টক পরিমাণ</th>
                        <th className="py-2 px-4 text-center text-purple-700">বিক্রি পরিমাণ</th>
                        <th className="py-2 px-4 text-center text-purple-700">স্টক শতকরা</th>
                        <th className="py-2 px-4 text-center text-purple-700">বিক্রি শতকরা</th>
                        <th className="py-2 px-4 text-center text-purple-700">চার্ট</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productDetailedStats.detailedData.map((product, idx) => (
                        <tr key={product.id || idx} className="border-t hover:bg-purple-50">
                          <td className="py-3 px-4 text-purple-700 font-medium">{product.title}</td>
                          <td className="py-3 px-4 text-center text-purple-700">{product.stock}</td>
                          <td className="py-3 px-4 text-center text-purple-700">{product.sales}</td>
                          <td className="py-3 px-4 text-center text-purple-700">{product.stockPercent}%</td>
                          <td className="py-3 px-4 text-center text-purple-700">{product.salesPercent}%</td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-purple-100 rounded-full h-2.5">
                              <div 
                                className="bg-purple-600 h-2.5 rounded-full" 
                                style={{ width: `${product.salesPercent}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-purple-600">কোন প্রোডাক্ট ডাটা নেই</p>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-green-900 p-2 border-b-2 border-green-500 inline-block">সাম্প্রতিক অর্ডারসমূহ</h2>
                <Link href="/dashboard/orders" className="text-green-800 hover:text-green-900 font-medium">
                  সকল অর্ডার দেখুন →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-green-100 rounded-lg">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="py-2 px-4 text-left text-green-900 font-semibold">অর্ডার আইডি</th>
                      <th className="py-2 px-4 text-left text-green-900 font-semibold">গ্রাহক</th>
                      <th className="py-2 px-4 text-left text-green-900 font-semibold">পণ্য</th>
                      <th className="py-2 px-4 text-left text-green-900 font-semibold">মূল্য</th>
                      <th className="py-2 px-4 text-left text-green-900 font-semibold">স্ট্যাটাস</th>
                      <th className="py-2 px-4 text-left text-green-900 font-semibold">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="border-t border-green-100 hover:bg-green-50">
                        <td className="py-3 px-4 text-green-900 font-medium">{order.id}</td>
                        <td className="py-3 px-4 text-green-900 font-semibold">{order.customer}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="flex -space-x-2 mr-2">
                              {getOrderProductImages(order).map((image, i) => (
                                <div key={i} className="w-8 h-8 rounded-full border border-green-200 overflow-hidden">
                                  <img 
                                    src={image} 
                                    alt={`Product ${i+1}`} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/ecfdf5/065f46?text=No+Image';
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            <span className="text-green-900 font-medium">{order.items}</span>
                            {order.itemsDetailed && order.itemsDetailed.length > 3 && (
                              <span className="text-xs text-green-900 font-semibold ml-1">
                                (+{order.itemsDetailed.length - 3} আরও)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-green-900 font-semibold">{order.total}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-green-600`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/orders/view/${order.id}`} className="text-green-800 hover:text-green-900 font-semibold underline">
                            দেখুন
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-5 text-center text-green-800 font-medium">
                          কোন সাম্প্রতিক অর্ডার নেই
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white border border-pink-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-pink-800 p-2 border-b-2 border-pink-500 inline-block">টপ পণ্যসমূহ</h2>
                  <Link href="/dashboard/products" className="text-pink-600 hover:text-pink-800 text-sm">
                    সকল পণ্য দেখুন →
                  </Link>
                </div>
                <ul className="space-y-3">
                  {topProducts.map((product) => (
                    <li key={product.id} className="flex justify-between items-center p-2 hover:bg-pink-50 rounded">
                      <span className="font-medium text-pink-900">{product.title}</span>
                      <span className="text-green-600">{product.sales}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white border border-purple-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-purple-900 p-2 border-b-2 border-purple-500 inline-block">সাম্প্রতিক গ্রাহকবৃন্দ</h2>
                  <Link href="/dashboard/customers" className="text-purple-800 hover:text-purple-900 font-semibold underline">
                    সকল গ্রাহক দেখুন →
                  </Link>
                </div>
                <ul className="space-y-3">
                  {recentCustomers.map((customer) => (
                    <li key={customer.id} className="flex justify-between items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200">
                      <div>
                        <span className="block font-semibold text-purple-900 text-lg">{customer.name}</span>
                        <span className="block font-medium text-purple-800">{customer.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-semibold text-purple-900">{customer.totalSpent}</span>
                        <span className="block font-medium text-purple-800">{customer.orderCount} অর্ডার</span>
                      </div>
                    </li>
                  ))}
                  {recentCustomers.length === 0 && (
                    <li className="text-center py-4 text-purple-900 font-medium">
                      কোন সাম্প্রতিক গ্রাহক নেই
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 