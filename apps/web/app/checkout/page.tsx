'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Tag, X, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth/use-auth';
import { createOrder, validateCoupon, initiatePayment, type CreateOrderPayload, type CouponValidation } from '@/lib/api';
import { authClient } from '@/lib/auth/auth-client';
import { formatPrice } from '@/lib/format-price';

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 120;

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    area: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'SSLCOMMERZ' | 'BKASH'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name,
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, cartTotal + shipping - discount);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponLoading(true);

    try {
      const token = authClient.getToken();
      if (!token) return;

      const res = await validateCoupon(couponInput.trim(), cartTotal, token);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        setCouponInput('');
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon code');
    }
    setCouponLoading(false);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError('');
  }

  if (orderNumber) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Order Placed Successfully!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your order <span className="font-semibold">#{orderNumber}</span> has been confirmed.
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          We&apos;ll send you a confirmation and tracking details soon.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
        <Link href="/products" className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const token = authClient.getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const payload: CreateOrderPayload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          area: formData.area,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const res = await createOrder(payload, token);
      if (!res.success || !res.data) {
        setError((res as { error?: string }).error ?? 'Failed to place order. Please try again.');
        return;
      }

      if (paymentMethod === 'SSLCOMMERZ') {
        const payRes = await initiatePayment(res.data.id, token);
        if (payRes.success && payRes.data) {
          clearCart();
          window.location.href = payRes.data.gatewayUrl;
          return;
        }
        setError((payRes as { error?: string }).error ?? 'Failed to initiate payment. Please try again.');
      } else {
        setOrderNumber(res.data.orderNumber);
        clearCart();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Shipping Address */}
          <fieldset className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <legend className="px-2 text-sm font-semibold text-gray-900 dark:text-white">Shipping Address</legend>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="01XXX-XXXXXX" className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                <textarea id="address" name="address" rows={2} value={formData.address} onChange={handleChange} required placeholder="House, Road, Area details" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                  <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} required placeholder="Dhaka" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area / District</label>
                  <input id="area" name="area" type="text" value={formData.area} onChange={handleChange} required placeholder="Mirpur, Dhaka" className={inputClass} />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Coupon Code */}
          <fieldset className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <legend className="px-2 text-sm font-semibold text-gray-900 dark:text-white">Coupon Code</legend>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {appliedCoupon.discountType === 'PERCENTAGE'
                        ? `${appliedCoupon.discountValue}% off`
                        : `${formatPrice(appliedCoupon.discountValue)} off`}
                      {' — '}You save {formatPrice(appliedCoupon.discountAmount)}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={removeCoupon} className="rounded-md p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    placeholder="Enter coupon code"
                    className={`${inputClass} flex-1 !mt-0 uppercase`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{couponError}</p>
                )}
              </div>
            )}
          </fieldset>

          {/* Payment Method */}
          <fieldset className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <legend className="px-2 text-sm font-semibold text-gray-900 dark:text-white">Payment Method</legend>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 dark:border-gray-700 p-4 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-950/30">
                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pay when your order is delivered</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 dark:border-gray-700 p-4 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-950/30">
                <input type="radio" name="paymentMethod" value="SSLCOMMERZ" checked={paymentMethod === 'SSLCOMMERZ'} onChange={() => setPaymentMethod('SSLCOMMERZ')} className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Online Payment (SSLCommerz)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, bKash, Nagad, Rocket & more</p>
                </div>
              </label>
              <label className="flex cursor-not-allowed items-center gap-3 rounded-md border border-gray-200 dark:border-gray-700 p-4 opacity-50">
                <input type="radio" name="paymentMethod" value="BKASH" disabled className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">bKash Direct</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon</p>
                </div>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h2>

          <ul className="mt-4 max-h-60 space-y-3 overflow-y-auto">
            {cartItems.map((item) => (
              <li key={item.product.id} className="flex items-center gap-3 text-sm">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                  <Image src={item.product.images?.[0] || '/placeholder-product.svg'} alt={item.product.name} fill sizes="40px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(item.product.sellingPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{formatPrice(cartTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Shipping</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
              </dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <dt className="flex items-center gap-1 text-green-600">
                  <Tag className="h-3.5 w-3.5" />
                  Coupon ({appliedCoupon?.code})
                </dt>
                <dd className="font-medium text-green-600">-{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              <dt className="text-base font-semibold text-gray-900 dark:text-white">Total</dt>
              <dd className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Placing Order...' : `Place Order — ${formatPrice(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
