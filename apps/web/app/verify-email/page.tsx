'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/v1/auth/verify-email?token=${token}`);
        const data = await res.json() as { success: boolean; data?: { message: string }; error?: string };

        if (res.ok && data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error ?? 'Invalid or expired verification link');
        }
      } catch {
        setStatus('error');
        setMessage('Could not verify email. Please try again.');
      }
    }

    void verify();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Email Verified!</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You can now place orders and access all features.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/products" className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Start Shopping
          </Link>
          <Link href="/account" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            My Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <XCircle className="h-16 w-16 text-red-500" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Verification Failed</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The link may have expired. Try requesting a new one.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/login" className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Sign In
        </Link>
        <Link href="/" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Verifying...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
