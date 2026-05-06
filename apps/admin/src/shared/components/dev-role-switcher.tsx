import { useState } from 'react';
import { Bug, ChevronUp } from 'lucide-react';
import { httpClient } from '@/shared/api/http-client';

const DEV_ACCOUNTS = [
  { email: 'admin@example.com', password: 'Admin@123456', role: 'Super Admin', color: 'bg-purple-500' },
  { email: 'manager@example.com', password: 'Admin@123456', role: 'Admin', color: 'bg-blue-500' },
  { email: 'staff@example.com', password: 'Admin@123456', role: 'Admin', color: 'bg-green-500' },
] as const;

export function DevRoleSwitcher() {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState('');

  if (import.meta.env.PROD) return null;

  async function switchTo(email: string, password: string) {
    setSwitching(email);
    try {
      const res = await httpClient.post<{
        user: { role: string };
        tokens: { accessToken: string };
      }>('/auth/signin', { email, password });

      if (res.success && res.data) {
        httpClient.setToken(res.data.tokens.accessToken);
        window.location.reload();
      }
    } catch {
      // ignore
    }
    setSwitching('');
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] print:hidden">
      {open && (
        <div className="mb-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Switch Account (Dev Only)
          </p>
          <div className="space-y-1.5">
            {DEV_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => switchTo(account.email, account.password)}
                disabled={switching === account.email}
                className="flex w-full items-center gap-2.5 rounded-lg border border-gray-100 p-2 text-left transition-all hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50 dark:border-gray-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
              >
                <div className={`h-2.5 w-2.5 rounded-full ${account.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-gray-900 dark:text-white">
                    {account.role}
                  </p>
                  <p className="truncate text-[10px] text-gray-400">{account.email}</p>
                </div>
                {switching === account.email && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[9px] text-gray-400">
            This panel is hidden in production
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-110 dark:bg-gray-100 dark:text-gray-900"
        title="Dev: Switch Role"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
      </button>
    </div>
  );
}
