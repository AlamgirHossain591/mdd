import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';

async function getProduct(id: string) {
  try {
    // অ্যাবসোলিউট URL ব্যবহার করার পরিবর্তে
    const response = await fetch(`/api/products/${id}`, { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('প্রোডাক্ট লোড করতে সমস্যা:', error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <Link href="/products" className="text-pink-600 hover:underline flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              সব প্রোডাক্ট
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl text-red-600 mb-4">প্রোডাক্ট খুঁজে পাওয়া যায়নি</h2>
            <p className="text-gray-600 mb-6">প্রোডাক্টটি খুঁজে পাওয়া যায়নি বা সরিয়ে ফেলা হয়েছে।</p>
            <Link href="/products" className="px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
              অন্য প্রোডাক্ট দেখুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    }>
      <ProductClient product={product} />
    </Suspense>
  );
} 