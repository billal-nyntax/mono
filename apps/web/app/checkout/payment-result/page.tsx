'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const orderNumber = searchParams.get('order');

  if (status === 'success') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Payment Successful!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your payment for order <span className="font-semibold">#{orderNumber}</span> has been confirmed.
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          We&apos;ll start processing your order shortly.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/account/orders"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            View Orders
          </Link>
          <Link
            href="/products"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'fail') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <XCircle className="h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Payment Failed
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your payment for order <span className="font-semibold">#{orderNumber}</span> could not be processed.
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Please try again or choose a different payment method.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/account/orders"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            View Orders
          </Link>
          <Link
            href="/products"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <AlertTriangle className="h-16 w-16 text-yellow-500" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        Payment Cancelled
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        You cancelled the payment. Your order is still pending.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/account/orders"
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          View Orders
        </Link>
        <Link
          href="/products"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
