import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, Lock, Mail } from 'lucide-react';
import { useAdminAuth } from '@/features/auth/use-admin-auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        navigate('/dashboard');
        return;
      }
      setError(result.error);
      setPassword('');
      setShowPassword(false);
    } catch {
      setError('Cannot connect to server. Make sure the API is running.');
    }
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0b1120]">
      {/* Left panel — visual branding */}
      <div className="relative hidden w-[55%] overflow-hidden lg:block">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        {/* Glow orbs */}
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute -right-20 bottom-1/3 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-xl font-semibold text-white/90">TechHub BD</span>
          </div>

          {/* Hero text */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight text-white">
              Your shop,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                simplified.
              </span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-300/80">
              Track inventory, record sales, and understand your business — all from one clean dashboard.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {['Inventory', 'Sales', 'Reports', 'Analytics'].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300/70 backdrop-blur-sm"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-slate-500">
            &copy; 2026 TechHub BD. Inventory Management System.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-[45%]">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">TechHub BD</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-[15px] text-gray-500 dark:text-gray-400">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                  <span className="text-xs">!</span>
                </div>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-700/30 focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none dark:shadow-blue-900/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
            Secure admin area &middot; All activity is monitored
          </p>
        </div>
      </div>
    </div>
  );
}
