'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Image from 'next/image';

type Product = {
  id: string;
  title: string;
  price: string;
  category: string;
  stock: number;
  image: string;
  additionalImages?: string[];
  description?: string;
};

// ক্যাটাগরি টাইপ
type CategoryType = {
  id: string;
  name: string;
  image: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    stock: '1',
    image: '',
    additionalImages: [] as string[],
    weight: '0.5', // কেজিতে ওজন, ডিফল্ট ০.৫ কেজি
    discountPercent: '0', // ডিসকাউন্ট শতকরা হারে
    discountedPrice: '', // ডিসকাউন্ট মূল্য (স্বয়ংক্রিয় গণনা করা হবে)
    newCategory: '' // নতুন ক্যাটাগরি যোগের জন্য
  });
  
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  
  // Refs for file inputs
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
        }
        
        const data = await response.json();
        setCategories(data);
        setIsLoadingCategories(false);
      } catch (err) {
        console.error('ক্যাটাগরি লোড করতে ত্রুটি:', err);
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        
        // প্রথমে API থেকে প্রোডাক্ট লোড করার চেষ্টা করা
        try {
          const response = await fetch(`/api/products/${id}`);
          
          if (response.ok) {
            const productData = await response.json();
            console.log('API থেকে প্রোডাক্ট ডাটা লোড করা হয়েছে:', productData);
            
            // ফর্ম ডাটা সেট করা
            setFormData({
              title: productData.title || '',
              price: productData.price ? productData.price.toString() : '',
              discountedPrice: productData.discountedPrice ? productData.discountedPrice.toString() : '',
              category: productData.category || '',
              stock: productData.stock ? productData.stock.toString() : '1',
              image: productData.image || '',
              description: productData.description || '',
              additionalImages: productData.additionalImages || [],
              newCategory: '',
              weight: productData.weight ? productData.weight.toString() : '0.5',
              discountPercent: productData.discountPercent ? productData.discountPercent.toString() : '0'
            });
            
            // প্রিভিউ ইমেজ সেট করা
            if (productData.image) {
              setMainImagePreview(productData.image);
            }
            
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('API থেকে প্রোডাক্ট লোড করতে সমস্যা:', apiError);
          // এপিআই এরর হলে লোকাল স্টোরেজ থেকে লোড করা চেষ্টা করা হবে
        }
        
        // API থেকে লোড ব্যর্থ হলে লোকাল স্টোরেজ থেকে লোড করা
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          try {
            const products = JSON.parse(storedProducts);
            const product = products.find((p: any) => p.id === id);
            
            if (product) {
              console.log('লোকাল স্টোরেজ থেকে প্রোডাক্ট ডাটা লোড করা হয়েছে:', product);
              
              // ফর্ম ডাটা সেট করা
              setFormData({
                title: product.title || '',
                price: product.price ? product.price.replace('৳', '') : '',
                discountedPrice: product.discountedPrice ? product.discountedPrice.replace('৳', '') : '',
                category: product.category || '',
                stock: product.stock ? product.stock.toString() : '1',
                image: product.image || '',
                description: product.description || '',
                additionalImages: product.additionalImages || [],
                newCategory: '',
                weight: product.weight ? product.weight.toString() : '0.5',
                discountPercent: product.discountPercent ? product.discountPercent.toString() : '0'
              });
              
              // প্রিভিউ ইমেজ সেট করা
              if (product.image) {
                setMainImagePreview(product.image);
              }
            } else {
              setError(`আইডি ${id} দিয়ে কোন প্রোডাক্ট খুঁজে পাওয়া যায়নি`);
              router.push('/dashboard/products');
            }
          } catch (error) {
            console.error('লোকাল স্টোরেজ থেকে প্রোডাক্ট লোড করতে সমস্যা:', error);
            setError('প্রোডাক্ট ডাটা লোড করতে সমস্যা হয়েছে');
          }
        } else {
          setError('কোন প্রোডাক্ট ডাটা পাওয়া যায়নি');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('প্রোডাক্ট লোড করতে সমস্যা:', error);
        setError('প্রোডাক্ট ডাটা লোড করতে সমস্যা হয়েছে');
        setLoading(false);
      }
    };

    if (id) {
      loadProductData();
    }
  }, [id, router]);
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.category) {
      setError('অনুগ্রহ করে প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // API ফরম্যাটে প্রোডাক্ট ডাটা তৈরি করা
    const productData = {
      id: id,
      title: formData.title,
      price: parseFloat(formData.price.replace(/,/g, '')),
      discountPercent: parseFloat(formData.discountPercent) || 0,
      discountedPrice: parseFloat(formData.price.replace(/,/g, '')) * (1 - (parseFloat(formData.discountPercent) || 0) / 100),
      category: formData.category,
      stock: parseInt(formData.stock, 10),
      weight: parseFloat(formData.weight) || 0.5,
      image: mainImagePreview || formData.image,
      additionalImages: additionalImagePreviews.filter(img => img !== ''),
      description: formData.description
    };
    
    // API এর মাধ্যমে প্রোডাক্ট আপডেট করা
    const updateProduct = async () => {
      try {
        // API কল করে প্রোডাক্ট আপডেট করা
        const response = await fetch('/api/products/edit', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        
        if (!response.ok) {
          throw new Error('প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে');
        }
        
        // সফল হলে ড্যাশবোর্ডে ফিরে যাওয়া
        router.push('/dashboard/products');
      } catch (error) {
        console.error('প্রোডাক্ট আপডেট করতে সমস্যা:', error);
        setError('প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    };
    
    updateProduct();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">পণ্য পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-6">আপনি যে পণ্যটি খুঁজছেন তা পাওয়া যায়নি। এটি অপসারণ করা হয়েছে বা আইডি ভুল হতে পারে।</p>
          <Link 
            href="/dashboard/products" 
            className="inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
          >
            পণ্য তালিকায় ফিরে যান
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">প্রোডাক্ট সম্পাদনা করুন</h1>
            <Link href="/dashboard/products" className="text-pink-600 hover:text-pink-800">
              &larr; প্রোডাক্ট তালিকায় ফিরে যান
            </Link>
          </div>
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  প্রোডাক্টের নাম
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  মূল্য (৳)
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  pattern="[0-9]+"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  ডিসকাউন্ট (%)</label>
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
                <label className="block text-gray-700 font-medium mb-2">
                  ওজন (কেজি)</label>
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
                <label className="block text-gray-700 font-medium mb-2">
                  ক্যাটাগরি
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">ক্যাটাগরি বাছাই করুন</option>
                  {isLoadingCategories ? (
                    <option value="" disabled>লোড হচ্ছে...</option>
                  ) : (
                    categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  স্টক পরিমাণ
                </label>
                <input
                  type="text"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  মূল ছবি (অপশনাল)
                </label>
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
                          alt={`${formData.title} - মূল ছবি প্রিভিউ`}
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
                <label className="block text-gray-700 font-medium mb-2">
                  অতিরিক্ত ছবি (অপশনাল)
                </label>
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
                              alt={`${formData.title} - অতিরিক্ত ছবি ${index + 1}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as any).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="ml-2 text-sm text-gray-500">
                            {additionalImagePreviews[index] ? (
                              <span className="text-green-600">নতুন লোকাল ছবি</span>
                            ) : 'URL থেকে'}
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
                <label className="block text-gray-700 font-medium mb-2">
                  বিবরণ
                </label>
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
                {loading ? 'প্রসেসিং...' : 'পণ্য আপডেট করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 