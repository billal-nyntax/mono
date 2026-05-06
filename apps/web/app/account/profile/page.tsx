'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { authClient } from '@/lib/auth/auth-client';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (user && !synced) {
      setName(user.name);
      setPhone(user.phone ?? '');
      setSynced(true);
    }
  }, [user, synced]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = authClient.getToken();
      if (!token) return;

      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        const data = await res.json().catch(() => null);
        setMessage({ type: 'error', text: data?.error ?? 'Failed to update profile' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    }
    setSaving(false);
  }

  const initials = (user?.name ?? 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-BD', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
            {initials}
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {user?.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              )}
              {joinDate && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" /> Joined {joinDate}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700">
                <Shield className="h-3 w-3" /> {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Edit Profile</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your personal information</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 py-2.5 pl-10 pr-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-3 text-sm text-gray-500 dark:text-gray-400"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 py-2.5 pl-10 pr-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/30 text-green-700'
                : 'bg-red-50 dark:bg-red-950/30 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <span>!</span>}
              {message.text}
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => { setName(user?.name ?? ''); setPhone(user?.phone ?? ''); setMessage(null); }}
              className="rounded-xl border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Account Information</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-950 p-4">
            <p className="text-xs font-medium text-gray-400">Account Type</p>
            <p className="mt-1 text-sm font-semibold capitalize text-gray-900 dark:text-white">{user?.role}</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-950 p-4">
            <p className="text-xs font-medium text-gray-400">Email Status</p>
            <p className={`mt-1 text-sm font-semibold ${user?.emailVerified ? 'text-green-600' : 'text-orange-600'}`}>
              {user?.emailVerified ? 'Verified' : 'Not Verified'}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-950 p-4">
            <p className="text-xs font-medium text-gray-400">Two-Factor Auth</p>
            <p className={`mt-1 text-sm font-semibold ${user?.twoFactorEnabled ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
              {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
