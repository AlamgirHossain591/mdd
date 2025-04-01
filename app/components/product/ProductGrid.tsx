'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useInView } from 'react-intersection-observer';

type ProductVariant = {
  size: string;
  color: string;
  price: number;
  stock: number;
};

type Product = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  image: string;
  variants: ProductVariant[];
  category: string;
};

type ProductGridProps = {
  products: Product[];
  onAddToCart: (productId: string, variant: ProductVariant, quantity: number) => void;
  initialVisibleCount?: number;
  pageSize?: number;
};

export default function ProductGrid({ 
  products, 
  onAddToCart,
  initialVisibleCount = 6,
  pageSize = 6
}: ProductGridProps) {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    // প্রথমে initialVisibleCount অনুযায়ী প্রোডাক্ট লোড করি
    setVisibleProducts(products.slice(0, initialVisibleCount));
  }, [products, initialVisibleCount]);

  useEffect(() => {
    // যখন লোড করার অবস্থানে স্ক্রল করা হয়, তখন আরও প্রোডাক্ট লোড করি
    if (inView && visibleProducts.length < products.length && !isLoading) {
      setIsLoading(true);
      
      // আরও কিছু প্রোডাক্ট লোড করার সময় দেখাতে একটি টাইমআউট সেট করা
      setTimeout(() => {
        setVisibleProducts(prev => {
          const nextBatch = products.slice(prev.length, prev.length + pageSize);
          return [...prev, ...nextBatch];
        });
        setIsLoading(false);
      }, 800); // 800ms দেরি - লোডিং এফেক্ট দেখানোর জন্য
    }
  }, [inView, visibleProducts.length, products, pageSize, isLoading]);

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            discountedPrice={product.discountedPrice}
            image={product.image}
            variants={product.variants}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
      
      {/* লোড হওয়ার রেফারেন্স পয়েন্ট */}
      {visibleProducts.length < products.length && (
        <div ref={ref} className="flex justify-center my-8">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-pink-600 animate-pulse"></div>
              <div className="w-4 h-4 rounded-full bg-pink-600 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-4 h-4 rounded-full bg-pink-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          ) : (
            <button 
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setVisibleProducts(prev => {
                    const nextBatch = products.slice(prev.length, prev.length + pageSize);
                    return [...prev, ...nextBatch];
                  });
                  setIsLoading(false);
                }, 500);
              }}
              className="bg-white border border-pink-600 text-pink-600 hover:bg-pink-50 px-5 py-2 rounded-full"
            >
              আরও দেখুন
            </button>
          )}
        </div>
      )}
    </div>
  );
} 