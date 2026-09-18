import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Shield, PanelLeft, PanelLeftClose } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onOpenSidebar, isCollapsed, onToggleCollapse }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Dashboard Overview', desc: 'Real-time performance across coding platforms' };
      case '/platforms':
        return { title: 'Connected Platforms', desc: 'Sync and manage LeetCode, Codeforces, HackerRank' };
      case '/problems':
        return { title: 'Problem Explorer', desc: 'Browse and search problems solved across all platforms' };
      case '/submissions':
        return { title: 'Submissions History', desc: 'Complete timeline of code submissions & verdicts' };
      case '/contests':
        return { title: 'Contests & Rating', desc: 'Upcoming contests and combined rating progression' };
      case '/goals':
        return { title: 'Goals & Targets', desc: 'Track streaks, problem counts, and target ratings' };
      case '/leaderboard':
        return { title: 'Global Leaderboard', desc: 'Developer rankings based on solved counts and streaks' };
      case '/settings':
        return { title: 'Account Settings', desc: 'Manage your profile, security credentials, and data exports' };
      case '/admin':
        return { title: 'Admin Console', desc: 'System management, platform health, and user administration' };
      default:
        return { title: 'DevTrack', desc: 'Developer Progress Tracking Platform' };
    }
  };

  const { title, desc } = getPageTitle(location.pathname);

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger button (mobile) / Collapse button (desktop) + Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse / Expand Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            {desc}
          </p>
        </div>
      </div>

      {/* Right side: Controls & User info */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        {isAdmin && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* User avatar indicator (links to /settings) */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <Link
            to="/settings"
            title="Account Settings & Profile"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shadow-sm hover:scale-105 hover:ring-2 hover:ring-indigo-500/40 transition-all cursor-pointer"
          >
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
