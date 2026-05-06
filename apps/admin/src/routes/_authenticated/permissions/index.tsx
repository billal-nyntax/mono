import { useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Crown } from 'lucide-react';
import { usePermissionUsers, useChangeRole } from '@/features/permissions/api/permissions.api';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { FilterBar } from '@/shared/components/filter-bar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

type UserRole = 'user' | 'admin' | 'super_admin';

const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    description: 'Full access to all features including role management',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    description: 'Can manage users, products, and content',
  },
  user: {
    label: 'User',
    icon: Shield,
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    description: 'Standard user with basic access',
  },
} as const;

export function PermissionsPage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const pagination = usePagination({ initialLimit: 20 });

  const { data, isLoading, isFetching } = usePermissionUsers(
    pagination.page,
    pagination.limit,
    debouncedSearch || undefined,
  );

  const changeRole = useChangeRole();
  const totalPages = data?.totalPages ?? 0;

  const [roleModal, setRoleModal] = useState<{
    userId: string;
    userName: string;
    currentRole: UserRole;
  } | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  function openRoleModal(userId: string, userName: string, currentRole: UserRole) {
    setRoleModal({ userId, userName, currentRole });
    setSelectedRole(currentRole);
  }

  function handleChangeRole() {
    if (!roleModal) return;
    if (selectedRole === roleModal.currentRole) {
      setRoleModal(null);
      return;
    }
    changeRole.mutate(
      { userId: roleModal.userId, role: selectedRole },
      {
        onSuccess: () => {
          toast.success(`${roleModal.userName} is now ${ROLE_CONFIG[selectedRole].label}`);
          setRoleModal(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/50">
            <ShieldAlert className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage user roles and access levels. Only Super Admins can change roles.
            </p>
          </div>
        </div>
      </div>

      {/* Role Legend */}
      <div className="card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Role Levels</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([key, config]) => (
            <div key={key} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <config.icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{config.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <FilterBar
        searchValue={searchInput}
        searchPlaceholder="Search users to manage roles..."
        onSearchChange={(value) => { setSearchInput(value); pagination.setPage(1); }}
        isFetching={isFetching && !isLoading}
        hasActiveFilters={!!searchInput}
        onClearFilters={() => { setSearchInput(''); pagination.setPage(1); }}
      >
        <span />
      </FilterBar>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Current Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-6 py-4">
                    <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              data?.data.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role];
                const RoleIcon = roleConfig.icon;
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${roleConfig.badgeClass}`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.suspended ? (
                        <span className="text-red-600 dark:text-red-400">Suspended</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openRoleModal(user.id, user.name, user.role)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Shield className="h-3 w-3" />
                        Change Role
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={!pagination.canPrev} onClick={pagination.prevPage} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&lsaquo;</button>
            {pagination.pageRange(totalPages).map((p, idx) =>
              p === -1 ? (
                <span key={`e-${String(idx)}`} className="px-1 text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => pagination.setPage(p)}
                  className={`min-w-[32px] rounded-md border px-2 py-1 text-sm ${
                    p === pagination.page
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button disabled={!pagination.canNext(totalPages)} onClick={pagination.nextPage} className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300">&rsaquo;</button>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleModal && (
        <Dialog open={true} onOpenChange={() => setRoleModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Role</DialogTitle>
              <DialogDescription>
                Change the role for <strong>{roleModal.userName}</strong>. This affects their access level.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([key, config]) => {
                const RoleIcon = config.icon;
                const isSelected = selectedRole === key;
                const isCurrent = roleModal.currentRole === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                  >
                    <RoleIcon className={`h-5 w-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                        {config.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs text-gray-400">(current)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
                    </div>
                    {isSelected && (
                      <div className="h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setRoleModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleChangeRole}
                disabled={changeRole.isPending || selectedRole === roleModal.currentRole}
              >
                {changeRole.isPending ? 'Updating...' : 'Update Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
