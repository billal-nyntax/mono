import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Phone, CheckCircle } from 'lucide-react';
import { getEnabledPaymentMethods, getPaymentMethodById } from '@/shared/config/payment-methods';
import { useProducts } from '@/features/products/api/product.api';
import { useCreateSale } from '@/features/sales/api/sales.api';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import type { Product } from '@/shared/api/types';

interface CartItem {
  product: Product;
  quantity: number;
}

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD')}`;
}

function PaymentMethodSelector({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const methods = getEnabledPaymentMethods();
  return (
    <div className="grid grid-cols-2 gap-2">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onSelect(method.id)}
          className={`flex items-center gap-2 rounded-lg border-2 p-2.5 text-sm font-medium transition-all ${
            selected === method.id
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-400'
              : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
          }`}
        >
          <method.icon className="h-4 w-4" />
          {method.label}
        </button>
      ))}
    </div>
  );
}

export function CreateSalePage() {
  const perms = usePermissions();
  const navigate = useNavigate();
  const createSale = useCreateSale();
  const searchRef = useRef<HTMLInputElement>(null);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [showDropdown, setShowDropdown] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [saleComplete, setSaleComplete] = useState(false);

  const { data: searchResults } = useProducts({
    page: 1,
    limit: 8,
    search: debouncedSearch || undefined,
    status: 'AVAILABLE',
  });

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.error(`Only ${String(product.stockQuantity)} in stock`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearchInput('');
    setShowDropdown(false);
    searchRef.current?.focus();
  }

  function updateQuantity(productId: string, newQty: number) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const clamped = Math.max(1, Math.min(newQty, item.product.stockQuantity));
        return { ...item, quantity: clamped };
      }),
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalProfit = 0;
    let totalItems = 0;
    for (const item of cart) {
      subtotal += item.product.sellingPrice * item.quantity;
      totalProfit += (item.product.sellingPrice - item.product.purchasePrice) * item.quantity;
      totalItems += item.quantity;
    }
    const discountAmount = parseFloat(discount) || 0;
    const totalAmount = Math.max(0, subtotal - discountAmount);
    const adjustedProfit = Math.max(0, totalProfit - discountAmount);
    return { subtotal, discountAmount, totalAmount, adjustedProfit, totalItems };
  }, [cart, discount]);

  function handleSubmit() {
    if (cart.length === 0) {
      toast.error('Add at least one product');
      return;
    }

    const paid = paidAmount ? parseFloat(paidAmount) : undefined;
    const disc = discount ? parseFloat(discount) : undefined;

    createSale.mutate(
      {
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        discount: disc,
        paymentMethod: paymentMethod as 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | 'BANK_TRANSFER',
        paidAmount: paid,
        transactionId: transactionId.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: (data) => {
          setSaleComplete(true);
          const saleId = data?.id;
          setTimeout(() => {
            if (saleId) {
              navigate(`/sales/${saleId}/invoice`);
            } else {
              navigate('/sales');
            }
          }, 1500);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  if (saleComplete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Sale Complete!</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {formatBDT(totals.totalAmount)} — Redirecting to sales...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/sales')} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
            &larr; Back to Sales
          </button>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">New Sale</h2>
        </div>
        {cart.length > 0 && (
          <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-4 py-2 sm:flex dark:bg-blue-950/30">
            <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {totals.totalItems} items — {formatBDT(totals.totalAmount)}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Search + Cart (3 cols) */}
        <div className="space-y-4 lg:col-span-3">
          {/* Product Search */}
          <div className="card p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="search"
                placeholder="Scan barcode or search product..."
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-800"
              />
              {showDropdown && debouncedSearch && searchResults?.data && searchResults.data.length > 0 && (
                <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  {searchResults.data.map((product) => {
                    const inCart = cart.some((item) => item.product.id === product.id);
                    return (
                      <button
                        key={product.id}
                        onMouseDown={() => addToCart(product)}
                        className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950/30"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                          <ShoppingCart className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.brand} &middot; Stock: {product.stockQuantity} &middot; <span className="font-semibold text-gray-700 dark:text-gray-300">{formatBDT(product.sellingPrice)}</span>
                          </p>
                        </div>
                        {inCart ? (
                          <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Added</span>
                        ) : (
                          <Plus className="h-4 w-4 shrink-0 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Cart ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-700">
                  Clear all
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <ShoppingCart className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500">Search and add products above</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{formatBDT(item.product.sellingPrice)} each</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item.product.stockQuantity}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value, 10) || 1)}
                        className="h-7 w-12 rounded-lg border border-gray-200 text-center text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="w-24 shrink-0 text-right text-sm font-bold text-gray-900 dark:text-white">
                      {formatBDT(item.product.sellingPrice * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary (2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Customer */}
          <div className="card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Customer (optional)</p>
            <div className="space-y-3">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-800"
                />
              </div>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Payment</p>
            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={(id) => { setPaymentMethod(id); setTransactionId(''); }}
            />

            {(() => {
              const method = getPaymentMethodById(paymentMethod);
              if (!method?.requiresTransactionId) return null;
              return (
                <div className="mt-3">
                  <input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder={method.transactionIdLabel}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-800"
                  />
                </div>
              );
            })()}

            <div className="mt-3">
              <label className="text-xs text-gray-500 dark:text-gray-400">Paid Amount (leave empty for full)</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder={totals.totalAmount > 0 ? String(totals.totalAmount) : '0'}
                min="0"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-800"
              />
              {paidAmount && parseFloat(paidAmount) < totals.totalAmount && (
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                  Due: {formatBDT(totals.totalAmount - parseFloat(paidAmount))}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Order Summary</p>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-medium text-gray-900 dark:text-white">{totals.totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatBDT(totals.subtotal)}</span>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500">Discount</span>
                <div className="relative w-28">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">৳</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-md border border-gray-200 py-1.5 pl-6 pr-2 text-right text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500" />
                  <span className="text-xs text-red-500">-{formatBDT(totals.discountAmount)}</span>
                </div>
              )}

              {perms.viewSaleProfit && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. Profit</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+{formatBDT(totals.adjustedProfit)}</span>
                </div>
              )}
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{formatBDT(totals.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full rounded-xl py-3 text-base shadow-lg"
            onClick={handleSubmit}
            disabled={cart.length === 0 || createSale.isPending}
          >
            {createSale.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Complete Sale — ${formatBDT(totals.totalAmount)}`
            )}
          </Button>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-gray-400">
            Tip: Start typing to search products instantly
          </p>
        </div>
      </div>
    </div>
  );
}
