'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const res = await authClient.forgotPassword(email);
    if (res.success) {
      setSent(true);
    } else {
      setError(res.error ?? 'Something went wrong');
    }
    setIsLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-4 rounded-xl bg-white dark:bg-gray-900 p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check your email</h1>
          <p className="text-gray-600 dark:text-gray-400">
            If an account with that email exists, we&apos;ve sent a password reset link.
          </p>
          <Link href="/login" className="inline-block text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-900 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password?</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <div className="text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
