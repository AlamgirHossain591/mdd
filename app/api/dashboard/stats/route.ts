import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ডাটা ফাইল পাথ
const statsDataFilePath = path.join(process.cwd(), 'app', 'api', 'dashboard', 'stats', 'dashboardStats.json');
const ordersDataFilePath = path.join(process.cwd(), 'app', 'api', 'dashboard', 'stats', 'recentOrders.json');
const topProductsDataFilePath = path.join(process.cwd(), 'app', 'api', 'dashboard', 'stats', 'topProducts.json');
const customersDataFilePath = path.join(process.cwd(), 'app', 'api', 'dashboard', 'stats', 'recentCustomers.json');

// ডিফল্ট ড্যাশবোর্ড স্ট্যাটস ডাটা
const defaultDashboardStats = {
  totalSales: '৳০',
  totalOrders: '০',
  newCustomers: '০',
  weeklyGrowth: {
    sales: '০%',
    orders: '০%',
    customers: '০%'
  }
};

// ডিফল্ট রিসেন্ট অর্ডার ডাটা
const defaultRecentOrders: Array<{
  id: string;
  customer: string;
  date: string;
  items: string;
  itemsDetailed?: Array<{ id: string; title: string; quantity: number; price: string }>;
  total: string;
  status: string;
  statusColor: string;
  shippingAddress: string;
  phoneNumber: string;
}> = [];

// ডিফল্ট টপ প্রোডাক্ট ডাটা
const defaultTopProducts: Array<{
  id: string;
  title: string;
  sales: string;
}> = [];

// ডিফল্ট রিসেন্ট কাস্টমার ডাটা
const defaultRecentCustomers: Array<{
  id: string;
  name: string;
  phone: string;
  orderCount: string;
  totalSpent: string;
}> = [];

// জেনেরিক ডাটা লোড করার ফাংশন
const loadData = (filePath: string, defaultData: any) => {
  try {
    // চেক করা যে ফাইল আছে কিনা
    if (!fs.existsSync(filePath)) {
      // ফাইল না থাকলে ডিরেক্টরি তৈরি করা
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // ডিফল্ট ডাটা সেভ করা
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`ডাটা লোড করতে সমস্যা (${filePath}):`, error);
    return defaultData;
  }
};

export async function GET() {
  try {
    // ডাটা লোড করা
    const dashboardStats = loadData(statsDataFilePath, defaultDashboardStats);
    const recentOrders = loadData(ordersDataFilePath, defaultRecentOrders);
    const topProducts = loadData(topProductsDataFilePath, defaultTopProducts);
    const recentCustomers = loadData(customersDataFilePath, defaultRecentCustomers);
    
    return NextResponse.json({
      dashboardStats,
      recentOrders,
      topProducts,
      recentCustomers
    });
  } catch (error) {
    console.error('ড্যাশবোর্ড স্ট্যাটস API ত্রুটি:', error);
    return NextResponse.json(
      { error: 'ড্যাশবোর্ড স্ট্যাটস লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 