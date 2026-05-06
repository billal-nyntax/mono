import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  User,
  MapPin,
  Package,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '@/features/orders/api/order.api';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import type { OrderStatus, OrderPaymentStatus } from '@/shared/api/types';

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

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const CANCELLABLE: OrderStatus[] = ['PENDING', 'CONFIRMED'];

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(orderId ?? '');
  const updateStatus = useUpdateOrderStatus();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    status: OrderStatus | null;
  }>({ open: false, status: null });

  function handleStatusChange(newStatus: OrderStatus) {
    setConfirmDialog({ open: true, status: newStatus });
  }

  function confirmStatusUpdate() {
    if (!orderId || !confirmDialog.status) return;
    updateStatus.mutate(
      { id: orderId, status: confirmDialog.status },
      {
        onSuccess: () => setConfirmDialog({ open: false, status: null }),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Failed to load order details
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const nextStatuses = NEXT_STATUSES[order.status];
  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <div className="flex h-full w-full flex-col gap-4 sm:gap-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Order {order.orderNumber}
            </h2>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_STYLES[order.status]}`}
            >
              {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 sm:gap-6">
        {/* Left Column — order details */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-2">
          {/* Order Items */}
          <div className="card">
            <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Order Items ({order.items.length})
              </h3>
            </div>
            <div className="table-scroll">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Product
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item: { id: string; product: { id: string; name: string; brand: { name: string } | string }; quantity: number; unitPrice: number }) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {typeof item.product.brand === 'string' ? item.product.brand : item.product.brand?.name}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                        {formatBDT(item.unitPrice)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {formatBDT(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatBDT(order.subtotal)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Discount
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      -{formatBDT(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Shipping
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {order.shippingCost > 0
                      ? formatBDT(order.shippingCost)
                      : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatBDT(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — info cards + actions */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Order Info */}
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Order Info
              </h3>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  Order Number
                </dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                  {order.orderNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  Date
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {formatDate(order.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  Status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_STYLES[order.status]}`}
                  >
                    {order.status.charAt(0) +
                      order.status.slice(1).toLowerCase()}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  Payment Method
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {order.paymentMethod}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  Payment Status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}
                  >
                    {order.paymentStatus}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Customer Info */}
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Customer
              </h3>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                  {order.user?.name ?? order.shippingAddress?.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {order.user?.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Phone</dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {order.shippingAddress?.phone ?? order.user?.phone ?? '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Shipping Address
              </h3>
            </div>
            <address className="text-sm not-italic leading-relaxed text-gray-700 dark:text-gray-300">
              {order.shippingAddress?.address ?? order.shippingAddress?.street}
              <br />
              {order.shippingAddress?.area && <>{order.shippingAddress.area}, </>}
              {order.shippingAddress?.city}
              {order.shippingAddress?.state && <>, {order.shippingAddress.state}</>}
              {order.shippingAddress?.postalCode && <> {order.shippingAddress.postalCode}</>}
            </address>
          </div>

          {/* Status Actions */}
          {nextStatuses.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Update Status
              </h3>
              <div className="flex flex-col gap-2">
                {nextStatuses
                  .filter((s) => s !== 'CANCELLED')
                  .map((s) => (
                    <Button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : null}
                      Mark as {s.charAt(0) + s.slice(1).toLowerCase()}
                    </Button>
                  ))}
                {canCancel && (
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange('CANCELLED')}
                    disabled={updateStatus.isPending}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
              {updateStatus.isError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {updateStatus.error.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, status: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.status === 'CANCELLED'
                ? 'Cancel Order'
                : 'Update Order Status'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.status === 'CANCELLED'
                ? `Are you sure you want to cancel order ${order.orderNumber}? This action cannot be undone.`
                : `Change order status to "${confirmDialog.status ? confirmDialog.status.charAt(0) + confirmDialog.status.slice(1).toLowerCase() : ''}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, status: null })
              }
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmDialog.status === 'CANCELLED'
                  ? 'destructive'
                  : 'default'
              }
              onClick={confirmStatusUpdate}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
