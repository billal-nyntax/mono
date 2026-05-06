import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { AdminUser, PaginatedResponse, Address } from '@/shared/api/types';

export function useUsers(page: number = 1, limit: number = 20, search?: string) {
  return useQuery({
    queryKey: ['admin', 'users', { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set('search', search);
      const res = await httpClient.get<PaginatedResponse<AdminUser>>(
        `/admin/users?${params.toString()}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch users');
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: async () => {
      const res = await httpClient.get<AdminUser>(`/admin/users/${userId}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch user');
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUserAddresses(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'addresses'],
    queryFn: async () => {
      const res = await httpClient.get<Address[]>(
        `/admin/users/${userId}/addresses`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch addresses');
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<AdminUser>;
    }) => {
      const res = await httpClient.patch<AdminUser>(
        `/admin/users/${userId}`,
        data,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to update user');
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'users', variables.userId],
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const res = await httpClient.patch<AdminUser>(
        `/admin/users/${userId}/suspend`,
        { reason },
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to suspend user');
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'users', variables.userId],
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await httpClient.patch<AdminUser>(
        `/admin/users/${userId}/unsuspend`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to unsuspend user');
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await httpClient.delete(`/admin/users/${userId}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete user');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
