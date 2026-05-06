'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart, type CartProduct } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format-price';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: { name: string } | string;
    sellingPrice: number;
    compareAtPrice?: number | null;
    images: string[];
    stockQuantity: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const imageUrl = product.images?.[0] || '/placeholder-product.svg';
  const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name ?? '';
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.sellingPrice) / product.compareAtPrice!) * 100)
    : 0;

  function handleAddToCart() {
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: brandName,
      sellingPrice: product.sellingPrice,
      images: product.images,
      stockQuantity: product.stockQuantity,
    };
    addToCart(cartProduct);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
            -{discountPercent}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {brandName}
        </p>
        <Link href={`/products/${product.slug}`} className="mt-1 line-clamp-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.sellingPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
