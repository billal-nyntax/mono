import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Warehouse, ShoppingCart, ClipboardList, CreditCard, BarChart3, ShieldCheck, Settings, Tags, Ticket, LogOut, Sun, Moon, Monitor, Menu, X } from 'lucide-react';
import { useAdminAuth } from '@/features/auth/use-admin-auth';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { useTheme } from '@/shared/hooks/use-theme';

type NavItem = {
  readonly path: string;
  readonly label: string;
  readonly icon: typeof LayoutDashboard;
  readonly superAdminOnly?: boolean;
};

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Catalog', icon: Tags, superAdminOnly: true },
  { path: '/stock', label: 'Stock', icon: Warehouse },
  { path: '/sales', label: 'Sales', icon: ShoppingCart },
  { path: '/orders', label: 'Orders', icon: ClipboardList },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/coupons', label: 'Coupons', icon: Ticket, superAdminOnly: true },
  { path: '/reports', label: 'Reports', icon: BarChart3, superAdminOnly: true },
  { path: '/users', label: 'Users', icon: Users, superAdminOnly: true },
  { path: '/permissions', label: 'Permissions', icon: ShieldCheck, superAdminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings, superAdminOnly: true },
];

export function AdminLayout() {
  const { user, signOut } = useAdminAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const perms = usePermissions();

  const visibleNavItems = navItems.filter(
    (item) => !item.superAdminOnly || perms.manageSettings,
  );

  const pageTitle = navItems.find((item) =>
    location.pathname.startsWith(item.path),
  )?.label ?? 'Admin';

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">TechHub</span>
        </div>
        <button onClick={closeSidebar} className="rounded-md p-1 text-gray-400 hover:text-gray-600 lg:hidden dark:hover:text-gray-300">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Menu
        </p>
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/50 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {user?.name}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — desktop: fixed, mobile: slide-out drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 lg:z-30 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="flex h-screen w-full flex-col lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-sm sm:h-16 sm:px-8 dark:border-gray-800 dark:bg-gray-950/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
              <button
                onClick={() => setTheme('light')}
                title="Light mode"
                className={`rounded-md p-1 transition-colors sm:p-1.5 ${
                  theme === 'light'
                    ? 'bg-gray-100 text-yellow-600 dark:bg-gray-700'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark mode"
                className={`rounded-md p-1 transition-colors sm:p-1.5 ${
                  theme === 'dark'
                    ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                title="System preference"
                className={`rounded-md p-1 transition-colors sm:p-1.5 ${
                  theme === 'system'
                    ? 'bg-gray-100 text-purple-600 dark:bg-gray-700 dark:text-purple-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
            {/* Mobile avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-medium text-white lg:hidden">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          <div className="flex h-full w-full flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
