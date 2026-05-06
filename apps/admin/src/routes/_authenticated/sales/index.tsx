import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Receipt, Eye, Calendar, ShoppingCart, TrendingUp, Printer } from 'lucide-react';
import { getPaymentLabel } from '@/shared/config/payment-methods';
import { useSales, useSale } from '@/features/sales/api/sales.api';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { FilterBar, FilterSelect } from '@/shared/components/filter-bar';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

const PAGE_SIZES = [10, 20, 50] as const;

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD')}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SalesPage() {
  const navigate = useNavigate();
  const perms = usePermissions();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const pagination = usePagination({ initialLimit: 20 });
  const { data, isLoading, isFetching, isPlaceholderData } = useSales(
    pagination.page,
    pagination.limit,
    debouncedSearch || undefined,
  );
  const totalPages = data?.totalPages ?? 0;

  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const { data: selectedSale } = useSale(selectedSaleId ?? '');

  const todaySales = data?.data.filter(
    (s) => new Date(s.saleDate).toDateString() === new Date().toDateString(),
  ) ?? [];
  const todayTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const todayCount = todaySales.length;

  return (
    <div className="flex h-full w-full flex-col gap-3 sm:gap-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track all sales transactions
          </p>
        </div>
        {perms.createSale && (
          <Link
            to="/sales/create"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30 active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" />
            New Sale
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/50">
              <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Sales</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{data?.total ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950/50">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{todayCount} sales</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/50">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Today&apos;s Revenue</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatBDT(todayTotal)}</p>
            </div>
          </div>
        </div>
        {perms.viewSaleProfit && (
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/50">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Today&apos;s Profit</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatBDT(todaySales.reduce((sum, s) => sum + s.totalProfit, 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <FilterBar
        searchValue={searchInput}
        searchPlaceholder="Search by invoice #, customer name, or phone..."
        onSearchChange={(v) => { setSearchInput(v); pagination.setPage(1); }}
        isFetching={isFetching && !isLoading}
        hasActiveFilters={!!searchInput}
        onClearFilters={() => { setSearchInput(''); pagination.setPage(1); }}
      >
        <FilterSelect
          value={String(pagination.limit)}
          onChange={(v) => pagination.setLimit(Number(v))}
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {/* Table */}
      <div className={`table-container ${isPlaceholderData ? 'opacity-70 transition-opacity' : ''}`}>
        <div className="table-scroll">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</th>
              <th className="hidden px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell dark:text-gray-400">Items</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
              {perms.viewSaleProfit && (
                <th className="hidden px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell dark:text-gray-400">Profit</th>
              )}
              <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell dark:text-gray-400">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <Receipt className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {debouncedSearch ? 'No sales match your search' : 'No sales recorded yet'}
                  </p>
                  {!debouncedSearch && perms.createSale && (
                    <Link to="/sales/create" className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                      <Plus className="h-4 w-4" /> Create your first sale
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              data?.data.map((sale) => (
                <tr key={sale.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                      {sale.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sale.customerName ?? 'Walk-in Customer'}
                    </p>
                    {sale.customerPhone && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{sale.customerPhone}</p>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap px-6 py-4 text-center sm:table-cell">
                    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {sale.items.length}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatBDT(sale.totalAmount)}
                    </span>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {getPaymentLabel(sale.paymentMethod)}
                      {sale.paymentStatus !== 'PAID' && (
                        <span className="ml-1 text-orange-500">({sale.paymentStatus})</span>
                      )}
                    </p>
                  </td>
                  {perms.viewSaleProfit && (
                    <td className="hidden whitespace-nowrap px-6 py-4 text-right lg:table-cell">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{formatBDT(sale.totalProfit)}
                      </span>
                    </td>
                  )}
                  <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(sale.saleDate).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-400">{formatTime(sale.saleDate)}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedSaleId(sale.id)}
                      className="rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-blue-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={!pagination.canPrev} onClick={pagination.prevPage} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&lsaquo;</button>
            {pagination.pageRange(totalPages).map((p, idx) =>
              p === -1 ? (
                <span key={`e-${String(idx)}`} className="px-1 text-gray-400">...</span>
              ) : (
                <button key={p} onClick={() => pagination.setPage(p)} className={`min-w-[32px] rounded-md border px-2 py-1 text-sm ${p === pagination.page ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300'}`}>{p}</button>
              ),
            )}
            <button disabled={!pagination.canNext(totalPages)} onClick={pagination.nextPage} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&rsaquo;</button>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      <Dialog open={!!selectedSaleId} onOpenChange={(open) => { if (!open) setSelectedSaleId(null); }}>
        <DialogContent>
          {selectedSale ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {selectedSale.invoiceNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatDate(selectedSale.saleDate)}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Paid
                </span>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {(selectedSale.customerName ?? 'W').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedSale.customerName ?? 'Walk-in Customer'}
                  </p>
                  <p className="text-xs text-gray-500">{selectedSale.customerPhone ?? 'No phone'}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Items ({selectedSale.items.length})
                </p>
                <div className="space-y-1.5">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                        <p className="text-xs text-gray-400">{item.product.brand} &middot; {item.quantity} × {formatBDT(item.unitPrice)}</p>
                      </div>
                      <p className="ml-4 shrink-0 text-sm font-bold text-gray-900 dark:text-white">
                        {formatBDT(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatBDT(selectedSale.totalAmount)}</span>
                </div>
                {perms.viewSaleProfit && (
                  <div className="mt-1 flex justify-between">
                    <span className="text-xs text-gray-400">Profit</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">+{formatBDT(selectedSale.totalProfit)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedSaleId(null);
                    navigate(`/sales/${selectedSale.id}/invoice`);
                  }}
                >
                  <Receipt className="mr-1.5 h-4 w-4" /> View Invoice
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                  <Printer className="mr-1.5 h-4 w-4" /> Print
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
