import { useState } from 'react';
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  type Coupon,
  type CreateCouponData,
} from '@/features/coupons/api/coupon.api';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { usePagination } from '@/shared/hooks/use-pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';

const PAGE_SIZES = [10, 20, 50] as const;

function getCouponStatus(coupon: Coupon): 'active' | 'inactive' | 'expired' {
  if (!coupon.isActive) return 'inactive';
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return 'expired';
  return 'active';
}

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-800';

const selectClass =
  'mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-800';

interface CouponFormState {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  isActive: boolean;
  startDate: string;
  expiryDate: string;
}

const emptyForm: CouponFormState = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  isActive: true,
  startDate: '',
  expiryDate: '',
};

function couponToForm(coupon: Coupon): CouponFormState {
  return {
    code: coupon.code,
    description: coupon.description ?? '',
    discountType: coupon.discountType,
    discountValue: String(coupon.discountValue),
    minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
    maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
    usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
    isActive: coupon.isActive,
    startDate: coupon.startDate ? coupon.startDate.slice(0, 16) : '',
    expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 16) : '',
  };
}

function formToData(form: CouponFormState): CreateCouponData {
  return {
    code: form.code.toUpperCase(),
    description: form.description || undefined,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
    maxDiscount: form.discountType === 'PERCENTAGE' && form.maxDiscount ? Number(form.maxDiscount) : null,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    isActive: form.isActive,
    startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
    expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
  };
}

export function CouponsPage() {
  const perms = usePermissions();
  const pagination = usePagination({ initialLimit: 20 });

  const { data, isLoading, isPlaceholderData } = useCoupons(pagination.page, pagination.limit);
  const deleteCoupon = useDeleteCoupon();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();

  const totalPages = data?.totalPages ?? 0;

  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; item?: Coupon } | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm);

  function openCreate() {
    setForm(emptyForm);
    setModal({ mode: 'create' });
  }

  function openEdit(coupon: Coupon) {
    setForm(couponToForm(coupon));
    setModal({ mode: 'edit', item: coupon });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = formToData(form);

    if (modal?.mode === 'edit' && modal.item) {
      updateCoupon.mutate(
        { id: modal.item.id, data: payload },
        {
          onSuccess: () => { toast.success('Coupon updated'); setModal(null); },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createCoupon.mutate(payload, {
        onSuccess: () => { toast.success('Coupon created'); setModal(null); },
        onError: (err) => toast.error(err.message),
      });
    }
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 sm:gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-2.5">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage discount coupons &amp; promotional codes
            </p>
          </div>
        </div>
        {perms.manageSettings && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Create Coupon
          </Button>
        )}
      </div>

      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <select
          value={String(pagination.limit)}
          onChange={(e) => pagination.setLimit(Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={`table-container ${isPlaceholderData ? 'opacity-70 transition-opacity' : 'transition-opacity'}`}>
        <div className="table-scroll">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Min Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Max Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                {perms.manageSettings && (
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
                    No coupons found. Create your first coupon.
                  </td>
                </tr>
              ) : (
                data?.data.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {coupon.discountType === 'PERCENTAGE' ? '%' : '৳'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%`
                          : formatBDT(coupon.discountValue)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {coupon.minOrderAmount ? formatBDT(coupon.minOrderAmount) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {coupon.maxDiscount ? formatBDT(coupon.maxDiscount) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : status === 'expired'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {status === 'active' ? 'Active' : status === 'expired' ? 'Expired' : 'Inactive'}
                        </span>
                      </td>
                      {perms.manageSettings && (
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="mr-3 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            <Pencil className="inline h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
                              deleteCoupon.mutate(coupon.id, {
                                onSuccess: () => toast.success('Coupon deleted'),
                                onError: (err) => toast.error(err.message),
                              });
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                          >
                            <Trash2 className="inline h-4 w-4" />
                          </button>
                        </td>
                      )}
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

      {/* Create / Edit Modal */}
      {modal && (
        <Dialog open={true} onOpenChange={() => setModal(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{modal.mode === 'edit' ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
                <DialogDescription>
                  {modal.mode === 'edit' ? 'Update the coupon details below.' : 'Fill in the details to create a new coupon.'}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Code</Label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    required
                    className={inputClass}
                    placeholder="e.g., SUMMER20"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <Label>Description <span className="text-gray-400">(optional)</span></Label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g., Summer sale 20% off"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount Type</Label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' }))}
                      className={selectClass}
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (৳)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Discount Value</Label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.discountValue}
                      onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                      required
                      className={inputClass}
                      placeholder={form.discountType === 'PERCENTAGE' ? 'e.g., 15' : 'e.g., 200'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Order Amount</Label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.minOrderAmount}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g., 1000"
                    />
                  </div>
                  {form.discountType === 'PERCENTAGE' && (
                    <div>
                      <Label>Max Discount</Label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.maxDiscount}
                        onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                        className={inputClass}
                        placeholder="e.g., 500"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Usage Limit <span className="text-gray-400">(leave empty for unlimited)</span></Label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date <span className="text-gray-400">(optional)</span></Label>
                    <input
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label>Expiry Date <span className="text-gray-400">(optional)</span></Label>
                    <input
                      type="datetime-local"
                      value={form.expiryDate}
                      onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.isActive}
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      form.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        form.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <Label className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}>
                    Active
                  </Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                <Button type="submit" disabled={createCoupon.isPending || updateCoupon.isPending}>
                  {(createCoupon.isPending || updateCoupon.isPending)
                    ? 'Saving...'
                    : modal.mode === 'edit' ? 'Save Changes' : 'Create Coupon'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
