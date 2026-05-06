import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { Sale, PaginatedResponse } from '@/shared/api/types';

export function useSales(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ['sales', { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);

      const res = await httpClient.get<PaginatedResponse<Sale>>(
        `/admin/sales?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch sales');
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: async () => {
      const res = await httpClient.get<Sale>(`/admin/sales/${id}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch sale');
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      customerName?: string;
      customerPhone?: string;
      discount?: number;
      paymentMethod?: string;
      paidAmount?: number;
      transactionId?: string;
      items: Array<{ productId: string; quantity: number }>;
    }) => {
      const res = await httpClient.post<Sale>('/admin/sales', data);
      if (!res.success) throw new Error(res.error ?? 'Failed to create sale');
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sales'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}
