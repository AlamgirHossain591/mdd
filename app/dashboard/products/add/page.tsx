'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ক্যাটাগরি টাইপ
type CategoryType = {
  id: string;
  name: string;
  image: string;
};

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    stock: '1',
    image: '',
    additionalImages: ['', '', ''],
    newCategory: '',
    weight: '0.5', // কেজিতে ওজন, ডিফল্ট ০.৫ কেজি
    discountPercent: '0' // ডিসকাউন্ট শতকরা হারে
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>(['', '', '']);
  
  // Refs for file inputs
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [newCategoryImage, setNewCategoryImage] = useState<string>('');
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>('');
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);
  
  // ক্যাটাগরি লোড করা
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
        }
        
        const data = await response.json();
        setCategories(data);
        
        // প্রথম ক্যাটাগরি ডিফল্ট হিসেবে সেট করা
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({
            ...prev,
            category: data[0].name
          }));
        }
        
        setCategoryLoading(false);
      } catch (err) {
        console.error('ক্যাটাগরি লোড করতে ত্রুটি:', err);
        setCategoryLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdditionalImageChange = (index: number, value: string) => {
    const newAdditionalImages = [...formData.additionalImages];
    newAdditionalImages[index] = value;
    setFormData({
      ...formData,
      additionalImages: newAdditionalImages
    });
    
    // প্রিভিউ আপডেট করা
    const newPreviews = [...additionalImagePreviews];
    newPreviews[index] = value ? value : '';
    setAdditionalImagePreviews(newPreviews);
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setMainImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCategoryImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const newPreviews = [...additionalImagePreviews];
        newPreviews[index] = result;
        setAdditionalImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      additionalImages: [...formData.additionalImages, '']
    });
    setAdditionalImagePreviews([...additionalImagePreviews, '']);
  };

  const removeImageField = (index: number) => {
    const newAdditionalImages = [...formData.additionalImages];
    newAdditionalImages.splice(index, 1);
    setFormData({
      ...formData,
      additionalImages: newAdditionalImages
    });
    
    const newPreviews = [...additionalImagePreviews];
    newPreviews.splice(index, 1);
    setAdditionalImagePreviews(newPreviews);
  };
  
  // নতুন ক্যাটাগরি যোগ করা
  const addNewCategory = async () => {
    if (formData.newCategory.trim() === '') {
      setError('ক্যাটাগরির নাম দিতে হবে');
      return;
    }
    
    // ক্যাটাগরি নাম আগে থেকে আছে কিনা চেক করা
    if (categories.some(cat => cat.name === formData.newCategory.trim())) {
      setError('এই নামে একটি ক্যাটাগরি ইতিমধ্যে আছে');
      return;
    }
    
    try {
      const imageUrl = categoryImagePreview || newCategoryImage || `https://placehold.co/400x400/7048e8/ffffff?text=${encodeURIComponent(formData.newCategory)}`;
      
      const newCategory = {
        id: `CAT${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.newCategory.trim(),
        image: imageUrl
      };
      
      const response = await fetch('/api/categories/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      
      if (!response.ok) {
        throw new Error('ক্যাটাগরি যোগ করতে সমস্যা হয়েছে');
      }
      
      // সফলভাবে যোগ হলে ক্যাটাগরি লিস্ট আপডেট করা
      setCategories([...categories, newCategory]);
      
      // ফর্ম রিসেট করা
      setFormData({
        ...formData,
        category: newCategory.name,
        newCategory: ''
      });
      setNewCategoryImage('');
      setCategoryImagePreview('');
      setShowAddCategory(false);
      setError('');
    } catch (err) {
      console.error('ক্যাটাগরি যোগ করতে ত্রুটি:', err);
      setError('ক্যাটাগরি যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };
  
  // ক্যাটাগরি মুছে ফেলা
  const deleteCategory = async (categoryName: string) => {
    try {
      const categoryToRemove = categories.find(cat => cat.name === categoryName);
      
      if (!categoryToRemove) {
        throw new Error('ক্যাটাগরি খুঁজে পাওয়া যায়নি');
      }
      
      const response = await fetch(`/api/categories/delete?id=${categoryToRemove.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('ক্যাটাগরি মুছতে সমস্যা হয়েছে');
      }
      
      // ক্যাটাগরি লিস্ট আপডেট করা
      const updatedCategories = categories.filter(cat => cat.name !== categoryName);
      setCategories(updatedCategories);
      
      // যদি সিলেক্টেড ক্যাটাগরি মুছে ফেলা হয়, তাহলে প্রথম ক্যাটাগরি সিলেক্ট করা
      if (formData.category === categoryName && updatedCategories.length > 0) {
        setFormData({
          ...formData,
          category: updatedCategories[0].name
        });
      }
      
      setCategoryToDelete(null);
    } catch (err) {
      console.error('ক্যাটাগরি মুছতে ত্রুটি:', err);
      setError('ক্যাটাগরি মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setCategoryToDelete(null);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.category) {
      setError('অনুগ্রহ করে প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // নতুন প্রোডাক্ট আইডি জেনারেট করা
    const productId = `PRD${Math.floor(1000 + Math.random() * 9000)}`;
    
    // API ফরম্যাটে প্রোডাক্ট ডাটা তৈরি করা
    const productData = {
      id: productId,
      title: formData.title,
      price: parseFloat(formData.price.replace(/,/g, '')),
      discountPercent: parseFloat(formData.discountPercent) || 0,
      discountedPrice: parseFloat(formData.price.replace(/,/g, '')) * (1 - (parseFloat(formData.discountPercent) || 0) / 100),
      category: formData.category,
      stock: parseInt(formData.stock, 10),
      weight: parseFloat(formData.weight) || 0.5,
      image: mainImagePreview || formData.image || getPlaceholderImage(formData.category),
      additionalImages: additionalImagePreviews.filter(img => img !== ''),
      description: formData.description,
      
      // API ফরম্যাটের জন্য অতিরিক্ত ফিল্ড যোগ করা
      variants: [
        {
          size: "M",
          color: "ডিফল্ট",
          price: parseFloat(formData.price.replace(/,/g, '')),
          stock: parseInt(formData.stock, 10)
        }
      ],
    };
    
    // API এর মাধ্যমে প্রোডাক্ট সেভ করা
    const saveProduct = async () => {
      try {
        // API কল করে প্রোডাক্ট সেভ করা
        const response = await fetch('/api/products/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        
        if (!response.ok) {
          throw new Error('প্রোডাক্ট সেভ করতে সমস্যা হয়েছে');
        }
        
        // সফল হলে ড্যাশবোর্ডে ফিরে যাওয়া
        router.push('/dashboard/products');
      } catch (error) {
        console.error('প্রোডাক্ট সেভ করতে সমস্যা:', error);
        setError('প্রোডাক্ট সেভ করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
        
        // API কল ব্যর্থ হলে লোকাল স্টোরেজে সেভ করা
        try {
          const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
          const legacyProduct = {
            id: productId,
            title: formData.title,
            price: `৳${formData.price}`,
            category: formData.category,
            stock: parseInt(formData.stock, 10),
            image: mainImagePreview || formData.image || getPlaceholderImage(formData.category),
            additionalImages: additionalImagePreviews.filter(img => img !== ''),
            description: formData.description
          };
          
          localStorage.setItem('products', JSON.stringify([...existingProducts, legacyProduct]));
          router.push('/dashboard/products');
        } catch (localStorageError) {
          console.error('লোকাল স্টোরেজে সেভ করতে সমস্যা:', localStorageError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    saveProduct();
  };
  
  const previewImage = (url: string) => (
    <div className="mt-2">
      <div className="relative h-28 w-28 overflow-hidden rounded border border-gray-200">
        <Image
          src={url}
          alt="Product image preview"
          fill
          sizes="112px"
          className="object-cover"
          onError={(e) => {
            (e.target as any).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
          }}
          unoptimized
        />
      </div>
    </div>
  );
  
  // ক্যাটাগরি থাকা ইমেজ প্লেসহোল্ডার ফাংশন
  const getPlaceholderImage = (categoryName: string) => {
    return `https://placehold.co/300x300/7048e8/ffffff?text=${encodeURIComponent(categoryName)}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">নতুন পণ্য যোগ করুন</h1>
              <Link href="/dashboard/products" className="text-pink-600 hover:text-pink-800">
                ← পণ্য তালিকায় ফিরে যান
              </Link>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">পণ্যের নাম *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">মূল্য (৳) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">ডিসকাউন্ট (%)</label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">ওজন (কেজি)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    step="0.1"
                    min="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">ডেলিভারি চার্জ ক্যালকুলেশনের জন্য প্রয়োজন</p>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">ক্যাটাগরি *</label>
                  <div className="space-y-2">
                    {categoryLoading ? (
                      <div className="w-full h-10 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      >
                        <option value="">-- ক্যাটাগরি সিলেক্ট করুন --</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + নতুন ক্যাটাগরি যোগ করুন
                      </button>
                      {formData.category && (
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(formData.category)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          সিলেক্টেড ক্যাটাগরি মুছুন
                        </button>
                      )}
                    </div>
                    
                    {formData.category && !categoryLoading && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200">
                          <Image
                            src={categories.find(cat => cat.name === formData.category)?.image || getPlaceholderImage(formData.category)}
                            alt={formData.category}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as any).src = getPlaceholderImage(formData.category);
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">ক্যাটাগরি: {formData.category}</span>
                      </div>
                    )}
                    
                    {/* নতুন ক্যাটাগরি যোগ করার ফর্ম */}
                    {showAddCategory && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                        <h4 className="font-medium mb-3">নতুন ক্যাটাগরি যোগ করুন</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 mb-1 text-sm">ক্যাটাগরির নাম *</label>
                            <input
                              type="text"
                              placeholder="ক্যাটাগরির নাম"
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={formData.newCategory || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                newCategory: e.target.value
                              })}
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 mb-1 text-sm">ক্যাটাগরি ছবি</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="ছবির URL লিখুন অথবা আপলোড করুন"
                                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newCategoryImage}
                                onChange={(e) => setNewCategoryImage(e.target.value)}
                              />
                              <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer transition">
                                <span>ছবি আপলোড</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  ref={categoryImageInputRef}
                                  onChange={handleCategoryImageUpload}
                                />
                              </label>
                            </div>
                            
                            {(categoryImagePreview || newCategoryImage) && (
                              <div className="mt-2">
                                <div className="relative h-24 w-24 rounded overflow-hidden border border-gray-200">
                                  <Image
                                    src={categoryImagePreview || newCategoryImage}
                                    alt="ক্যাটাগরি ছবি প্রিভিউ"
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      (e.target as any).src = getPlaceholderImage(formData.newCategory || 'ক্যাটাগরি');
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={addNewCategory}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              ক্যাটাগরি যোগ করুন
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setShowAddCategory(false);
                                setFormData({
                                  ...formData,
                                  newCategory: ''
                                });
                                setNewCategoryImage('');
                                setCategoryImagePreview('');
                              }}
                              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            >
                              বাতিল করুন
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* ক্যাটাগরি মুছে ফেলার কনফার্মেশন */}
                    {categoryToDelete && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-700 mb-3">আপনি কি নিশ্চিত যে আপনি "{categoryToDelete}" ক্যাটাগরি মুছতে চান?</p>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => deleteCategory(categoryToDelete)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            হ্যাঁ, মুছুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(null)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                          >
                            না, বাতিল করুন
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">স্টক *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                    min="1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">মূল ছবি (অপশনাল)</label>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          placeholder="ছবির URL লিখুন অথবা আপলোড করুন"
                          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer transition">
                          <span>ছবি আপলোড করুন</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            ref={mainImageInputRef}
                            onChange={handleMainImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                    
                    {(mainImagePreview || formData.image) && (
                      <div className="mt-2">
                        <div className="relative h-32 w-32 rounded overflow-hidden border border-gray-200">
                          <Image
                            src={mainImagePreview || formData.image}
                            alt={`${formData.title || 'নতুন পণ্য'} - মূল ছবি প্রিভিউ`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as any).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                            }}
                          />
                        </div>
                        {mainImagePreview && (
                          <div className="mt-1 text-sm text-green-600">
                            নতুন লোকাল ছবি আপলোড করা হয়েছে
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">অতিরিক্ত ছবি (অপশনাল)</label>
                  <div className="space-y-4">
                    {formData.additionalImages.map((image, index) => (
                      <div key={index} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-4">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => handleAdditionalImageChange(index, e.target.value)}
                            placeholder={`অতিরিক্ত ছবির URL #${index + 1}`}
                            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer transition">
                            <span>আপলোড</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleAdditionalImageUpload(e, index)}
                            />
                          </label>
                          <button 
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                          >
                            x
                          </button>
                        </div>
                        
                        {(additionalImagePreviews[index] || image) && (
                          <div className="flex items-center">
                            <div className="relative h-16 w-16 rounded overflow-hidden border border-gray-200">
                              <Image
                                src={additionalImagePreviews[index] || image}
                                alt={`${formData.title || 'নতুন পণ্য'} - অতিরিক্ত ছবি ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as any).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                                }}
                              />
                            </div>
                            <div className="ml-2 text-sm text-gray-500">
                              {additionalImagePreviews[index] ? 'লোকাল ছবি' : 'URL থেকে'}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                    >
                      + আরও ছবি যোগ করুন
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">বিবরণ</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Link
                  href="/dashboard/products"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  বাতিল করুন
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition disabled:opacity-50"
                >
                  {loading ? 'প্রসেসিং...' : 'পণ্য যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 