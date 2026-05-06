import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { Order, OrderListItem, OrderStatus, PaginatedResponse } from '@/shared/api/types';

export function useOrders(page: number, limit: number, status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (status) params.set('status', status);

      const res = await httpClient.get<PaginatedResponse<OrderListItem>>(
        `/admin/orders?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch orders');
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const res = await httpClient.get<Order>(`/admin/orders/${id}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch order');
      return res.data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const res = await httpClient.patch<Order>(`/admin/orders/${id}/status`, {
        status,
      });
      if (!res.success)
        throw new Error(res.error ?? 'Failed to update order status');
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({
        queryKey: ['orders', variables.id],
      });
    },
  });
}
