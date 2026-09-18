import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LogOut, CheckCircle2, Shield, User, Sparkles, Terminal } from 'lucide-react';

export const DashboardPlaceholder = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg">DevTrack</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                Phase 1 Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/10 relative overflow-hidden mb-8">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-indigo-100 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Session Active & Authenticated</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {user?.name || 'Developer'}!
              </h2>
              <p className="text-indigo-100/80 text-sm mt-1 max-w-xl">
                Phase 1 is now running: Project scaffolding, dark/light theme switching, JWT authentication, and protected routing are fully operational.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-right">
                <div className="text-indigo-200">Current Theme</div>
                <div className="font-bold text-white uppercase tracking-wider">{theme} mode</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Details & Phase Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">{user?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">User ID</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{user?.id || user?._id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Role</span>
                <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  <Shield className="w-3 h-3" />
                  {user?.role || 'USER'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Admin Privileges</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{isAdmin ? 'Enabled' : 'Standard'}</span>
              </div>
            </div>
          </div>

          {/* Verification Checklist Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Phase 1 Deliverables Verified</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-800 dark:text-slate-200">✅ Scaffolding & Tooling</div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Vite + React (JS) + Tailwind CSS + Lucide Icons</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-800 dark:text-slate-200">✅ Dark/Light Mode Switcher</div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Class-based toggle persisted in localStorage</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-800 dark:text-slate-200">✅ JWT Auth & Token Refresh</div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Axios interceptors with auto token rotation</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-800 dark:text-slate-200">✅ Route Guards & Redirects</div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Protected `/dashboard` & Guest `/login`, `/register`</p>
              </div>
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
              <span className="font-semibold">Next Up (Phase 2):</span> App Shell Layout (Collapsible Sidebar, Navigation) & Core Dashboard with 365-Day Activity Heatmap and Difficulty Breakdown Donut.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPlaceholder;
