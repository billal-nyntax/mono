import { useState } from 'react';

import { Plus, Minus, History, Warehouse } from 'lucide-react';
import { useStockOverview, useStockHistory, useAddStock, useRemoveStock } from '@/features/stock/api/stock.api';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { FilterBar, FilterSelect } from '@/shared/components/filter-bar';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';
import type { Product, StockMovement } from '@/shared/api/types';

const PAGE_SIZES = [10, 20, 50] as const;
const LOW_STOCK_THRESHOLD = 10;

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function stockColor(qty: number): string {
  if (qty === 0) return 'text-red-600 dark:text-red-400';
  if (qty < LOW_STOCK_THRESHOLD) return 'text-orange-600 dark:text-orange-400';
  return 'text-green-600 dark:text-green-400';
}

function stockBadge(qty: number) {
  if (qty === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (qty < LOW_STOCK_THRESHOLD) return { label: 'Low Stock', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
  return { label: 'Healthy', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
}

export function StockPage() {
  const perms = usePermissions();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const pagination = usePagination({ initialLimit: 20 });

  const { data, isLoading, isFetching, isPlaceholderData } = useStockOverview(
    pagination.page,
    pagination.limit,
    debouncedSearch || undefined,
  );

  const totalPages = data?.totalPages ?? 0;

  const [stockDialog, setStockDialog] = useState<{ type: 'add' | 'remove'; product: Product } | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const [historyDialog, setHistoryDialog] = useState<Product | null>(null);
  const historyPagination = usePagination({ initialLimit: 10 });
  const { data: historyData, isLoading: historyLoading } = useStockHistory(
    historyDialog?.id ?? '',
    historyPagination.page,
    historyPagination.limit,
  );

  const addStock = useAddStock();
  const removeStock = useRemoveStock();

  function openStockDialog(type: 'add' | 'remove', product: Product) {
    setQuantity('');
    setReason('');
    setStockDialog({ type, product });
  }

  function handleStockSubmit() {
    if (!stockDialog) return;
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }

    const mutation = stockDialog.type === 'add' ? addStock : removeStock;
    mutation.mutate(
      { productId: stockDialog.product.id, quantity: qty, reason: reason || undefined },
      {
        onSuccess: () => {
          toast.success(`Stock ${stockDialog.type === 'add' ? 'added' : 'removed'} successfully`);
          setStockDialog(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

  return (
    <div className="flex h-full w-full flex-col gap-3 sm:gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage product stock levels
          </p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchInput}
        searchPlaceholder="Search products..."
        onSearchChange={(value) => { setSearchInput(value); pagination.setPage(1); }}
        isFetching={isFetching && !isLoading}
        hasActiveFilters={!!searchInput}
        onClearFilters={() => { setSearchInput(''); pagination.setPage(1); }}
      >
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Price</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{perms.modifyStock ? 'Actions' : ''}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              data?.data.map((product) => {
                const badge = stockBadge(product.stockQuantity);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
                            <Warehouse className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                          {product.sku && <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>}
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.brand}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{formatBDT(product.sellingPrice)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className={`text-lg font-bold ${stockColor(product.stockQuantity)}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      {perms.modifyStock ? (
                        <div className="inline-flex items-center gap-1">
                          <Button size="sm" variant="success" onClick={() => openStockDialog('add', product)}>
                            <Plus className="mr-1 h-3 w-3" /> Add
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => openStockDialog('remove', product)} disabled={product.stockQuantity === 0}>
                            <Minus className="mr-1 h-3 w-3" /> Remove
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setHistoryDialog(product); historyPagination.setPage(1); }}>
                            <History className="mr-1 h-3 w-3" /> History
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">View only</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {data && totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
            –
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, data.total)}</span>
            {' '}of <span className="font-medium">{data.total}</span> products
          </p>
          <div className="flex items-center gap-1">
            <button disabled={!pagination.canPrev} onClick={pagination.goToFirst} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&laquo;</button>
            <button disabled={!pagination.canPrev} onClick={pagination.prevPage} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&lsaquo;</button>
            {pagination.pageRange(totalPages).map((p, idx) =>
              p === -1 ? (
                <span key={`e-${String(idx)}`} className="px-1 text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => pagination.setPage(p)}
                  className={`min-w-[32px] rounded-md border px-2 py-1 text-sm ${
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

      {/* Add/Remove Stock Dialog */}
      <Dialog open={!!stockDialog} onOpenChange={(open) => { if (!open) setStockDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockDialog?.type === 'add' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
            <DialogDescription>
              {stockDialog?.product.name} — Current stock: {stockDialog?.product.stockQuantity}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="qty">Quantity</Label>
              <input id="qty" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} placeholder="Enter quantity" />
            </div>
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="e.g. New shipment arrived" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialog(null)}>Cancel</Button>
            <Button
              variant={stockDialog?.type === 'add' ? 'success' : 'destructive'}
              onClick={handleStockSubmit}
              disabled={addStock.isPending || removeStock.isPending}
            >
              {addStock.isPending || removeStock.isPending ? 'Processing...' : stockDialog?.type === 'add' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!historyDialog} onOpenChange={(open) => { if (!open) setHistoryDialog(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock History — {historyDialog?.name}</DialogTitle>
            <DialogDescription>Movement history for this product</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Reason</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {historyLoading ? (
                  <tr><td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">Loading...</td></tr>
                ) : !historyData?.data.length ? (
                  <tr><td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">No history found</td></tr>
                ) : (
                  historyData.data.map((m: StockMovement) => (
                    <tr key={m.id}>
                      <td className="whitespace-nowrap px-4 py-2 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          m.type === 'IN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          m.type === 'OUT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>{m.type}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{m.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{m.reason ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
