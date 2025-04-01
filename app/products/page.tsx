'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '../components/product/ProductGrid';
import { useCart } from '../context/CartContext';

type ProductType = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  image: string;
  category: string;
  stock: number;
  variants: Array<{
    size: string;
    color: string;
    price: number;
    stock: number;
  }>;
  description?: string;
  ratings?: number;
  reviewCount?: number;
};

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  
  // প্রোডাক্ট লোড করা
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // API থেকে প্রোডাক্ট লোড করা - showAllStock প্যারামিটার যুক্ত করা হয়েছে
        const response = await fetch(`/api/products?showAllStock=${showOutOfStock}`);
        if (!response.ok) {
          throw new Error('প্রোডাক্ট ডাটা লোড করতে সমস্যা হয়েছে');
        }
        
        const productData = await response.json();
        
        setProducts(productData);
        setFilteredProducts(productData);
        
        // ক্যাটাগরি লিস্ট তৈরি করা
        const uniqueCategories = [...new Set(productData
          .filter((product: ProductType) => product.category)
          .map((product: ProductType) => product.category))] as string[];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('প্রোডাক্ট লোড করতে সমস্যা:', error);
        // ইমার্জেন্সি ক্ষেত্রে লোকাল স্টোরেজ থেকে চেক করা
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          try {
            const parsedProducts = JSON.parse(storedProducts);
            
            // ডাটা ফরম্যাট পরিবর্তন করা
            const formattedProducts = parsedProducts.map((item: any) => {
              // প্রাইস স্ট্রিং থেকে নাম্বারে কনভার্ট করা
              const priceString = typeof item.price === 'string' 
                ? item.price.replace('৳', '').replace(',', '') 
                : String(item.price);
              const price = parseFloat(priceString);
              
              return {
                id: item.id,
                title: item.title,
                price: price,
                discountedPrice: price * 0.9, // ডিসকাউন্ট (উদাহরণ হিসেবে)
                image: item.image || "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image",
                category: item.category || 'অন্যান্য',
                stock: item.stock || 10,
                variants: [
                  { size: 'M', color: '#000000', price: price, stock: Math.floor((item.stock || 10) / 3) },
                  { size: 'L', color: '#000000', price: price, stock: Math.floor((item.stock || 10) / 3) },
                  { size: 'XL', color: '#000000', price: price, stock: Math.floor((item.stock || 10) / 3) },
                ],
                description: item.description || `${item.title} - একটি উন্নত মানের পণ্য`,
                ratings: 4.5,
                reviewCount: 45
              };
            });
            
            // স্টক ০ এর বেশি থাকা প্রোডাক্টগুলোই কেবল দেখাবে
            const inStockProducts = formattedProducts.filter((product: ProductType) => 
              product.stock > 0 || (product.variants && product.variants.some(v => v.stock > 0))
            );
            
            setProducts(inStockProducts);
            setFilteredProducts(inStockProducts);
            
            // ক্যাটাগরি লিস্ট তৈরি করা
            const uniqueCategories = [...new Set(inStockProducts
              .filter((product: ProductType) => product.category)
              .map((product: ProductType) => product.category))] as string[];
            setCategories(uniqueCategories);
          } catch (error) {
            console.error('Error parsing products:', error);
            setProducts([]);
            setFilteredProducts([]);
          }
        }
      }
    };
    
    fetchProducts();
  }, [showOutOfStock]);
  
  // ফিল্টার অ্যাপ্লাই করা
  useEffect(() => {
    let result = [...products];
    
    // সার্চ টার্ম দিয়ে ফিল্টার
    if (searchTerm) {
      result = result.filter(product => 
        product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // ক্যাটাগরি দিয়ে ফিল্টার
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // প্রাইস রেঞ্জ দিয়ে ফিল্টার
    result = result.filter(product => {
      const price = product.discountedPrice || product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, priceRange, products]);
  
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(event.target.value);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };
  
  const onAddToCart = (productId: string, variant: any, quantity: number) => {
    const product = filteredProducts.find(p => p.id === productId);
    if (!product) return;
    
    addToCart(
      productId,
      variant,
      quantity,
      product.title,
      product.image
    );
  };
  
  const toggleStockVisibility = () => {
    setShowOutOfStock(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">আমাদের প্রোডাক্ট</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ফিল্টার সাইডবার */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">ফিল্টার</h2>
              
              {/* সার্চ */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-gray-700 mb-2">সার্চ করুন</label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="প্রোডাক্ট সার্চ করুন..."
                />
              </div>
              
              {/* ক্যাটাগরি */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">ক্যাটাগরি</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="all-categories"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => setSelectedCategory(null)}
                      className="mr-2"
                    />
                    <label htmlFor="all-categories">সব ক্যাটাগরি</label>
                  </div>
                  
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`category-${index}`}
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${index}`}>{category}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* মূল্য পরিসীমা */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">মূল্য পরিসীমা</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="min-price" className="block text-sm text-gray-600 mb-1">
                      সর্বনিম্ন মূল্য: ৳{priceRange[0]}
                    </label>
                    <input
                      type="range"
                      id="min-price"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="max-price" className="block text-sm text-gray-600 mb-1">
                      সর্বোচ্চ মূল্য: ৳{priceRange[1]}
                    </label>
                    <input
                      type="range"
                      id="max-price"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* রিসেট বাটন */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                  setPriceRange([0, 5000]);
                }}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors mb-4"
              >
                ফিল্টার রিসেট করুন
              </button>
              
              {/* স্টক শেষ পন্য দেখানোর অপশন */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">স্টক শেষ পণ্য দেখান</span>
                <button 
                  onClick={toggleStockVisibility}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    showOutOfStock ? 'bg-pink-600' : 'bg-gray-300'
                  } transition-colors duration-300 focus:outline-none`}
                >
                  <span 
                    className={`inline-block w-4 h-4 transform transition-transform duration-300 bg-white rounded-full ${
                      showOutOfStock ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* প্রোডাক্ট গ্রিড */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <ProductGrid 
                products={filteredProducts} 
                onAddToCart={onAddToCart}
                initialVisibleCount={12}
                pageSize={8}
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি!</h3>
                <p className="text-gray-600">আপনার সার্চ ক্রাইটেরিয়া পরিবর্তন করে আবার চেষ্টা করুন।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 