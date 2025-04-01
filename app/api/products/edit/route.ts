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

export async function PUT(request: Request) {
  try {
    // রিকোয়েস্ট থেকে প্রোডাক্ট ডাটা পাওয়া
    const updatedProduct = await request.json();
    
    if (!updatedProduct || !updatedProduct.id) {
      return NextResponse.json(
        { error: 'অসম্পূর্ণ প্রোডাক্ট ডাটা' },
        { status: 400 }
      );
    }
    
    // সব প্রোডাক্ট লোড করা
    const products = loadProducts();
    
    // প্রোডাক্ট খুঁজে বের করা
    const productIndex = products.findIndex((p: any) => p.id === updatedProduct.id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }
    
    // প্রোডাক্ট আপডেট করা
    products[productIndex] = {
      ...products[productIndex],
      ...updatedProduct,
      // নিশ্চিত করা যে variants ডেটা ঠিকমতো আছে
      variants: updatedProduct.variants || products[productIndex].variants,
      // নিশ্চিত করা যে ওজন এবং ডিসকাউন্ট তথ্য থাকে
      weight: updatedProduct.weight !== undefined ? updatedProduct.weight : (products[productIndex].weight || 0.5),
      discountPercent: updatedProduct.discountPercent !== undefined ? updatedProduct.discountPercent : (products[productIndex].discountPercent || 0),
      discountedPrice: updatedProduct.discountedPrice !== undefined ? updatedProduct.discountedPrice : products[productIndex].discountedPrice
    };
    
    // সব প্রোডাক্ট সেভ করা
    const isSaved = saveProducts(products);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, product: products[productIndex] },
      { status: 200 }
    );
  } catch (error) {
    console.error('প্রোডাক্ট আপডেট করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 