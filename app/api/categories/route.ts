import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ক্যাটাগরি ডেটা ফাইল পাথ
const dataFilePath = path.join(process.cwd(), 'app', 'api', 'categories', 'categories.json');

// ডিফল্ট ক্যাটাগরি ডাটা
const defaultCategories = [
  {
    id: "1",
    name: "পোশাক",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "শার্ট",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=988&auto=format&fit=crop"
  },
  {
    id: "3",
    name: "প্যান্ট",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=997&auto=format&fit=crop"
  },
  {
    id: "4",
    name: "জুতা",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=1025&auto=format&fit=crop"
  },
  {
    id: "5",
    name: "ব্যাগ",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=876&auto=format&fit=crop"
  },
  {
    id: "6",
    name: "গহনা",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=988&auto=format&fit=crop"
  },
  {
    id: "7",
    name: "সাজসজ্জা",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=880&auto=format&fit=crop"
  },
  {
    id: "8",
    name: "শীতের পোশাক",
    image: "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?q=80&w=1170&auto=format&fit=crop"
  }
];

// ক্যাটাগরি ডেটা লোড করার ফাংশন
const loadCategories = () => {
  try {
    // চেক করা যে ফাইল আছে কিনা
    if (!fs.existsSync(dataFilePath)) {
      // ফাইল না থাকলে ডিফল্ট ক্যাটাগরি গুলো সেভ করা
      fs.writeFileSync(dataFilePath, JSON.stringify(defaultCategories, null, 2));
      return defaultCategories;
    }
    
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    let categories = JSON.parse(data);
    
    // যদি ক্যাটাগরি অ্যারে খালি হয়, তাহলে ডিফল্ট ক্যাটাগরি বেবহার করা
    if (!Array.isArray(categories) || categories.length === 0) {
      fs.writeFileSync(dataFilePath, JSON.stringify(defaultCategories, null, 2));
      return defaultCategories;
    }
    
    return categories;
  } catch (error) {
    console.error('ক্যাটাগরি ডেটা লোড করতে সমস্যা:', error);
    
    // ফাইল সিস্টেমে সমস্যা হলে ডিফল্ট ক্যাটাগরি রিটার্ন করা
    return defaultCategories;
  }
};

export async function GET() {
  try {
    // ক্যাটাগরি ডেটা লোড করা
    const categories = loadCategories();
    
    // ক্যাটাগরি ডাটা রিটার্ন করা
    return NextResponse.json(categories);
  } catch (error) {
    console.error('ক্যাটাগরি API ত্রুটি:', error);
    return NextResponse.json(
      { error: 'ক্যাটাগরি লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
} 