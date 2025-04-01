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

// স্টক আপডেট করার ফাংশন
const updateProductStock = (orderItems: any[]) => {
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
        
        // মূল স্টক আপডেট করা
        if (product.stock !== undefined) {
          product.stock = Math.max(0, product.stock - quantity);
        }
        
        // ভ্যারিয়েন্টে স্টক আপডেট করা
        if (product.variants && Array.isArray(product.variants)) {
          // সঠিক ভ্যারিয়েন্ট খুঁজে বের করা
          const variantIndex = product.variants.findIndex((v: any) => 
            v.size === variant.size && v.color === variant.color);
          
          if (variantIndex !== -1) {
            product.variants[variantIndex].stock = Math.max(0, product.variants[variantIndex].stock - quantity);
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
    console.error('স্টক আপডেট করতে সমস্যা:', error);
    return false;
  }
};

// GET অর্ডার - সকল অর্ডার পাওয়ার এপিআই
export async function GET() {
  try {
    const orders = loadOrders();
    
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
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('অর্ডার লোড করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'অর্ডার লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// POST অর্ডার - নতুন অর্ডার যোগ করার এপিআই
export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    
    if (!newOrder || !newOrder.items || !newOrder.customer) {
      return NextResponse.json(
        { error: 'অসম্পূর্ণ অর্ডার ডেটা' },
        { status: 400 }
      );
    }
    
    // আইডি এবং তারিখ যোগ করা
    const orders = loadOrders();
    
    // অর্ডার আইডি তৈরি করা - AN1, AN2, AN3 ফরম্যাটে
    let nextOrderNumber = 1;
    
    // বর্তমান অর্ডার তালিকায় সবচেয়ে বড় নাম্বারটি খুঁজে বের করা
    orders.forEach(order => {
      if (order.id.startsWith('AN')) {
        const orderNumber = parseInt(order.id.substring(2), 10);
        if (!isNaN(orderNumber) && orderNumber >= nextOrderNumber) {
          nextOrderNumber = orderNumber + 1;
        }
      }
    });
    
    const orderId = `AN${nextOrderNumber}`;
    
    // নতুন অর্ডার তৈরি
    const order = {
      id: orderId,
      date: new Date().toISOString(),
      customer: newOrder.customer,
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
      status: 'প্রক্রিয়াধীন', // ডিফল্ট স্ট্যাটাস
      shippingAddress: newOrder.shippingAddress,
      paymentMethod: newOrder.paymentMethod
    };
    
    // অর্ডার সেভ করা
    orders.unshift(order); // শুরুতে নতুন অর্ডার যোগ করা
    const isSaved = saveOrders(orders);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'অর্ডার সেভ করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    // স্টক আপডেট করা
    updateProductStock(newOrder.items);
    
    return NextResponse.json(
      { success: true, order },
      { status: 201 }
    );
  } catch (error) {
    console.error('অর্ডার তৈরি করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'অর্ডার তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 