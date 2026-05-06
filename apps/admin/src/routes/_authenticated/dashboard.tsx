import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '@/features/auth/use-admin-auth';
import { usePermissions } from '@/shared/hooks/use-permissions';
import {
  Package,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Plus,
  Warehouse,
} from 'lucide-react';
import { httpClient } from '@/shared/api/http-client';
import type { DashboardData } from '@/shared/api/types';

function formatBDT(value: number): string {
  return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function DashboardPage() {
  const { user } = useAdminAuth();
  const perms = usePermissions();
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res = await httpClient.get<DashboardData>('/admin/dashboard');
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch dashboard');
      return res.data;
    },
    retry: 1,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-[100px] animate-pulse sm:h-[120px]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || (!isLoading && !stats)) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load dashboard. Make sure the API is running.</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-blue-600 hover:text-blue-800">Retry</button>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Products',
      value: String(stats?.totalProducts ?? 0),
      icon: Package,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Low Stock',
      value: String(stats?.lowStockCount ?? 0),
      icon: AlertTriangle,
      iconBg: 'bg-orange-50 dark:bg-orange-950/50',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Out of Stock',
      value: String(stats?.outOfStockCount ?? 0),
      icon: XCircle,
      iconBg: 'bg-red-50 dark:bg-red-950/50',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      label: "Today's Sales",
      value: String(stats?.todaySalesCount ?? 0),
      icon: ShoppingCart,
      iconBg: 'bg-green-50 dark:bg-green-950/50',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: "Today's Revenue",
      value: formatBDT(stats?.todayRevenue ?? 0),
      icon: DollarSign,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      confidential: true,
    },
    {
      label: "Today's Profit",
      value: formatBDT(stats?.todayProfit ?? 0),
      icon: TrendingUp,
      iconBg: 'bg-teal-50 dark:bg-teal-950/50',
      iconColor: 'text-teal-600 dark:text-teal-400',
      confidential: true,
    },
    {
      label: 'Total Revenue',
      value: formatBDT(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      iconBg: 'bg-purple-50 dark:bg-purple-950/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      confidential: true,
    },
  ] as const;

  const visibleCards = cards.filter((c) => !('confidential' in c && c.confidential) || (perms.viewRevenue && perms.viewProfit));

  const quickActions = [
    ...(perms.createProduct ? [{
      to: '/products/create',
      label: 'Add Product',
      desc: 'Add new item',
      icon: Plus,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
    }] : []),
    {
      to: '/sales/create',
      label: 'New Sale',
      desc: 'Create a sale',
      icon: ShoppingCart,
      iconBg: 'bg-green-50 dark:bg-green-950/50',
      iconColor: 'text-green-600 dark:text-green-400',
      hoverBorder: 'hover:border-green-300 dark:hover:border-green-700',
    },
    {
      to: '/stock',
      label: 'View Stock',
      desc: 'Check levels',
      icon: Warehouse,
      iconBg: 'bg-purple-50 dark:bg-purple-950/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
    },
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s your shop overview for today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {visibleCards.map((card) => (
          <div key={card.label} className="card p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {card.label}
              </p>
              <div className={`hidden rounded-lg p-1.5 sm:block sm:p-2 ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-gray-900 sm:mt-3 sm:text-2xl dark:text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
          Quick Actions
        </h3>
        <div className={`mt-3 grid gap-3 sm:mt-4 ${quickActions.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-all hover:shadow-sm sm:p-4 dark:border-gray-700 ${action.hoverBorder}`}
            >
              <div className={`shrink-0 rounded-lg p-2 ${action.iconBg}`}>
                <action.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                <p className="hidden text-xs text-gray-500 sm:block dark:text-gray-400">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
