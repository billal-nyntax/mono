import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getCategories, getBrands } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';
import { SortSelector } from '@/components/sort-selector';

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;

  let title = 'All Products';
  if (params.search) {
    title = `Search: ${params.search}`;
  }
  if (params.categoryId) {
    const categories = await getCategories().then((r) => r.data ?? []);
    const cat = categories.find((c) => c.id === params.categoryId);
    if (cat) title = cat.name;
  }

  const description = params.search
    ? `Browse results for "${params.search}" at TechHub BD. Smartphones, laptops & gadgets in Bangladesh.`
    : 'Browse our full range of smartphones, laptops, smartwatches & accessories. Best prices in Bangladesh with official warranty.';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | TechHub BD`,
      description,
      type: 'website',
      siteName: 'TechHub BD',
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [productsRes, categoriesRes, brandsRes] = await Promise.allSettled([
    getProducts({
      page,
      limit: 12,
      search: params.search,
      categoryId: params.categoryId,
      brandId: params.brandId,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }),
    getCategories(),
    getBrands(),
  ]);

  const productsData =
    productsRes.status === 'fulfilled' ? productsRes.value.data : null;
  const products = productsData?.data ?? [];
  const total = productsData?.total ?? 0;
  const totalPages = productsData?.totalPages ?? 1;
  const categories =
    categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : [];
  const brands =
    brandsRes.status === 'fulfilled' ? brandsRes.value.data : [];

  const activeFilters = [
    params.categoryId && categories.find((c) => c.id === params.categoryId)?.name,
    params.brandId && brands.find((b) => b.id === params.brandId)?.name,
    params.minPrice && `Min ৳${params.minPrice}`,
    params.maxPrice && `Max ৳${params.maxPrice}`,
  ].filter(Boolean);

  function buildUrl(overrides: Record<string, string | undefined>): string {
    const p = new URLSearchParams();
    const merged = { ...params, ...overrides };
    if (merged.search) p.set('search', merged.search);
    if (merged.categoryId) p.set('categoryId', merged.categoryId);
    if (merged.brandId) p.set('brandId', merged.brandId);
    if (merged.minPrice) p.set('minPrice', merged.minPrice);
    if (merged.maxPrice) p.set('maxPrice', merged.maxPrice);
    if (merged.sortBy) p.set('sortBy', merged.sortBy);
    if (merged.sortOrder) p.set('sortOrder', merged.sortOrder);
    if (merged.page && merged.page !== '1') p.set('page', merged.page);
    const qs = p.toString();
    return `/products${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {params.search ? `Results for "${params.search}"` : 'All Products'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{total} products found</p>
          </div>
          <SortSelector currentSort={params.sortBy} currentOrder={params.sortOrder} currentParams={params} />
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Filters:</span>
            {activeFilters.map((f) => (
              <span key={f} className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {f}
              </span>
            ))}
            <Link href="/products" className="text-xs text-red-600 hover:text-red-800">
              Clear all
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar Filters */}
        <ProductFilters
          categories={categories}
          brands={brands}
          currentCategoryId={params.categoryId}
          currentBrandId={params.brandId}
          currentMinPrice={params.minPrice}
          currentMaxPrice={params.maxPrice}
          currentSearch={params.search}
          currentSortBy={params.sortBy}
          currentSortOrder={params.sortOrder}
        />

        {/* Product Grid */}
        <div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-600 py-20 text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">No products found</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
              <Link href="/products" className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                Clear filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: String(page - 1) })}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Previous
                    </Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: String(p) })}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                          p === page
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: String(page + 1) })}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Next
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
