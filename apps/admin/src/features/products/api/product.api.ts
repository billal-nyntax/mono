import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { Product, PaginatedResponse } from '@/shared/api/types';

export interface ProductFilters {
  readonly page: number;
  readonly limit: number;
  readonly search?: string;
  readonly categoryId?: string;
  readonly brandId?: string;
  readonly status?: 'AVAILABLE' | 'OUT_OF_STOCK';
  readonly lowStock?: boolean;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(filters.page));
      params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.brandId) params.set('brandId', filters.brandId);
      if (filters.status) params.set('status', filters.status);
      if (filters.lowStock) params.set('lowStock', 'true');
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

      const res = await httpClient.get<PaginatedResponse<Product>>(
        `/admin/products?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch products');
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await httpClient.get<Product>(`/admin/products/${id}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch product');
      return res.data;
    },
    enabled: !!id,
  });
}


export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await httpClient.post<Product>('/admin/products', data);
      if (!res.success) throw new Error(res.error ?? 'Failed to create product');
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await httpClient.patch<Product>(`/admin/products/${id}`, data);
      if (!res.success) throw new Error(res.error ?? 'Failed to update product');
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await httpClient.delete(`/admin/products/${id}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete product');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
