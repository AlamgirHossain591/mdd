import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ক্যাটাগরি ডেটা ফাইল পাথ (API ফোল্ডারে categories.json নামে একটি ফাইল রাখা হবে)
const dataFilePath = path.join(process.cwd(), 'app', 'api', 'categories', 'categories.json');

// ক্যাটাগরি টাইপ
type CategoryType = {
  id: string;
  name: string;
  image: string;
};

// ক্যাটাগরি ডেটা লোড করার ফাংশন
const loadCategories = (): CategoryType[] => {
  try {
    // চেক করা যে ফাইল আছে কিনা
    if (!fs.existsSync(dataFilePath)) {
      // ফাইল না থাকলে খালি অ্যারে রিটার্ন করা হবে
      return [];
    }
    
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('ক্যাটাগরি ডেটা লোড করতে সমস্যা:', error);
    return [];
  }
};

// ক্যাটাগরি ডেটা সেভ করার ফাংশন
const saveCategories = (categories: CategoryType[]): boolean => {
  try {
    // ফাইল ডিরেক্টরি তৈরি করা (যদি না থাকে)
    const dirPath = path.dirname(dataFilePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(categories, null, 2));
    return true;
  } catch (error) {
    console.error('ক্যাটাগরি ডেটা সেভ করতে সমস্যা:', error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    // রিকোয়েস্ট থেকে ডেটা পার্স করা
    const data = await request.json();
    
    // চেক করা যে প্রয়োজনীয় ডেটা আছে কিনা
    if (!data.name || !data.id) {
      return NextResponse.json(
        { error: 'ক্যাটাগরি নাম এবং আইডি প্রয়োজন' },
        { status: 400 }
      );
    }
    
    // বর্তমান ক্যাটাগরি লোড করা
    let categories = loadCategories();
    
    // আইডি চেক করা
    const existingCategoryWithId = categories.find(cat => cat.id === data.id);
    if (existingCategoryWithId) {
      return NextResponse.json(
        { error: 'এই আইডি সহ একটি ক্যাটাগরি ইতিমধ্যে আছে' },
        { status: 400 }
      );
    }
    
    // নাম চেক করা
    const existingCategoryWithName = categories.find(cat => cat.name === data.name);
    if (existingCategoryWithName) {
      return NextResponse.json(
        { error: 'এই নামে একটি ক্যাটাগরি ইতিমধ্যে আছে' },
        { status: 400 }
      );
    }
    
    // নতুন ক্যাটাগরি তৈরি করা
    const newCategory: CategoryType = {
      id: data.id,
      name: data.name,
      image: data.image || `https://placehold.co/300x300/7048e8/ffffff?text=${encodeURIComponent(data.name)}`
    };
    
    // ক্যাটাগরি অ্যারেতে যোগ করা
    categories.push(newCategory);
    
    // আপডেট করা ক্যাটাগরি ডেটা সেভ করা
    const isSaved = saveCategories(categories);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'ক্যাটাগরি সেভ করতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    // সাকসেস রেসপন্স রিটার্ন করা
    return NextResponse.json(
      { success: true, message: 'ক্যাটাগরি সফলভাবে যোগ করা হয়েছে', category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error('নতুন ক্যাটাগরি যোগ করতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'ক্যাটাগরি যোগ করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 