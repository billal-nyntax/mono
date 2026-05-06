'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format-price';

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 120;

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 sm:h-24 sm:w-24">
                <Image
                  src={item.product.images?.[0] || '/placeholder-product.svg'}
                  alt={item.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {item.product.brand}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-md border border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[2rem] px-1 text-center text-sm dark:text-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stockQuantity}
                      className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:text-gray-300 dark:disabled:text-gray-600"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(item.product.sellingPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatPrice(cartTotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Shipping</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </dd>
            </div>
            {cartTotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add {formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)} more for
                free shipping
              </p>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between">
                <dt className="text-base font-semibold text-gray-900 dark:text-white">Total</dt>
                <dd className="text-base font-bold text-gray-900 dark:text-white">
                  {formatPrice(total)}
                </dd>
              </div>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/products"
            className="mt-3 block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
