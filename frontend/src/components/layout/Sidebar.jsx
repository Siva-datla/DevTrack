import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Link2,
  Code2,
  History,
  Trophy,
  Target,
  Medal,
  Shield,
  Terminal,
  LogOut,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

export const Sidebar = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Platforms', path: '/platforms', icon: Link2 },
    { name: 'Problems', path: '/problems', icon: Code2 },
    { name: 'Submissions', path: '/submissions', icon: History },
    { name: 'Contests & Rating', path: '/contests', icon: Trophy },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Leaderboard', path: '/leaderboard', icon: Medal },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800/80 transition-all ${
            isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'
          }`}
        >
          <NavLink
            to="/dashboard"
            className={`flex items-center gap-3 group ${isCollapsed ? 'justify-center' : ''}`}
            title="DevTrack"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
              <Terminal className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white truncate block">
                  DevTrack
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
                  Developer Metrics
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse toggle button */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${
                    isCollapsed
                      ? 'justify-center py-3 px-2'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex items-center gap-3 ${
                        isCollapsed ? 'justify-center' : ''
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors flex-shrink-0 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                title={`${user?.name || 'Developer'} (${user?.role || 'USER'})`}
                className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer"
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DV'}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DV'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                    {user?.name || 'Developer'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Developer'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
