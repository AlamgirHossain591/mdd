'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CartItemProps {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  variant: {
    size: string;
    color: string;
    price?: number;
    stock?: number;
  };
  maxQuantity: number;
  onUpdateQuantity: (id: string, quantity: number, variantSize?: string, variantColor?: string) => void;
  onRemove: (id: string, variantSize?: string, variantColor?: string) => void;
}

export default function CartItem({
  id,
  title,
  price,
  quantity,
  image,
  variant,
  maxQuantity,
  onUpdateQuantity,
  onRemove
}: CartItemProps) {
  const [itemQuantity, setItemQuantity] = useState(quantity);

  useEffect(() => {
    setItemQuantity(quantity);
  }, [quantity]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setItemQuantity(newQuantity);
      onUpdateQuantity(id, newQuantity, variant.size, variant.color);
    }
  };

  const handleRemove = () => {
    onRemove(id, variant.size, variant.color);
  };

  return (
    <div className="flex items-center border-b border-purple-200 py-5 hover:bg-purple-50 rounded-lg px-4 transition-all duration-300">
      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg shadow-lg">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-lg hover:scale-110 transition-transform duration-500"
          sizes="96px"
        />
      </div>
      
      <div className="ml-5 flex-grow">
        <h3 className="text-lg font-bold text-purple-600">{title}</h3>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-purple-300 rounded-full bg-white overflow-hidden shadow-sm">
            <button 
              className="px-3 py-1 text-purple-700 hover:text-white hover:bg-purple-600 transition-colors"
              onClick={() => handleQuantityChange(itemQuantity - 1)}
              disabled={itemQuantity <= 1}
            >
              -
            </button>
            <span className="px-4 py-1 border-l border-r border-purple-300 bg-purple-50 font-medium text-purple-700">{itemQuantity}</span>
            <button 
              className="px-3 py-1 text-purple-700 hover:text-white hover:bg-purple-600 transition-colors"
              onClick={() => handleQuantityChange(itemQuantity + 1)}
              disabled={itemQuantity >= maxQuantity}
            >
              +
            </button>
          </div>
          
          <div className="text-purple-600 font-bold text-lg">
            ৳{(price * itemQuantity).toFixed(2)}
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleRemove}
        className="ml-4 text-purple-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
} 