import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { Product, StockMovement, PaginatedResponse } from '@/shared/api/types';

export function useStockOverview(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ['stock', 'overview', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);

      const res = await httpClient.get<PaginatedResponse<Product>>(
        `/admin/products?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch stock overview');
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useStockHistory(productId: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['stock', 'history', productId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await httpClient.get<PaginatedResponse<StockMovement>>(
        `/admin/stock/${productId}/history?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch stock history');
      return res.data;
    },
    enabled: !!productId,
    placeholderData: keepPreviousData,
  });
}

export function useAddStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: string; quantity: number; reason?: string }) => {
      const res = await httpClient.post<StockMovement>(
        `/admin/stock/${data.productId}/add`,
        { quantity: data.quantity, reason: data.reason },
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to add stock');
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stock'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useRemoveStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: string; quantity: number; reason?: string }) => {
      const res = await httpClient.post<StockMovement>(
        `/admin/stock/${data.productId}/remove`,
        { quantity: data.quantity, reason: data.reason },
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to remove stock');
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stock'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
