import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// প্রোডাক্ট ডেটা ফাইল পাথ
const productsDataFilePath = path.join(process.cwd(), 'app', 'api', 'products', 'products.json');

// প্রোডাক্ট লোড করার ফাংশন
const loadProducts = () => {
  try {
    // চেক করা যে ফাইল আছে কিনা
    if (!fs.existsSync(productsDataFilePath)) {
      // ফাইল না থাকলে খালি প্রোডাক্ট অ্যারে সেভ করা
      fs.writeFileSync(productsDataFilePath, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = fs.readFileSync(productsDataFilePath, 'utf-8');
    let products = JSON.parse(data);
    
    // যদি প্রোডাক্ট অ্যারে না হয়, তাহলে খালি অ্যারে ব্যবহার করা
    if (!Array.isArray(products)) {
      fs.writeFileSync(productsDataFilePath, JSON.stringify([], null, 2));
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

export async function POST(request: Request) {
  try {
    // রিকোয়েস্ট থেকে প্রোডাক্ট ডাটা পাওয়া
    const newProduct = await request.json();
    
    if (!newProduct || !newProduct.id || !newProduct.title || !newProduct.price) {
      return NextResponse.json(
        { error: 'অসম্পূর্ণ প্রোডাক্ট ডাটা' },
        { status: 400 }
      );
    }
    
    // সব প্রোডাক্ট লোড করা
    const products = loadProducts();
    
    // আইডি চেক করা - আগে থেকে আছে কিনা
    const existingProductIndex = products.findIndex((p: any) => p.id === newProduct.id);
    
    if (existingProductIndex !== -1) {
      // আইডি আগে থেকে থাকলে, নতুন আইডি তৈরি করা
      newProduct.id = `PRD${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    // প্রোডাক্টে ডিফল্ট ফিল্ডগুলো যোগ করা যদি না থাকে
    if (!newProduct.variants || !Array.isArray(newProduct.variants) || newProduct.variants.length === 0) {
      newProduct.variants = [
        {
          size: "M",
          color: "ডিফল্ট",
          price: newProduct.price,
          stock: newProduct.stock || 0
        }
      ];
    }
    
    // ওজন এবং ডিসকাউন্ট নিশ্চিত করা
    newProduct.weight = newProduct.weight !== undefined ? newProduct.weight : 0.5;
    newProduct.discountPercent = newProduct.discountPercent !== undefined ? newProduct.discountPercent : 0;
    
    // ডিসকাউন্টেড প্রাইস গণনা করা যদি না থাকে
    if (newProduct.discountPercent > 0 && !newProduct.discountedPrice) {
      newProduct.discountedPrice = newProduct.price * (1 - newProduct.discountPercent / 100);
    }
    
    // নতুন প্রোডাক্ট যোগ করা
    products.push(newProduct);
    
    // সব প্রোডাক্ট সেভ করা
    const isSaved = saveProducts(products);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট সেভ করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('প্রোডাক্ট যোগ করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'প্রোডাক্ট যোগ করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 