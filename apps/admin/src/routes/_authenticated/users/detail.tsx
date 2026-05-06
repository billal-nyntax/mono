import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useUserAddresses, useUpdateUser, useUnsuspendUser } from '@/features/users/api/user.api';
import { useState } from 'react';
import { toast } from 'sonner';
import { SuspendUserModal } from '@/features/users/components/suspend-user-modal';

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(userId ?? '');
  const { data: addresses } = useUserAddresses(userId ?? '');
  const updateUser = useUpdateUser();
  const unsuspendUser = useUnsuspendUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin' | 'super_admin';
  }>({ name: '', email: '', phone: '', role: 'user' });

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  function startEditing() {
    if (!user) return;
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
    });
    setIsEditing(true);
  }

  function handleSave() {
    if (!userId) return;
    updateUser.mutate(
      { userId, data: { ...editForm, phone: editForm.phone || null } },
      {
        onSuccess: () => {
          toast.success('User updated');
          setIsEditing(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/users')}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            &larr; Back to Users
          </button>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h2>
        </div>
        {!isEditing && (
          <div className="flex gap-3">
            <button
              onClick={startEditing}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Edit User
            </button>
            {user.suspended ? (
              <button
                onClick={() => {
                  if (!userId || !confirm('Unsuspend this user?')) return;
                  unsuspendUser.mutate(userId, {
                    onSuccess: () => toast.success('User unsuspended'),
                    onError: (err) => toast.error(err.message),
                  });
                }}
                disabled={unsuspendUser.isPending}
                className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                {unsuspendUser.isPending ? 'Unsuspending...' : 'Unsuspend'}
              </button>
            ) : (
              <button
                onClick={() => setShowSuspendModal(true)}
                className="rounded-md bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700"
              >
                Suspend
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Profile Information
        </h3>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as 'user' | 'admin' | 'super_admin' }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={updateUser.isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {updateUser.isPending ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setIsEditing(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-600">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
              <dd className="mt-1 text-sm capitalize text-gray-900 dark:text-white">{user.role}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.emailVerified ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">2FA Enabled</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.twoFactorEnabled ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</dt>
              <dd className="mt-1 text-sm">
                {user.suspended ? (
                  <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Suspended
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                )}
              </dd>
            </div>
            {user.suspended && user.suspendedReason && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Suspension Reason</dt>
                <dd className="mt-1 text-sm text-red-600 dark:text-red-400">{user.suspendedReason}</dd>
              </div>
            )}
            {user.suspended && user.suspendedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Suspended Since</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(user.suspendedAt).toLocaleDateString()}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Addresses ({addresses?.length ?? 0})
        </h3>
        {addresses && addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {address.label}
                    {address.isDefault && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Default
                      </span>
                    )}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {address.street}, {address.city}, {address.state}{' '}
                  {address.postalCode}, {address.country}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No addresses found.
          </p>
        )}
      </div>

      {userId && user && (
        <SuspendUserModal
          userId={userId}
          userName={user.name}
          open={showSuspendModal}
          onOpenChange={setShowSuspendModal}
        />
      )}
    </div>
  );
}
