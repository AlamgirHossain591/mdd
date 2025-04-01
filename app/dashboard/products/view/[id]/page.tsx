'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

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

export default function ViewProductPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');
  
  useEffect(() => {
    // Fetch product data
    try {
      console.log("Looking for product with ID:", id);
      const productsJSON = localStorage.getItem('products');
      if (productsJSON) {
        const products: Product[] = JSON.parse(productsJSON);
        console.log("Found products:", products.length);
        
        // Try to match by exact string or numeric ID
        let foundProduct = products.find(p => p.id === id || p.id === `PRD00${id}` || p.id === `PRD0${id}`);
        
        // If not found, try with numeric comparison for IDs that might be numeric
        if (!foundProduct && !isNaN(Number(id))) {
          const numericId = Number(id);
          foundProduct = products.find(p => {
            // Extract numeric part if ID starts with PRD
            const productIdNumber = p.id.startsWith('PRD') 
              ? Number(p.id.replace('PRD', '').replace(/^0+/, ''))
              : NaN;
            return !isNaN(productIdNumber) && productIdNumber === numericId;
          });
        }
        
        if (foundProduct) {
          setProduct(foundProduct);
          setActiveImage(foundProduct.image);
        } else {
          setError('পণ্য খুঁজে পাওয়া যায়নি');
        }
      } else {
        setError('পণ্য তালিকা খুঁজে পাওয়া যায়নি');
      }
    } catch (err) {
      setError('পণ্যের তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  const handleImageClick = (image: string) => {
    setActiveImage(image);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">পণ্য পাওয়া যায়নি</h1>
              <p className="text-gray-600 mb-6">{error || 'আপনি যে পণ্যটি খুঁজছেন তা পাওয়া যায়নি।'}</p>
              <Link 
                href="/dashboard/products" 
                className="inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
              >
                পণ্য তালিকায় ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // All images (main image + additional images)
  const allImages = [product.image, ...(product.additionalImages || [])];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">পণ্য বিবরণ</h1>
              <div className="flex space-x-4">
                <Link href={`/dashboard/products/edit/${product.id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  সম্পাদনা করুন
                </Link>
                <Link href="/dashboard/products" className="text-pink-600 hover:text-pink-800">
                  ← পণ্য তালিকায় ফিরে যান
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                <div className="mb-4 relative h-80 w-full border border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={activeImage}
                    alt={product.title}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      (e.target as any).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                    }}
                  />
                </div>
                
                {allImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {allImages.map((image, index) => (
                      <div 
                        key={index}
                        className={`relative h-16 w-16 flex-shrink-0 cursor-pointer border-2 rounded-md overflow-hidden ${
                          activeImage === image ? 'border-pink-500' : 'border-gray-200'
                        }`}
                        onClick={() => handleImageClick(image)}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} - ছবি ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as any).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{product.title}</h2>
                <p className="text-2xl font-bold text-pink-600 mb-4">{product.price}</p>
                
                <div className="space-y-4">
                  <div className="flex border-t border-b py-2">
                    <span className="font-medium w-1/3">ক্যাটাগরি:</span>
                    <span className="text-gray-600">{product.category}</span>
                  </div>
                  
                  <div className="flex border-b py-2">
                    <span className="font-medium w-1/3">স্টক:</span>
                    <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} পিস উপলব্ধ` : 'স্টক শেষ'}
                    </span>
                  </div>
                  
                  <div className="border-b py-2">
                    <span className="font-medium block mb-2">বিবরণ:</span>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {product.description || 'কোন বিবরণ দেওয়া হয়নি।'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex space-x-4">
                  <Link
                    href="/dashboard/products"
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
                  >
                    পেছনে যান
                  </Link>
                  <Link
                    href={`/dashboard/products/edit/${product.id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    সম্পাদনা করুন
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 