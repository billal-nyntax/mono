import { CreditCard, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { usePayments, usePaymentStats } from '@/features/payments/api/payment.api';
import { useAdminAuth } from '@/features/auth/use-admin-auth';
import { usePagination } from '@/shared/hooks/use-pagination';

type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';

const PAGE_SIZES = [10, 20, 50] as const;

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

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

export function PaymentsPage() {
  const { user } = useAdminAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const pagination = usePagination({ initialLimit: 20 });

  const { data, isLoading, isPlaceholderData } = usePayments(
    pagination.page,
    pagination.limit,
  );
  const { data: stats } = usePaymentStats();
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex h-full w-full flex-col gap-3 sm:gap-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payments
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View payment transactions across all orders
        </p>
      </div>

      {/* Stats Cards — super_admin only */}
      {isSuperAdmin && stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/50">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Payments</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalPayments}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/50">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatBDT(stats.totalPaidAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950/50">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.byStatus.PAID}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-50 p-2 dark:bg-yellow-950/50">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.byStatus.PENDING}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/50">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.byStatus.FAILED}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page size selector */}
      <div className="flex items-center justify-end">
        <select
          value={String(pagination.limit)}
          onChange={(e) => pagination.setLimit(Number(e.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </select>
      </div>

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
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell dark:text-gray-400">
                  Gateway
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell dark:text-gray-400">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell dark:text-gray-400">
                  Date
                </th>
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
                    <CreditCard className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      No payments yet
                    </p>
                  </td>
                </tr>
              ) : (
                data?.data.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                        {payment.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.customerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.customerEmail}
                      </p>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {payment.gateway}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 lg:table-cell">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {payment.gatewayTxnId ?? '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatBDT(payment.amount)}
                      </span>
                      {payment.currency !== 'BDT' && (
                        <span className="ml-1 text-xs text-gray-400">
                          {payment.currency}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[payment.status]}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(payment.createdAt)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(payment.createdAt)}
                        </p>
                      </div>
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
