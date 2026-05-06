'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { useCart, type CartProduct } from '@/lib/cart-context';

interface AddToCartButtonProps {
  product: CartProduct;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const maxQty = Math.min(product.stockQuantity, 10);

  function handleAdd() {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:disabled:text-gray-600"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] px-2 text-center text-sm font-medium dark:text-white">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
          disabled={quantity >= maxQty}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:disabled:text-gray-600"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stockQuantity === 0}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors sm:flex-initial ${
          added
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        } disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
