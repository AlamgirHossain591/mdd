import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ক্যাটাগরি ডেটা ফাইল পাথ
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

export async function DELETE(request: Request) {
  try {
    // URL থেকে আইডি পারামিটার নেওয়া
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ক্যাটাগরি আইডি প্রয়োজন' },
        { status: 400 }
      );
    }
    
    // বর্তমান ক্যাটাগরি লোড করা
    let categories = loadCategories();
    
    // ক্যাটাগরি খুঁজে বের করা
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'ক্যাটাগরি খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }
    
    // ক্যাটাগরি অ্যারে থেকে মুছে ফেলা
    const deletedCategory = categories[categoryIndex];
    categories.splice(categoryIndex, 1);
    
    // আপডেট করা ক্যাটাগরি ডেটা সেভ করা
    const isSaved = saveCategories(categories);
    
    if (!isSaved) {
      return NextResponse.json(
        { error: 'ক্যাটাগরি মুছতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
    
    // সাকসেস রেসপন্স রিটার্ন করা
    return NextResponse.json(
      { success: true, message: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে', deletedCategory },
      { status: 200 }
    );
  } catch (error) {
    console.error('ক্যাটাগরি মুছতে সমস্যা:', error);
    return NextResponse.json(
      { error: 'ক্যাটাগরি মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 