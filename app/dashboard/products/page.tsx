'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  stock: number;
  image: string;
  additionalImages?: string[];
  description?: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সকল');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  
  // সাইডবারের ক্যাটাগরি লোড করা
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
        }
        
        const data = await response.json();
        setCategories(data);
        setIsLoadingCategories(false);
      } catch (error) {
        console.error('ক্যাটাগরি লোড করতে ত্রুটি:', error);
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);
  
  useEffect(() => {
    // লোকাল স্টোরেজ থেকে প্রোডাক্ট লোড করার পরিবর্তে API থেকে লোড করা
    const loadProducts = async () => {
      try {
        setFilteredProducts([]);
        
        const response = await fetch(`/api/products?showAllStock=true`);
        if (!response.ok) {
          throw new Error('প্রোডাক্ট লোড করতে সমস্যা হয়েছে');
        }
        
        let productData = await response.json();
        
        // API response অ্যারে না হলে হ্যান্ডেল করা
        if (!Array.isArray(productData)) {
          productData = productData.products || [];
        }
        
        // অ্যাডমিন প্যানেলের ফরম্যাটে রূপান্তর করা
        const formattedProducts = productData.map((product: any) => ({
          id: product.id,
          title: product.title,
          price: typeof product.price === 'number' ? `৳${product.price}` : product.price,
          category: product.category,
          stock: product.stock || 0,
          image: product.image,
          additionalImages: product.additionalImages || [],
          description: product.description || ''
        }));
        
        console.log('API থেকে লোড করা প্রোডাক্ট:', formattedProducts.length);
        
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      } catch (error) {
        console.error('প্রোডাক্ট লোড করতে সমস্যা:', error);
        // এরর হলে ডিফল্ট প্রোডাক্ট লোড করা
        createDefaultProducts();
      }
    };
    
    loadProducts();
  }, []);
  
  // ডিফল্ট প্রোডাক্ট তৈরি করার ফাংশন
  const createDefaultProducts = () => {
    const defaultProducts = [
      { 
        id: 'PRD001', 
        title: 'প্রিমিয়াম কটন টি-শার্ট', 
        price: '৳৯৫০', 
        category: 'শার্ট', 
        stock: 45,
        image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=টি-শার্ট' 
      },
      { 
        id: 'PRD002', 
        title: 'স্লিম ফিট জিন্স', 
        price: '৳২,২৫০', 
        category: 'প্যান্ট', 
        stock: 32,
        image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=জিন্স' 
      },
      { 
        id: 'PRD003', 
        title: 'ফ্লোরাল প্রিন্ট শাড়ি', 
        price: '৳৩,৮৫০', 
        category: 'পোশাক', 
        stock: 24,
        image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=শাড়ি' 
      },
      { 
        id: 'PRD004', 
        title: 'এমব্রয়ডারি কুর্তি', 
        price: '৳১,৭৫০', 
        category: 'পোশাক', 
        stock: 38,
        image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=কুর্তি' 
      },
      { 
        id: 'PRD005', 
        title: 'ক্যাজুয়াল স্নিকার্স', 
        price: '৳২,৪৫০', 
        category: 'জুতা', 
        stock: 27,
        image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=স্নিকার্স' 
      },
      { 
        id: 'PRD006', 
        title: 'কিডস গ্রাফিক টি-শার্ট', 
        price: '৳৬৫০', 
        category: 'শীতের পোশাক', 
        stock: 55,
        image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=শিশু-শার্ট' 
      },
      { 
        id: 'PRD007', 
        title: 'লেদার ক্রসবডি ব্যাগ', 
        price: '৳১,৯৫০', 
        category: 'ব্যাগ', 
        stock: 19,
        image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=ব্যাগ' 
      },
      { 
        id: 'PRD008', 
        title: 'ডিজাইনার পাঞ্জাবি', 
        price: '৳২,৮৫০', 
        category: 'পোশাক', 
        stock: 23,
        image: 'https://placehold.co/400x400/e2e8f0/1e293b?text=পাঞ্জাবি' 
      }
    ];
    
    setProducts(defaultProducts);
    setFilteredProducts(defaultProducts);
    localStorage.setItem('products', JSON.stringify(defaultProducts));
    console.log('Default products created:', defaultProducts.length);
  };
  
  useEffect(() => {
    // প্রোডাক্ট ফিল্টার ও সর্ট করা
    let result = [...products];
    
    // সার্চ টার্ম দিয়ে ফিল্টার
    if (searchTerm) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // ক্যাটাগরি দিয়ে ফিল্টার
    if (selectedCategory !== 'সকল') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // স্টক অনুযায়ী ফিল্টার
    if (!showOutOfStock) {
      result = result.filter(product => product.stock > 0);
    }
    
    // প্রোডাক্ট সর্ট করা
    if (sortBy === 'newest') {
      // মনে করা হচ্ছে যে নতুন প্রোডাক্ট অ্যারের শেষে আছে
      result = [...result].reverse();
    } else if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => {
        const priceA = parseFloat(a.price.replace('৳', '').replace(',', ''));
        const priceB = parseFloat(b.price.replace('৳', '').replace(',', ''));
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => {
        const priceA = parseFloat(a.price.replace('৳', '').replace(',', ''));
        const priceB = parseFloat(b.price.replace('৳', '').replace(',', ''));
        return priceB - priceA;
      });
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy, showOutOfStock]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  // সাইডবার ক্যাটাগরি থেকে ক্যাটাগরি নাম পাওয়া
  const getCategoryOptions = () => {
    // প্রথমে "সকল" অপশন
    const options = [{ id: 'all', name: 'সকল', image: '' }];
    
    // এপিআই থেকে লোড করা ক্যাটাগরি যোগ করা
    if (categories.length > 0) {
      return [...options, ...categories];
    }
    
    return options;
  };
  
  const toggleStockVisibility = () => {
    setShowOutOfStock(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">পণ্যসমূহ</h1>
              <Link href="/dashboard/products/add" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition">
                + নতুন পণ্য যোগ করুন
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="পণ্য সার্চ করুন..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {isLoadingCategories ? (
                  <div className="px-3 py-1 rounded-full text-sm bg-gray-100 animate-pulse w-20 h-8"></div>
                ) : (
                  getCategoryOptions().map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.name)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategory === category.name
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
              
              <div className="flex w-full md:w-auto gap-3 items-center">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="newest">সর্বাধিক নতুন</option>
                  <option value="price-low">কম দাম থেকে বেশি</option>
                  <option value="price-high">বেশি দাম থেকে কম</option>
                </select>
                
                <button 
                  onClick={toggleStockVisibility}
                  className={`px-3 py-2 rounded text-sm flex items-center ${
                    showOutOfStock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {showOutOfStock ? 'স্টক শেষ দেখাচ্ছে' : 'স্টক শেষ লুকানো আছে'}
                </button>
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">কোন পণ্য পাওয়া যায়নি</p>
                {searchTerm || selectedCategory !== 'সকল' ? (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('সকল');
                    }}
                    className="mt-2 text-pink-600 hover:text-pink-800"
                  >
                    সব ফিল্টার পরিষ্কার করুন
                  </button>
                ) : (
                  <Link 
                    href="/dashboard/products/add" 
                    className="mt-2 inline-block text-pink-600 hover:text-pink-800"
                  >
                    নতুন পণ্য যোগ করুন
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">ছবি</th>
                      <th className="py-2 px-4 text-left">নাম</th>
                      <th className="py-2 px-4 text-left">ক্যাটাগরি</th>
                      <th className="py-2 px-4 text-left">মূল্য</th>
                      <th className="py-2 px-4 text-left">স্টক</th>
                      <th className="py-2 px-4 text-left">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <div className="relative h-14 w-14 overflow-hidden rounded-md">
                            <Image
                              src={product.image || 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image'}
                              alt={product.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                              onError={(e) => {
                                (e.target as any).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                                console.log('Image error for:', product.title);
                              }}
                              unoptimized
                            />
                          </div>
                        </td>
                        <td className="py-2 px-4 max-w-[200px]">
                          <p className="font-medium text-gray-800 truncate">{product.title}</p>
                          <p className="text-xs text-gray-500">ID: {product.id}</p>
                        </td>
                        <td className="py-2 px-4">{product.category}</td>
                        <td className="py-2 px-4 font-medium">{product.price}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.stock > 20
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.stock > 0 ? `${product.stock} পিস` : 'স্টক শেষ'}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex space-x-2">
                            <Link 
                              href={`/dashboard/products/view/${encodeURIComponent(product.id)}`} 
                              className="text-blue-600 hover:text-blue-800"
                              prefetch={false}
                            >
                              দেখুন
                            </Link>
                            <Link 
                              href={`/dashboard/products/edit/${encodeURIComponent(product.id)}`} 
                              className="text-green-600 hover:text-green-800"
                              prefetch={false}
                            >
                              এডিট
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 