'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// প্রোডাক্ট ভেরিয়েন্ট টাইপ
export type ProductVariant = {
  size: string;
  color: string;
  price: number;
  stock: number;
};

// কার্ট আইটেম টাইপ
export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  variant: ProductVariant;
  total: number;
  weight?: number; // পণ্যের ওজন (কেজিতে)
  maxQuantity?: number;
};

// কার্ট কনটেক্সট টাইপ
type CartContextType = {
  items: CartItem[];
  cartItems: CartItem[];
  addToCart: (id: string, variant: ProductVariant, quantity: number, title?: string, image?: string) => void;
  removeFromCart: (id: string, variantSize?: string, variantColor?: string) => void;
  updateCartItemQuantity: (id: string, quantity: number, variantSize?: string, variantColor?: string) => void;
  updateQuantity: (id: string, quantity: number, variantSize?: string, variantColor?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  subtotal: number;
  cartCount: number;
};

// কার্ট কনটেক্সট ক্রিয়েট করা
const CartContext = createContext<CartContextType | undefined>(undefined);

// কনটেক্সট প্রোভাইডার
export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // লোকাল স্টোরেজ থেকে কার্ট আইটেম লোড করা
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('কার্ট লোড করতে সমস্যা হয়েছে:', error);
      setIsInitialized(true);
    }
  }, []);

  // কার্ট আইটেম পরিবর্তন হলে লোকাল স্টোরেজে সেভ করা
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // কাস্টম ইভেন্ট ডিসপ্যাচ করা যাতে প্রোডাক্ট কার্ড কম্পোনেন্ট জানতে পারে
      const cartUpdatedEvent = new Event('cartUpdated');
      document.dispatchEvent(cartUpdatedEvent);
      
      console.log('কার্ট আপডেট হয়েছে, আইটেম সংখ্যা:', cartItems.length);
    }
  }, [cartItems, isInitialized]);
  
  const addToCart = (
    id: string, 
    variant: ProductVariant, 
    quantity: number, 
    title?: string, 
    image?: string
  ) => {
    setCartItems(prevItems => {
      // চেক করা যে এই প্রোডাক্ট ও ভ্যারিয়েন্ট কার্টে আগে থেকে আছে কিনা
      const existingItemIndex = prevItems.findIndex(
        item => item.id === id && item.variant.size === variant.size && item.variant.color === variant.color
      );
      
      // যদি আগে থেকে থাকে, তবে পরিমাণ বাড়ানো
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        const item = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...item,
          quantity: item.quantity + quantity,
          total: (item.quantity + quantity) * variant.price
        };
        return updatedItems;
      }
      
      // যদি না থাকে, তবে নতুন আইটেম যোগ করা
      return [
        ...prevItems,
        {
          id,
          title: title || `Product ${id}`,
          price: variant.price,
          quantity,
          image: image || '/placeholders/placeholder-product.jpg',
          variant,
          total: quantity * variant.price
        }
      ];
    });
    
    // কার্ট আপডেট ইভেন্ট ডিসপ্যাচ করা - অতিরিক্ত নিশ্চিত করার জন্য
    setTimeout(() => {
      const cartUpdatedEvent = new Event('cartUpdated');
      document.dispatchEvent(cartUpdatedEvent);
    }, 100);
  };
  
  const removeFromCart = (id: string, variantSize?: string, variantColor?: string) => {
    setCartItems(prevItems => {
      // যদি ভ্যারিয়েন্ট উল্লেখ করা হয়, তাহলে সেই নির্দিষ্ট ভ্যারিয়েন্ট অনুযায়ী আইটেম রিমুভ করা
      if (variantSize && variantColor) {
        return prevItems.filter(
          item => !(item.id === id && item.variant.size === variantSize && item.variant.color === variantColor)
        );
      }
      // অন্যথায় সব প্রোডাক্ট আইডি দিয়ে রিমুভ করা
      return prevItems.filter(item => item.id !== id);
    });
    
    // কার্ট আপডেট ইভেন্ট ডিসপ্যাচ করা
    const cartUpdatedEvent = new Event('cartUpdated');
    document.dispatchEvent(cartUpdatedEvent);
  };
  
  const updateCartItemQuantity = (id: string, quantity: number, variantSize?: string, variantColor?: string) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        // যদি ভ্যারিয়েন্ট উল্লেখ করা হয়, তাহলে সেই নির্দিষ্ট ভ্যারিয়েন্ট অনুযায়ী আইটেম আপডেট করা
        if (item.id === id && 
            (variantSize ? item.variant.size === variantSize : true) && 
            (variantColor ? item.variant.color === variantColor : true)) {
          return {
            ...item,
            quantity,
            total: quantity * item.price
          };
        }
        return item;
      });
    });
    
    // কার্ট আপডেট ইভেন্ট ডিসপ্যাচ করা
    const cartUpdatedEvent = new Event('cartUpdated');
    document.dispatchEvent(cartUpdatedEvent);
  };
  
  const clearCart = () => {
    setCartItems([]);
    
    // কার্ট আপডেট ইভেন্ট ডিসপ্যাচ করা
    const cartUpdatedEvent = new Event('cartUpdated');
    document.dispatchEvent(cartUpdatedEvent);
  };
  
  // কার্টের মোট মূল্য গণনা
  const cartTotal = cartItems.reduce((total, item) => total + item.total, 0);
  
  // কার্টের মোট আইটেম সংখ্যা গণনা
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  return (
    <CartContext.Provider value={{ 
      items: cartItems, 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateCartItemQuantity, 
      updateQuantity: updateCartItemQuantity,
      clearCart, 
      cartTotal, 
      subtotal: cartTotal,
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

// কার্ট হুক
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 