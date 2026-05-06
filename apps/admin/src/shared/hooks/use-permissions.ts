import { useMemo } from 'react';
import { useAdminAuth } from '@/features/auth/use-admin-auth';
import { getPermissions, type PermissionMap } from '@/shared/lib/permissions';

export function usePermissions(): PermissionMap {
  const { user } = useAdminAuth();

  return useMemo(
    () => getPermissions(user?.role ?? 'user'),
    [user?.role],
  );
}
