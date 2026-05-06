'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, MapPin, Star } from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', street: '', city: '', state: '', postalCode: '', country: 'BD' });
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    const token = authClient.getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/v1/addresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAddresses(data.data ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAddresses(); }, [fetchAddresses]);

  function openCreate() {
    setEditId(null);
    setForm({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'BD' });
    setShowForm(true);
  }

  function openEdit(addr: Address) {
    setEditId(addr.id);
    setForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, postalCode: addr.postalCode, country: addr.country });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const token = authClient.getToken();
    if (!token) return;

    try {
      const url = editId ? `/api/v1/addresses/${editId}` : '/api/v1/addresses';
      const method = editId ? 'PATCH' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      setShowForm(false);
      void fetchAddresses();
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this address?')) return;
    const token = authClient.getToken();
    if (!token) return;
    await fetch(`/api/v1/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    void fetchAddresses();
  }

  async function setDefault(id: string) {
    const token = authClient.getToken();
    if (!token) return;
    await fetch(`/api/v1/addresses/${id}/default`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    void fetchAddresses();
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Addresses</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your delivery addresses</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add Address
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
          <h3 className="mb-3 font-medium text-gray-900 dark:text-white">{editId ? 'Edit Address' : 'New Address'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Label</label>
              <select value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-800 dark:text-white">
                <option>Home</option>
                <option>Office</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">State / Division</label>
              <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} required className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" placeholder="Dhaka" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Street Address</label>
              <input value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} required className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" placeholder="House 12, Road 5, Dhanmondi" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">City</label>
              <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" placeholder="Dhaka" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Postal Code</label>
              <input value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} required className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" placeholder="1205" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : editId ? 'Update' : 'Save Address'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      <div className="mt-4 space-y-3">
        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 py-12 text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No addresses yet</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="flex items-start justify-between rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/30 px-2 py-0.5 text-[10px] font-medium text-green-700">
                      <Star className="h-3 w-3" /> Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{addr.street}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{addr.city}, {addr.state} {addr.postalCode}</p>
              </div>
              <div className="flex items-center gap-1">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} title="Set as default" className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600">
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => openEdit(addr)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
