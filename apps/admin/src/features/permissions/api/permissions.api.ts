import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { AdminUser, PaginatedResponse } from '@/shared/api/types';

export function usePermissionUsers(page: number = 1, limit: number = 20, search?: string) {
  return useQuery({
    queryKey: ['permissions', 'users', { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const res = await httpClient.get<PaginatedResponse<AdminUser>>(
        `/admin/permissions/users?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch users');
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' | 'super_admin' }) => {
      const res = await httpClient.patch<AdminUser>(
        `/admin/users/${userId}/role`,
        { role },
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to change role');
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['permissions'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
