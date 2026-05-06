'use client';

import { useState, useEffect } from 'react';
import { Package, ChevronRight } from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';
import { formatPrice } from '@/lib/format-price';

interface OrderItem {
  productId: string;
  product: { name: string; brand: string };
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-indigo-50 text-indigo-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const token = authClient.getToken();
      if (!token) return;
      try {
        const res = await fetch('/api/v1/shop/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setOrders(data.data ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    void fetchOrders();
  }, []);

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Orders</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track and manage your orders</p>

      <div className="mt-4 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 py-12 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-blue-600">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.items.length} items</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${expandedId === order.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-900 p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.product.brand} &middot; Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(item.unitPrice * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Payment: {order.paymentMethod}</span>
                    <span className="font-bold text-gray-900 dark:text-white">Total: {formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
