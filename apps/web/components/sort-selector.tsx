'use client';

import { useRouter } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Price: Low to High', sortBy: 'sellingPrice', sortOrder: 'asc' },
  { label: 'Price: High to Low', sortBy: 'sellingPrice', sortOrder: 'desc' },
  { label: 'Name: A-Z', sortBy: 'name', sortOrder: 'asc' },
  { label: 'Name: Z-A', sortBy: 'name', sortOrder: 'desc' },
] as const;

interface SortSelectorProps {
  currentSort?: string;
  currentOrder?: string;
  currentParams?: Record<string, string | undefined>;
}

export function SortSelector({ currentSort, currentOrder, currentParams }: SortSelectorProps) {
  const router = useRouter();
  const currentValue = `${currentSort ?? 'createdAt'}_${currentOrder ?? 'desc'}`;

  function handleChange(value: string) {
    const [sortBy, sortOrder] = value.split('_');
    const p = new URLSearchParams();

    if (currentParams?.search) p.set('search', currentParams.search);
    if (currentParams?.categoryId) p.set('categoryId', currentParams.categoryId);
    if (currentParams?.brandId) p.set('brandId', currentParams.brandId);
    if (currentParams?.minPrice) p.set('minPrice', currentParams.minPrice);
    if (currentParams?.maxPrice) p.set('maxPrice', currentParams.maxPrice);
    if (sortBy) p.set('sortBy', sortBy);
    if (sortOrder) p.set('sortOrder', sortOrder);

    router.push(`/products?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-gray-400" />
      <select
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={`${opt.sortBy}_${opt.sortOrder}`} value={`${opt.sortBy}_${opt.sortOrder}`}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
