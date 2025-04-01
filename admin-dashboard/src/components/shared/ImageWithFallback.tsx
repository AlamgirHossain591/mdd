'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  fallbackSrc?: string;
  alt: string;
}

export default function ImageWithFallback({
  src,
  fallbackSrc = '/images/placeholder.svg',
  alt,
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
} 