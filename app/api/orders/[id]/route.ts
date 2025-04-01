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

// GET - নির্দিষ্ট অর্ডার পাওয়া
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'অর্ডার আইডি প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }
    
    const orders = loadOrders();
    const order = orders.find((o: any) => o.id === orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'অর্ডার পাওয়া যায়নি' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('অর্ডার পাওয়া যায়নি:', error);
    return NextResponse.json(
      { error: 'অর্ডার পাওয়া যায়নি' },
      { status: 500 }
    );
  }
}

// PUT - একটি নির্দিষ্ট অর্ডার আপডেট করা
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'অর্ডার আইডি প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }
    
    const updateData = await request.json();
    
    if (!updateData) {
      return NextResponse.json(
        { error: 'আপডেট ডাটা প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }
    
    const orders = loadOrders();
    const orderIndex = orders.findIndex((order: any) => order.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'অর্ডার পাওয়া যায়নি' },
        { status: 404 }
      );
    }
    
    const currentOrder = orders[orderIndex];
    
    // অর্ডার বাতিল হলে স্টক ফেরত দেওয়া
    if (updateData.status === 'বাতিল' && currentOrder.status !== 'বাতিল') {
      if (currentOrder.items && Array.isArray(currentOrder.items)) {
        returnStock(currentOrder.items);
      }
    }
    
    // অর্ডার আপডেট করা
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData,
      // যদি স্ট্যাটাস "সম্পন্ন" হয়, তাহলে completedAt ফিল্ড যোগ করা
      ...(updateData.status === 'সম্পন্ন' && !orders[orderIndex].completedAt
          ? { completedAt: new Date().toISOString() }
          : {})
    };
    
    // সেভ করা
    const isSaved = saveOrders(orders);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'অর্ডার আপডেট করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'অর্ডার সফলভাবে আপডেট করা হয়েছে',
      order: orders[orderIndex]
    });
  } catch (error) {
    console.error('অর্ডার আপডেট করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'অর্ডার আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// DELETE - একটি নির্দিষ্ট অর্ডার ডিলিট করা
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'অর্ডার আইডি প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }
    
    const orders = loadOrders();
    const orderIndex = orders.findIndex((order: any) => order.id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'অর্ডার পাওয়া যায়নি' },
        { status: 404 }
      );
    }
    
    // অর্ডার ডিলিট করা
    const deletedOrder = orders[orderIndex];
    
    // অর্ডার বাতিল হলে স্টক ফেরত দেওয়া
    if (deletedOrder.status !== 'বাতিল' && deletedOrder.items && Array.isArray(deletedOrder.items)) {
      returnStock(deletedOrder.items);
    }
    
    orders.splice(orderIndex, 1);
    
    // সেভ করা
    const isSaved = saveOrders(orders);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'অর্ডার ডিলিট করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'অর্ডার সফলভাবে ডিলিট করা হয়েছে',
      order: deletedOrder
    });
  } catch (error) {
    console.error('অর্ডার ডিলিট করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'অর্ডার ডিলিট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 