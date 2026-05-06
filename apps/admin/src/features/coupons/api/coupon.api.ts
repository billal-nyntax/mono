import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { PaginatedResponse } from '@/shared/api/types';

export interface Coupon {
  readonly id: string;
  readonly code: string;
  readonly description: string | null;
  readonly discountType: 'PERCENTAGE' | 'FIXED';
  readonly discountValue: number;
  readonly minOrderAmount: number;
  readonly maxDiscount: number | null;
  readonly usageLimit: number | null;
  readonly usageCount: number;
  readonly isActive: boolean;
  readonly startDate: string | null;
  readonly expiryDate: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  isActive?: boolean;
  startDate?: string | null;
  expiryDate?: string | null;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {}

export function useCoupons(page: number, limit: number) {
  return useQuery({
    queryKey: ['coupons', { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await httpClient.get<PaginatedResponse<Coupon>>(
        `/admin/coupons?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch coupons');
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: ['coupons', id],
    queryFn: async () => {
      const res = await httpClient.get<Coupon>(`/admin/coupons/${id}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch coupon');
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCouponData) => {
      const res = await httpClient.post<Coupon>('/admin/coupons', data);
      if (!res.success) throw new Error(res.error ?? 'Failed to create coupon');
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCouponData }) => {
      const res = await httpClient.patch<Coupon>(`/admin/coupons/${id}`, data);
      if (!res.success) throw new Error(res.error ?? 'Failed to update coupon');
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['coupons', variables.id] });
      void qc.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await httpClient.delete(`/admin/coupons/${id}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete coupon');
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}
