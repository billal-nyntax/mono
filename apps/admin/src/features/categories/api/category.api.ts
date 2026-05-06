import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';

interface CategoryItem {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly icon: string | null;
  readonly _count: { products: number };
}

interface BrandItem {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly logo: string | null;
  readonly _count: { products: number };
}

export function useCategories() {
  return useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: async () => {
      const res = await httpClient.get<CategoryItem[]>('/admin/catalog/categories');
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch categories');
      return res.data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; icon?: string }) => {
      const res = await httpClient.post<CategoryItem>('/admin/catalog/categories', data);
      if (!res.success) throw new Error(res.error ?? 'Failed to create category');
      return res.data;
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'categories'] }); },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; slug?: string; icon?: string } }) => {
      const res = await httpClient.patch<CategoryItem>(`/admin/catalog/categories/${id}`, data);
      if (!res.success) throw new Error(res.error ?? 'Failed to update category');
      return res.data;
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'categories'] }); },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await httpClient.delete(`/admin/catalog/categories/${id}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete');
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'categories'] }); },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['catalog', 'brands'],
    queryFn: async () => {
      const res = await httpClient.get<BrandItem[]>('/admin/catalog/brands');
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch brands');
      return res.data;
    },
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; logo?: string }) => {
      const res = await httpClient.post<BrandItem>('/admin/catalog/brands', data);
      if (!res.success) throw new Error(res.error ?? 'Failed to create brand');
      return res.data;
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'brands'] }); },
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; slug?: string; logo?: string } }) => {
      const res = await httpClient.patch<BrandItem>(`/admin/catalog/brands/${id}`, data);
      if (!res.success) throw new Error(res.error ?? 'Failed to update brand');
      return res.data;
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'brands'] }); },
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await httpClient.delete(`/admin/catalog/brands/${id}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete');
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['catalog', 'brands'] }); },
  });
}

export type { CategoryItem, BrandItem };
