import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Package } from 'lucide-react';
import { useSale } from '@/features/sales/api/sales.api';
import { getPaymentLabel } from '@/shared/config/payment-methods';
import { Button } from '@/shared/components/ui/button';

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD')}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function InvoicePage() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const { data: sale, isLoading } = useSale(saleId ?? '');

  if (isLoading || !sale) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  const itemCount = sale.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Action bar */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate('/sales')}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sales
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" /> Print Invoice
          </Button>
          <Button onClick={() => window.print()}>
            <Download className="mr-1.5 h-4 w-4" /> Save as PDF
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none dark:border-gray-700 dark:bg-gray-900">

        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 print:bg-blue-600" />

        <div className="p-8 sm:p-10 print:p-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white print:h-10 print:w-10">
                <Package className="h-6 w-6 print:h-5 print:w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TechHub BD</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dhaka, Bangladesh</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Invoice</p>
              <p className="mt-1 font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                {sale.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Meta info */}
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Bill To</p>
              <p className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                {sale.customerName ?? 'Walk-in Customer'}
              </p>
              {sale.customerPhone && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{sale.customerPhone}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Date</p>
              <p className="mt-1.5 text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(sale.saleDate)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(sale.saleDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Payment</p>
              <p className="mt-1.5 text-sm font-medium text-gray-900 dark:text-white">
                {getPaymentLabel(sale.paymentMethod)}
              </p>
              <p className={`text-xs ${sale.paymentStatus === 'PAID' ? 'text-green-600 dark:text-green-400' : sale.paymentStatus === 'PARTIAL' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                {sale.paymentStatus === 'PAID' ? 'Paid' : sale.paymentStatus === 'PARTIAL' ? 'Partial' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">#</th>
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Product</th>
                  <th className="pb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">Qty</th>
                  <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Unit Price</th>
                  <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-4 text-sm text-gray-400">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.product.brand}</p>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                      {formatBDT(item.unitPrice)}
                    </td>
                    <td className="py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatBDT(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                <span className="text-gray-900 dark:text-white">{formatBDT(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className={sale.discount > 0 ? 'text-red-500' : 'text-gray-500'}>
                  {sale.discount > 0 ? `-${formatBDT(sale.discount)}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-500">—</span>
              </div>
              <div className="border-t-2 border-gray-900 pt-2 dark:border-gray-200">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatBDT(sale.totalAmount)}</span>
                </div>
              </div>
              {sale.paidAmount > 0 && sale.paidAmount < sale.totalAmount && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Paid</span>
                    <span className="text-green-600">{formatBDT(sale.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Due</span>
                    <span className="font-semibold text-red-600">{formatBDT(sale.dueAmount)}</span>
                  </div>
                </>
              )}
              <div className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${
                sale.paymentStatus === 'PAID'
                  ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  : sale.paymentStatus === 'PARTIAL'
                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {sale.paymentStatus === 'PAID' ? 'PAID IN FULL' : sale.paymentStatus === 'PARTIAL' ? 'PARTIALLY PAID' : 'PAYMENT PENDING'}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-10 rounded-lg border border-dashed border-gray-200 p-4 dark:border-gray-700">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Notes</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Thank you for shopping with TechHub BD! All products come with standard manufacturer warranty.
              For returns or exchanges, please bring this invoice within 7 days of purchase.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                  <Package className="h-3 w-3" />
                </div>
                <span className="font-medium">TechHub BD</span>
              </div>
              <div className="flex gap-4">
                <span>+880 1700-000001</span>
                <span>techhub.com.bd</span>
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-400">
              This is a computer-generated invoice. No signature required.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
