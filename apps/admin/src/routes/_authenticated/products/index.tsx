import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpDown } from 'lucide-react';
import { useProducts, useDeleteProduct } from '@/features/products/api/product.api';
import { useCategories, useBrands } from '@/features/categories/api/category.api';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { FilterBar, FilterSelect, FilterCheckbox } from '@/shared/components/filter-bar';
import { toast } from 'sonner';

const PAGE_SIZES = [10, 20, 50] as const;

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ProductsPage() {
  const perms = usePermissions();
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useDebounce(searchInput, 400);
  const pagination = usePagination({ initialLimit: 20 });

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const { data, isLoading, isFetching, isPlaceholderData } = useProducts({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch || undefined,
    categoryId: categoryFilter || undefined,
    brandId: brandFilter || undefined,
    status: (statusFilter as 'AVAILABLE' | 'OUT_OF_STOCK') || undefined,
    lowStock: stockFilter || undefined,
    sortBy,
    sortOrder,
  });

  const deleteProduct = useDeleteProduct();
  const totalPages = data?.totalPages ?? 0;

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    pagination.setPage(1);
  }

  function resetFilters() {
    setSearchInput('');
    setCategoryFilter('');
    setBrandFilter('');
    setStatusFilter('');
    setStockFilter(false);
    setSortBy('createdAt');
    setSortOrder('desc');
    pagination.setPage(1);
  }

  const hasActiveFilters = searchInput || categoryFilter || brandFilter || statusFilter || stockFilter;

  return (
    <div className="flex h-full w-full flex-col gap-3 sm:gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your mobile &amp; laptop inventory
          </p>
        </div>
        {perms.createProduct && (
          <Link
            to="/products/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchInput}
        searchPlaceholder="Search by name, SKU, or brand..."
        onSearchChange={(value) => { setSearchInput(value); pagination.setPage(1); }}
        isFetching={isFetching && !isLoading}
        hasActiveFilters={!!hasActiveFilters}
        onClearFilters={resetFilters}
      >
        <FilterSelect
          value={categoryFilter}
          onChange={(value) => { setCategoryFilter(value); pagination.setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={brandFilter}
          onChange={(value) => { setBrandFilter(value); pagination.setPage(1); }}
        >
          <option value="">All Brands</option>
          {brands?.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={statusFilter}
          onChange={(value) => { setStatusFilter(value); pagination.setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </FilterSelect>

        <FilterCheckbox
          label="Low Stock"
          checked={stockFilter}
          onChange={(checked) => { setStockFilter(checked); pagination.setPage(1); }}
        />

        <FilterSelect
          value={String(pagination.limit)}
          onChange={(value) => pagination.setLimit(Number(value))}
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {/* Table */}
      <div className={`table-container ${isPlaceholderData ? 'opacity-70 transition-opacity' : 'transition-opacity'}`}>
        <div className="table-scroll">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Brand
              </th>
              {perms.viewPurchasePrice && (
                <th
                  onClick={() => handleSort('purchasePrice')}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="inline-flex items-center gap-1">Purchase <ArrowUpDown className="h-3 w-3" /></span>
                </th>
              )}
              <th
                onClick={() => handleSort('sellingPrice')}
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="inline-flex items-center gap-1">Selling <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th
                onClick={() => handleSort('stockQuantity')}
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="inline-flex items-center gap-1">Stock <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              {(perms.editProduct || perms.deleteProduct) && (
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-6 py-4">
                    <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  {debouncedSearch ? `No products matching "${debouncedSearch}"` : 'No products found. Create your first product.'}
                </td>
              </tr>
            ) : (
              data?.data.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-400 dark:bg-gray-700">
                          <span className="text-xs">IMG</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                        {product.sku && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      product.category === 'MOBILE'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {product.brand}
                  </td>
                  {perms.viewPurchasePrice && (
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatBDT(product.purchasePrice)}
                    </td>
                  )}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatBDT(product.sellingPrice)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`font-medium ${
                      product.stockQuantity === 0
                        ? 'text-red-600 dark:text-red-400'
                        : product.stockQuantity < 10
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-900 dark:text-white'
                    }`}>
                      {product.stockQuantity}
                    </span>
                    {product.stockQuantity === 0 && (
                      <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Out
                      </span>
                    )}
                    {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                      <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Low
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      product.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {product.status === 'AVAILABLE' ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  {(perms.editProduct || perms.deleteProduct) && (
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        to={`/products/${product.id}`}
                        className="mr-3 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          if (!confirm(`Delete "${product.name}"?`)) return;
                          deleteProduct.mutate(product.id, {
                            onSuccess: () => toast.success('Product deleted'),
                            onError: (err) => toast.error(err.message),
                          });
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {data && totalPages > 0 && (
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>–<span className="font-medium">{Math.min(pagination.page * pagination.limit, data.total)}</span> of <span className="font-medium">{data.total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button disabled={!pagination.canPrev} onClick={pagination.goToFirst} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&laquo;</button>
            <button disabled={!pagination.canPrev} onClick={pagination.prevPage} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&lsaquo;</button>
            {pagination.pageRange(totalPages).map((p, idx) =>
              p === -1 ? (
                <span key={`e-${String(idx)}`} className="hidden px-1 text-gray-400 sm:inline">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => pagination.setPage(p)}
                  className={`hidden min-w-[32px] rounded-md border px-2 py-1 text-sm sm:block ${
                    p === pagination.page
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button disabled={!pagination.canNext(totalPages)} onClick={pagination.nextPage} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&rsaquo;</button>
            <button disabled={!pagination.canNext(totalPages)} onClick={() => pagination.goToLast(totalPages)} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&raquo;</button>
          </div>
        </div>
      )}
    </div>
  );
}
