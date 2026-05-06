import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-7xl font-extrabold text-blue-600 sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-gray-600 dark:text-gray-400">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Search className="h-4 w-4" />
          Browse Products
        </Link>
      </div>
    </div>
  );
}
