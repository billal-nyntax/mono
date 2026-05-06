'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth/auth-client';

const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    const res = await authClient.resetPassword({ token, password, confirmPassword });
    if (res.success) {
      router.push('/login');
    } else {
      setError(res.error ?? 'Reset failed');
    }
    setIsLoading(false);
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-900 p-8 shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700">{error}</div>}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={inputClass} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} />
        </div>
        <button type="submit" disabled={isLoading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
      <div className="text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">Back to login</Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
