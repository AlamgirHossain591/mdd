import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// প্রোডাক্ট ডেটা ফাইল পাথ
const productsDataFilePath = path.join(process.cwd(), 'app', 'api', 'products', 'products.json');

// প্রোডাক্ট ডেটা লোড করার ফাংশন
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
    
    // ফাইল সিস্টেমে সমস্যা হলে খালি অ্যারে রিটার্ন করা
    return [];
  }
};

export async function GET(request: Request) {
  try {
    // ক্যাটাগরি দিয়ে ফিল্টার করা
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const showAllStock = searchParams.get('showAllStock') === 'true';
    
    // প্রোডাক্ট ডেটা লোড করা
    const products = loadProducts();
    
    // ১. ক্যাটাগরি দিয়ে ফিল্টার করা - এখানে কেস ইনসেনসিটিভ চেক করা হচ্ছে
    let filteredProducts = category
      ? products.filter((p: any) => {
          if (!p.category) return false;
          return p.category.toLowerCase() === category.toLowerCase();
        })
      : products;
    
    // ২. স্টক অনুযায়ী ফিল্টার করা - শুধুমাত্র স্টক থাকলেই দেখাবে
    if (!showAllStock) {
      filteredProducts = filteredProducts.filter((product: any) => {
        // মূল প্রোডাক্টের স্টক চেক করা
        if (product.stock !== undefined && product.stock <= 0) {
          return false;
        }
        
        // ভ্যারিয়েন্ট চেক করা যদি থাকে
        if (product.variants && Array.isArray(product.variants)) {
          // যদি কোন ভ্যারিয়েন্টে স্টক থাকে তাহলে প্রোডাক্ট দেখাবে
          const hasStockInVariants = product.variants.some(
            (variant: any) => variant.stock > 0
          );
          
          return hasStockInVariants;
        }
        
        // যদি ভ্যারিয়েন্ট না থাকে এবং মূল স্টক ০ না হয়
        return product.stock > 0;
      });
    }
    
    // সরাসরি ফিল্টার করা প্রোডাক্ট অ্যারে রিটার্ন করা
    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('প্রোডাক্ট API ত্রুটি:', error);
    return NextResponse.json(
      { error: 'প্রোডাক্ট লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 