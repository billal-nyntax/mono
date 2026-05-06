import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './use-admin-auth';

interface SuperAdminGuardProps {
  readonly children: ReactNode;
}

export function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
