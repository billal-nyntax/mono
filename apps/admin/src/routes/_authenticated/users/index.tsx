import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers, useUnsuspendUser, useDeleteUser } from '@/features/users/api/user.api';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { FilterBar, FilterSelect } from '@/shared/components/filter-bar';
import { SuspendUserModal } from '@/features/users/components/suspend-user-modal';
import { toast } from 'sonner';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export function UsersPage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const pagination = usePagination({ initialLimit: 20 });

  const [suspendTarget, setSuspendTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, isFetching, isPlaceholderData } = useUsers(
    pagination.page,
    pagination.limit,
    debouncedSearch || undefined,
  );

  const unsuspendUser = useUnsuspendUser();
  const deleteUser = useDeleteUser();

  const totalPages = data?.totalPages ?? 0;

  function handleSearchChange(value: string) {
    setSearchInput(value);
    pagination.setPage(1);
  }

  function handleUnsuspend(userId: string, userName: string) {
    if (!confirm(`Unsuspend ${userName}?`)) return;
    unsuspendUser.mutate(userId, {
      onSuccess: () => toast.success(`${userName} has been unsuspended`),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 sm:gap-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchInput}
        searchPlaceholder="Search by name or email..."
        onSearchChange={handleSearchChange}
        isFetching={isFetching && !isLoading}
        hasActiveFilters={!!searchInput}
        onClearFilters={() => { setSearchInput(''); pagination.setPage(1); }}
      >
        <FilterSelect
          value={String(pagination.limit)}
          onChange={(value) => pagination.setLimit(Number(value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {/* Table */}
      <div className={`table-container ${isPlaceholderData ? 'opacity-70 transition-opacity' : 'transition-opacity'}`}>
        <div className="table-scroll">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: pagination.limit }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  {debouncedSearch
                    ? `No users found matching "${debouncedSearch}"`
                    : 'No users found'}
                </td>
              </tr>
            ) : (
              data?.data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        user.role === 'super_admin'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {user.suspended ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Suspended
                      </span>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          user.emailVerified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {user.emailVerified ? 'Active' : 'Unverified'}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      to={`/users/${user.id}`}
                      className="mr-3 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      View
                    </Link>
                    {user.suspended ? (
                      <button
                        onClick={() => handleUnsuspend(user.id, user.name)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        onClick={() => setSuspendTarget({ id: user.id, name: user.name })}
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!confirm(`Permanently delete "${user.name}"? This cannot be undone.`)) return;
                        deleteUser.mutate(user.id, {
                          onSuccess: () => toast.success(`${user.name} deleted`),
                          onError: (err) => toast.error(err.message),
                        });
                      }}
                      className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {data && totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
            {' '}-{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, data.total)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{data.total}</span> users
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={!pagination.canPrev}
              onClick={pagination.goToFirst}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300"
              title="First page"
            >
              &laquo;
            </button>
            <button
              disabled={!pagination.canPrev}
              onClick={pagination.prevPage}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300"
              title="Previous page"
            >
              &lsaquo;
            </button>

            {pagination.pageRange(totalPages).map((pageNum, idx) =>
              pageNum === -1 ? (
                <span
                  key={`ellipsis-${String(idx)}`}
                  className="px-1 text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => pagination.setPage(pageNum)}
                  disabled={isPlaceholderData}
                  className={`min-w-[32px] rounded-md border px-2 py-1 text-sm ${
                    pageNum === pagination.page
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              disabled={!pagination.canNext(totalPages)}
              onClick={pagination.nextPage}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300"
              title="Next page"
            >
              &rsaquo;
            </button>
            <button
              disabled={!pagination.canNext(totalPages)}
              onClick={() => pagination.goToLast(totalPages)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-30 dark:border-gray-600 dark:text-gray-300"
              title="Last page"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}

      {suspendTarget && (
        <SuspendUserModal
          userId={suspendTarget.id}
          userName={suspendTarget.name}
          open={true}
          onOpenChange={(open) => {
            if (!open) setSuspendTarget(null);
          }}
        />
      )}
    </div>
  );
}
