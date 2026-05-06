import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Eye, Package } from 'lucide-react';
import { useOrders } from '@/features/orders/api/order.api';
import { usePagination } from '@/shared/hooks/use-pagination';
import { FilterBar, FilterSelect } from '@/shared/components/filter-bar';
import type { OrderStatus, OrderPaymentStatus } from '@/shared/api/types';

const PAGE_SIZES = [10, 20, 50] as const;

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD')}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  SHIPPED:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const PAYMENT_STATUS_STYLES: Record<OrderPaymentStatus, string> = {
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function OrdersPage() {
  const navigate = useNavigate();
  const pagination = usePagination({ initialLimit: 20 });
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const { data, isLoading, isFetching, isPlaceholderData } = useOrders(
    pagination.page,
    pagination.limit,
    statusFilter || undefined,
  );
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex h-full w-full flex-col gap-3 sm:gap-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage customer orders
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/50">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {data?.total ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2 dark:bg-yellow-950/50">
              <Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pending
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {data?.data.filter((o) => o.status === 'PENDING').length ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/50">
              <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Processing
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {data?.data.filter((o) => o.status === 'PROCESSING').length ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950/50">
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Delivered
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {data?.data.filter((o) => o.status === 'DELIVERED').length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue=""
        searchPlaceholder="Search orders..."
        onSearchChange={() => {}}
        isFetching={isFetching && !isLoading}
        hasActiveFilters={!!statusFilter}
        onClearFilters={() => {
          setStatusFilter('');
          pagination.setPage(1);
        }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v as OrderStatus | '');
            pagination.setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={String(pagination.limit)}
          onChange={(v) => pagination.setLimit(Number(v))}
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </FilterSelect>
      </FilterBar>

      {/* Table */}
      <div
        className={`table-container ${isPlaceholderData ? 'opacity-70 transition-opacity' : ''}`}
      >
        <div className="table-scroll">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Customer
                </th>
                <th className="hidden px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell dark:text-gray-400">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Total
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell dark:text-gray-400">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell dark:text-gray-400">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-6 py-4">
                      <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    </td>
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <ClipboardList className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {statusFilter
                        ? 'No orders match the selected filter'
                        : 'No orders yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                data?.data.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.user.email}
                      </p>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-center sm:table-cell">
                      <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {order.itemCount}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatBDT(order.totalAmount)}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_STYLES[order.status]}`}
                      >
                        {order.status.charAt(0) +
                          order.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order.id}`);
                        }}
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
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, data.total)} of{' '}
            {data.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={!pagination.canPrev}
              onClick={pagination.prevPage}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300"
            >
              &lsaquo;
            </button>
            {pagination.pageRange(totalPages).map((p, idx) =>
              p === -1 ? (
                <span
                  key={`e-${String(idx)}`}
                  className="px-1 text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => pagination.setPage(p)}
                  className={`min-w-[32px] rounded-md border px-2 py-1 text-sm ${p === pagination.page ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300'}`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              disabled={!pagination.canNext(totalPages)}
              onClick={pagination.nextPage}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300"
            >
              &rsaquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
