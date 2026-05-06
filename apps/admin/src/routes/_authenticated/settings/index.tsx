import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { httpClient } from '@/shared/api/http-client';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import type { ShopSettings } from '@/shared/api/types';

function useShopSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await httpClient.get<ShopSettings>('/admin/settings');
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch settings');
      return res.data;
    },
  });
}

function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Omit<ShopSettings, 'id'>>) => {
      const res = await httpClient.patch<ShopSettings>('/admin/settings', data);
      if (!res.success) throw new Error(res.error ?? 'Failed to update settings');
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function SettingsPage() {
  const { data: settings, isLoading } = useShopSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    shopName: '',
    shopLogo: '',
    currency: '',
    currencySymbol: '',
    lowStockThreshold: '10',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        shopName: settings.shopName,
        shopLogo: settings.shopLogo ?? '',
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        lowStockThreshold: String(settings.lowStockThreshold),
      });
    }
  }, [settings]);

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSettings.mutate(
      {
        shopName: form.shopName,
        shopLogo: form.shopLogo || null,
        currency: form.currency,
        currencySymbol: form.currencySymbol,
        lowStockThreshold: parseInt(form.lowStockThreshold, 10),
      },
      {
        onSuccess: () => toast.success('Settings saved'),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

  if (isLoading) {
    return (
      <div className="w-full space-y-4 sm:space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="card h-96 animate-pulse p-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your shop settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Shop Info */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Shop Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <input id="shopName" value={form.shopName} onChange={(e) => handleChange('shopName', e.target.value)} required className={inputClass} placeholder="My Mobile Shop" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shopLogo">Logo URL</Label>
              <input id="shopLogo" type="url" value={form.shopLogo} onChange={(e) => handleChange('shopLogo', e.target.value)} className={inputClass} placeholder="https://example.com/logo.png" />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Currency</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="currency">Currency Code</Label>
              <input id="currency" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} required className={inputClass} placeholder="BDT" />
            </div>
            <div>
              <Label htmlFor="currencySymbol">Currency Symbol</Label>
              <input id="currencySymbol" value={form.currencySymbol} onChange={(e) => handleChange('currencySymbol', e.target.value)} required className={inputClass} placeholder="৳" />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Inventory</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <input id="lowStockThreshold" type="number" min="1" value={form.lowStockThreshold} onChange={(e) => handleChange('lowStockThreshold', e.target.value)} required className={inputClass} />
              <p className="mt-1 text-xs text-gray-500">Products with stock below this number will be flagged.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={updateSettings.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
