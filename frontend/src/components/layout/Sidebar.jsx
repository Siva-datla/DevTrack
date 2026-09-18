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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container: smoothly animates width only */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800/80 flex flex-col will-change-[width] transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 overflow-hidden">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 group min-w-0"
            title="DevTrack"
          >
            {/* Logo Icon (always fixed at 36px) */}
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
              <Terminal className="w-5 h-5" />
            </div>

            {/* Title Text (smooth slide + fade) */}
            <div
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCollapsed
                  ? 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
                  : 'max-w-[140px] opacity-100 translate-x-0'
              }`}
            >
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block truncate">
                DevTrack
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
                Developer Metrics
              </span>
            </div>
          </NavLink>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className={`hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 flex-shrink-0 ${
              isCollapsed ? 'opacity-0 pointer-events-none w-0 p-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center h-11 px-2.5 rounded-xl text-sm font-medium transition-colors duration-150 relative overflow-hidden ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Fixed Icon Container (always 24px wide, centered in rail) */}
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                    </div>

                    {/* Text Label (smooth width + opacity transition) */}
                    <span
                      className={`ml-2 overflow-hidden whitespace-nowrap text-xs font-semibold tracking-tight transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isCollapsed
                          ? 'max-w-0 opacity-0 -translate-x-2'
                          : 'max-w-[140px] opacity-100 translate-x-0'
                      }`}
                    >
                      {item.name}
                    </span>

                    {/* Active Chevron */}
                    <div
                      className={`ml-auto overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isCollapsed || !isActive
                          ? 'max-w-0 opacity-0'
                          : 'max-w-[20px] opacity-60'
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden">
          <div className="flex items-center h-12 px-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
            {/* User Avatar (fixed 32px slot) */}
            <div
              title={`${user?.name || 'Developer'} (${user?.role || 'USER'})`}
              className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0 cursor-pointer"
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DV'}
            </div>

            {/* User Details (smooth collapse) */}
            <div
              className={`ml-2.5 min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCollapsed
                  ? 'max-w-0 opacity-0 -translate-x-2'
                  : 'max-w-[110px] opacity-100 translate-x-0'
              }`}
            >
              <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                {user?.name || 'Developer'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Developer'}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all duration-200 flex-shrink-0 ${
                isCollapsed
                  ? 'opacity-0 max-w-0 p-0 overflow-hidden pointer-events-none'
                  : 'opacity-100 max-w-[32px]'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
