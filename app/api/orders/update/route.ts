import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// অর্ডার ডেটা ফাইল পাথ
const ordersDataFilePath = path.join(process.cwd(), 'app', 'api', 'orders', 'orders.json');
// প্রোডাক্ট ডেটা ফাইল পাথ
const productsDataFilePath = path.join(process.cwd(), 'app', 'api', 'products', 'products.json');

// অর্ডার ডেটা লোড করার ফাংশন
const loadOrders = () => {
  try {
    // চেক করা যে ফাইল আছে কিনা
    if (!fs.existsSync(ordersDataFilePath)) {
      // ফাইল না থাকলে খালি অর্ডার অ্যারে সেভ করা
      fs.writeFileSync(ordersDataFilePath, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = fs.readFileSync(ordersDataFilePath, 'utf-8');
    let orders = JSON.parse(data);
    
    // যদি অর্ডার অ্যারে না হয়, তাহলে খালি অ্যারে ব্যবহার করা
    if (!Array.isArray(orders)) {
      fs.writeFileSync(ordersDataFilePath, JSON.stringify([], null, 2));
      return [];
    }
    
    return orders;
  } catch (error) {
    console.error('অর্ডার ডেটা লোড করতে সমস্যা:', error);
    return [];
  }
};

// অর্ডার সেভ করার ফাংশন
const saveOrders = (orders: any[]) => {
  try {
    // ডাটা ফাইলে সেভ করা
    fs.writeFileSync(ordersDataFilePath, JSON.stringify(orders, null, 2));
    return true;
  } catch (error) {
    console.error('অর্ডার ডেটা সেভ করতে সমস্যা:', error);
    return false;
  }
};

// প্রোডাক্ট ডেটা লোড করার ফাংশন
const loadProducts = () => {
  try {
    // চেক করা যে ফাইল আছে কিনা
    if (!fs.existsSync(productsDataFilePath)) {
      return [];
    }
    
    const data = fs.readFileSync(productsDataFilePath, 'utf-8');
    let products = JSON.parse(data);
    
    // যদি প্রোডাক্ট অ্যারে না হয়, তাহলে খালি অ্যারে ব্যবহার করা
    if (!Array.isArray(products)) {
      return [];
    }
    
    return products;
  } catch (error) {
    console.error('প্রোডাক্ট ডেটা লোড করতে সমস্যা:', error);
    return [];
  }
};

// প্রোডাক্ট সেভ করার ফাংশন
const saveProducts = (products: any[]) => {
  try {
    // ডাটা ফাইলে সেভ করা
    fs.writeFileSync(productsDataFilePath, JSON.stringify(products, null, 2));
    return true;
  } catch (error) {
    console.error('প্রোডাক্ট ডেটা সেভ করতে সমস্যা:', error);
    return false;
  }
};

// অর্ডার বাতিল হলে স্টক ফেরত দেওয়ার ফাংশন
const returnStock = (orderItems: any[]) => {
  try {
    // প্রোডাক্ট ডেটা লোড করা
    const products = loadProducts();
    let isStockUpdated = false;

    // প্রতিটি অর্ডার আইটেমের জন্য স্টক আপডেট করা
    orderItems.forEach(orderItem => {
      const { id, quantity, variant } = orderItem;
      
      // প্রোডাক্ট খুঁজে বের করা
      const productIndex = products.findIndex((p: any) => p.id === id);
      
      if (productIndex !== -1) {
        const product = products[productIndex];
        
        // মূল স্টক আপডেট করা (বাড়ানো)
        if (product.stock !== undefined) {
          product.stock += quantity;
        }
        
        // ভ্যারিয়েন্টে স্টক আপডেট করা (বাড়ানো)
        if (product.variants && Array.isArray(product.variants)) {
          // সঠিক ভ্যারিয়েন্ট খুঁজে বের করা
          const variantIndex = product.variants.findIndex((v: any) => 
            v.size === variant.size && v.color === variant.color);
          
          if (variantIndex !== -1) {
            product.variants[variantIndex].stock += quantity;
            isStockUpdated = true;
          }
        }
        
        // আপডেট করা প্রোডাক্ট সেট করা
        products[productIndex] = product;
      }
    });
    
    // যদি কোন স্টক আপডেট হয়ে থাকে, তাহলে সেভ করা
    if (isStockUpdated) {
      saveProducts(products);
    }
    
    return isStockUpdated;
  } catch (error) {
    console.error('স্টক ফেরত দিতে সমস্যা:', error);
    return false;
  }
};

// PUT রিকোয়েস্ট - একাধিক অর্ডারের স্ট্যাটাস আপডেট করা
export async function PUT(request: Request) {
  try {
    const { orderIds, status } = await request.json();
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'অবৈধ অর্ডার আইডি' },
        { status: 400 }
      );
    }
    
    if (!status) {
      return NextResponse.json(
        { error: 'স্ট্যাটাস দেয়া হয়নি' },
        { status: 400 }
      );
    }
    
    // সব অর্ডার লোড করা
    let orders = loadOrders();
    let updatedCount = 0;
    
    // অর্ডার বাতিল হলে স্টক ফেরত দেওয়ার জন্য
    if (status === 'বাতিল') {
      // যেসব অর্ডার বাতিল করা হবে সেগুলো খুঁজে বের করা
      const ordersToCancel = orders.filter(order => 
        orderIds.includes(order.id) && order.status !== 'বাতিল');
      
      // প্রতিটি অর্ডারের আইটেম স্টকে ফেরত দেওয়া
      ordersToCancel.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          returnStock(order.items);
        }
      });
    }
    
    // প্রতিটি অর্ডার আপডেট করা
    orders = orders.map(order => {
      if (orderIds.includes(order.id)) {
        updatedCount++;
        return {
          ...order,
          status,
          // যদি স্ট্যাটাস "সম্পন্ন" হয়, তাহলে completedAt ফিল্ড যোগ করা
          ...(status === 'সম্পন্ন' ? { completedAt: new Date().toISOString() } : {})
        };
      }
      return order;
    });
    
    // অর্ডার সর্ট করা - নতুন থেকে পুরাতন এবং 'প্রক্রিয়াধীন' স্ট্যাটাস সবার উপরে
    orders.sort((a, b) => {
      // প্রক্রিয়াধীন অর্ডারগুলো সবার উপরে থাকবে
      if (a.status === 'প্রক্রিয়াধীন' && b.status !== 'প্রক্রিয়াধীন') {
        return -1;
      }
      if (a.status !== 'প্রক্রিয়াধীন' && b.status === 'প্রক্রিয়াধীন') {
        return 1;
      }
      
      // উভয়ই প্রক্রিয়াধীন হলে বা কোনটাই প্রক্রিয়াধীন না হলে তারিখ অনুসারে সর্ট
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // নতুন থেকে পুরাতন
    });
    
    // সেভ করা
    const isSaved = saveOrders(orders);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'অর্ডার সেভ করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `${updatedCount}টি অর্ডার আপডেট করা হয়েছে`,
      orders
    });
  } catch (error) {
    console.error('অর্ডার আপডেট করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'অর্ডার আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 