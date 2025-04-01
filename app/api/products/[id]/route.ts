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

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট আইডি প্রদান করা হয়নি' },
        { status: 400 }
      );
    }
    
    // সব প্রোডাক্ট লোড করা
    const products = loadProducts();
    
    // নির্দিষ্ট আইডি দিয়ে প্রোডাক্ট খুঁজে বের করা
    const product = products.find((p: any) => p.id === id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('প্রোডাক্ট লোড করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'প্রোডাক্ট লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট আইডি প্রদান করা হয়নি' },
        { status: 400 }
      );
    }
    
    // সব প্রোডাক্ট লোড করা
    const products = loadProducts();
    
    // নির্দিষ্ট আইডি দিয়ে প্রোডাক্ট খুঁজে বের করা
    const productIndex = products.findIndex((p: any) => p.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }
    
    // প্রোডাক্ট মুছে ফেলা
    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    
    // আপডেট করা প্রোডাক্ট লিস্ট সেভ করা
    const isSaved = saveProducts(products);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট মুছতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, deletedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('প্রোডাক্ট মুছতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'প্রোডাক্ট মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 