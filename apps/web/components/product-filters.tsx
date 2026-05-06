'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  currentCategoryId?: string;
  currentBrandId?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentSearch?: string;
  currentSortBy?: string;
  currentSortOrder?: string;
}

function buildFilterUrl(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const merged = { ...current, ...overrides };
  const p = new URLSearchParams();
  if (merged.search) p.set('search', merged.search);
  if (merged.categoryId) p.set('categoryId', merged.categoryId);
  if (merged.brandId) p.set('brandId', merged.brandId);
  if (merged.minPrice) p.set('minPrice', merged.minPrice);
  if (merged.maxPrice) p.set('maxPrice', merged.maxPrice);
  if (merged.sortBy) p.set('sortBy', merged.sortBy);
  if (merged.sortOrder) p.set('sortOrder', merged.sortOrder);
  const qs = p.toString();
  return `/products${qs ? `?${qs}` : ''}`;
}

export function ProductFilters({
  categories,
  brands,
  currentCategoryId,
  currentBrandId,
  currentMinPrice,
  currentMaxPrice,
  currentSearch,
  currentSortBy,
  currentSortOrder,
}: ProductFiltersProps) {
  const [minPrice, setMinPrice] = useState(currentMinPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice ?? '');
  const [showCategories, setShowCategories] = useState(true);
  const [showBrands, setShowBrands] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = {
    search: currentSearch,
    categoryId: currentCategoryId,
    brandId: currentBrandId,
    minPrice: currentMinPrice,
    maxPrice: currentMaxPrice,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder,
  };

  const hasFilters = currentCategoryId || currentBrandId || currentMinPrice || currentMaxPrice;

  const linkClass = (active: boolean) =>
    `block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
      active
        ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/30'
        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
    }`;

  const filterContent = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </h3>
        {hasFilters && (
          <Link href={buildFilterUrl(current, { categoryId: undefined, brandId: undefined, minPrice: undefined, maxPrice: undefined })} className="text-xs text-red-600 hover:text-red-800">
            Clear all
          </Link>
        )}
      </div>

      {/* Categories */}
      <div>
        <button onClick={() => setShowCategories(!showCategories)} className="flex w-full items-center justify-between py-1 text-sm font-medium text-gray-900 dark:text-white">
          Category
          {showCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showCategories && (
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            <Link href={buildFilterUrl(current, { categoryId: undefined })} className={linkClass(!currentCategoryId)} onClick={() => setMobileOpen(false)}>
              All Categories
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={buildFilterUrl(current, { categoryId: cat.id })} className={linkClass(currentCategoryId === cat.id)} onClick={() => setMobileOpen(false)}>
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div>
        <button onClick={() => setShowBrands(!showBrands)} className="flex w-full items-center justify-between py-1 text-sm font-medium text-gray-900 dark:text-white">
          Brand
          {showBrands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showBrands && (
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            <Link href={buildFilterUrl(current, { brandId: undefined })} className={linkClass(!currentBrandId)} onClick={() => setMobileOpen(false)}>
              All Brands
            </Link>
            {brands.map((brand) => (
              <Link key={brand.id} href={buildFilterUrl(current, { brandId: brand.id })} className={linkClass(currentBrandId === brand.id)} onClick={() => setMobileOpen(false)}>
                {brand.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <button onClick={() => setShowPrice(!showPrice)} className="flex w-full items-center justify-between py-1 text-sm font-medium text-gray-900 dark:text-white">
          Price Range
          {showPrice ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showPrice && (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 dark:text-gray-400">Min (৳)</label>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 dark:text-gray-400">Max (৳)</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" />
              </div>
            </div>
            <Link
              href={buildFilterUrl(current, { minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })}
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-md bg-gray-900 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Apply Price
            </Link>
            {(currentMinPrice || currentMaxPrice) && (
              <Link
                href={buildFilterUrl(current, { minPrice: undefined, maxPrice: undefined })}
                onClick={() => { setMinPrice(''); setMaxPrice(''); setMobileOpen(false); }}
                className="block w-full text-center text-xs text-red-600 hover:text-red-800"
              >
                Clear price filter
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Quick Price Ranges */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Quick Ranges</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Under ৳10K', min: '', max: '10000' },
            { label: '৳10K-30K', min: '10000', max: '30000' },
            { label: '৳30K-60K', min: '30000', max: '60000' },
            { label: '৳60K-100K', min: '60000', max: '100000' },
            { label: '৳100K-200K', min: '100000', max: '200000' },
            { label: '৳200K+', min: '200000', max: '' },
          ].map((range) => {
            const isActive = currentMinPrice === range.min && currentMaxPrice === range.max;
            return (
              <Link
                key={range.label}
                href={buildFilterUrl(current, { minPrice: range.min || undefined, maxPrice: range.max || undefined })}
                onClick={() => { setMinPrice(range.min); setMaxPrice(range.max); setMobileOpen(false); }}
                className={`rounded-md border px-2 py-1.5 text-center text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                }`}
              >
                {range.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">!</span>}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white p-5 shadow-xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold dark:text-white">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      <aside className="hidden rounded-xl border border-gray-200 bg-white p-4 lg:block dark:border-gray-700 dark:bg-gray-900">
        {filterContent}
      </aside>
    </>
  );
}
