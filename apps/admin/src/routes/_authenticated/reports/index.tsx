import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { BarChart3, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { httpClient } from '@/shared/api/http-client';
import type { ReportSummary, BestSeller } from '@/shared/api/types';

type Tab = 'summary' | 'best-sellers' | 'low-stock' | 'profit';
type Period = 'today' | 'week' | 'month';

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function useReportSummary(period: Period) {
  return useQuery({
    queryKey: ['reports', 'summary', period],
    queryFn: async () => {
      const res = await httpClient.get<ReportSummary>(`/admin/reports/summary?period=${period}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch report summary');
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

function useBestSellers(period: Period) {
  return useQuery({
    queryKey: ['reports', 'best-sellers', period],
    queryFn: async () => {
      const res = await httpClient.get<BestSeller[]>(`/admin/reports/best-sellers?period=${period}&limit=10`);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch best sellers');
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string | null;
  stockQuantity: number;
  brand: { name: string };
  category: { name: string };
}

function useLowStockProducts() {
  return useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: async () => {
      const res = await httpClient.get<LowStockProduct[]>('/admin/reports/low-stock');
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch low stock products');
      return res.data;
    },
  });
}

function useProfitReport(period: Period) {
  return useQuery({
    queryKey: ['reports', 'profit', period],
    queryFn: async () => {
      const res = await httpClient.get<Array<{ productId: string; productName: string; brand: string; totalRevenue: number; totalCost: number; totalProfit: number; unitsSold: number }>>(
        `/admin/reports/profit?period=${period}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch profit report');
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

const tabs: Array<{ id: Tab; label: string; icon: typeof BarChart3 }> = [
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'best-sellers', label: 'Best Sellers', icon: TrendingUp },
  { id: 'low-stock', label: 'Low Stock', icon: AlertTriangle },
  { id: 'profit', label: 'Profit', icon: DollarSign },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [period, setPeriod] = useState<Period>('month');

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Business analytics and insights
        </p>
      </div>

      {/* Tabs */}
      <div className="card p-1">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'summary' && <SummaryTab period={period} onPeriodChange={setPeriod} />}
      {activeTab === 'best-sellers' && <BestSellersTab period={period} onPeriodChange={setPeriod} />}
      {activeTab === 'low-stock' && <LowStockTab />}
      {activeTab === 'profit' && <ProfitTab period={period} onPeriodChange={setPeriod} />}
    </div>
  );
}

function PeriodSelector({ value, onChange }: { readonly value: Period; readonly onChange: (p: Period) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
      {(['today', 'week', 'month'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value === p
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
        </button>
      ))}
    </div>
  );
}

function SummaryTab({ period, onPeriodChange }: { readonly period: Period; readonly onPeriodChange: (p: Period) => void }) {
  const { data, isLoading } = useReportSummary(period);

  const cards = [
    { label: 'Total Sales', value: data?.totalSales ?? 0, format: false },
    { label: 'Total Revenue', value: data?.totalRevenue ?? 0, format: true },
    { label: 'Total Profit', value: data?.totalProfit ?? 0, format: true },
    { label: 'Avg. Order Value', value: data?.averageOrderValue ?? 0, format: true },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex justify-end">
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-[100px] animate-pulse p-6" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="card p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {card.format ? formatBDT(card.value) : card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BestSellersTab({ period, onPeriodChange }: { readonly period: Period; readonly onPeriodChange: (p: Period) => void }) {
  const { data, isLoading } = useBestSellers(period);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex justify-end">
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Units Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td></tr>
              ))
            ) : !data?.length ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No data for this period</td></tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.productName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.brand}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.totalSold}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatBDT(item.totalRevenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LowStockTab() {
  const { data, isLoading } = useLowStockProducts();

  return (
    <div className="card overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Brand</th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td></tr>
            ))
          ) : !data?.length ? (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">All products are well stocked!</td></tr>
          ) : (
            data.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                  {product.sku && <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {product.category.name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.brand.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <span className={`text-lg font-bold ${product.stockQuantity === 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    product.stockQuantity === 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {product.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProfitTab({ period, onPeriodChange }: { readonly period: Period; readonly onPeriodChange: (p: Period) => void }) {
  const { data, isLoading } = useProfitReport(period);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex justify-end">
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Units</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td></tr>
              ))
            ) : !data?.length ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No profit data for this period</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.productName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.brand}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{item.unitsSold}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{formatBDT(item.totalRevenue)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{formatBDT(item.totalCost)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">{formatBDT(item.totalProfit)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
