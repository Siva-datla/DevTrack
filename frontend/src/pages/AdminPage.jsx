import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PlatformIcon } from '../components/common/PlatformIcon';
import {
  Shield,
  Users,
  Database,
  History,
  Code2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'logs'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Tab State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  // Logs Tab State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Check admin authorization
  const isAdmin = user?.role === 'ADMIN';

  // Fetch System Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await adminApi.getAdminStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('[AdminPage] Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(
    async (pageToLoad = 1) => {
      setLoadingUsers(true);
      try {
        const params = {
          page: pageToLoad,
          limit: 15,
        };
        if (userSearch.trim()) params.search = userSearch.trim();

        const res = await adminApi.getUsers(params);
        if (res.success) {
          setUsers(res.data || []);
          setUserPagination(res.pagination || { page: pageToLoad, limit: 15, total: 0, pages: 1 });
        }
      } catch (err) {
        console.error('[AdminPage] Error fetching users:', err);
        toast.error('Failed to load user records.');
      } finally {
        setLoadingUsers(false);
      }
    },
    [userSearch, toast]
  );

  // Fetch Sync Logs
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await adminApi.getSyncLogs({ limit: 30 });
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error('[AdminPage] Error loading logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchUsers(1);
      fetchLogs();
    }
  }, [isAdmin, fetchStats, fetchUsers, fetchLogs]);

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUpdatingRoleId(targetUser._id);
    try {
      const res = await adminApi.updateUserStatus(targetUser._id, { role: newRole });
      if (res.success) {
        toast.success(`Updated ${targetUser.name}'s role to ${newRole}.`);
        fetchUsers(userPagination.page);
      } else {
        toast.error(res.error?.message || 'Failed to update role.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error updating user role.');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Unauthorized Screen
  if (!isAdmin) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/50 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The Admin Control Center requires administrative privileges. Please log in with an authorized administrator account.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Administrator Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            System health monitoring, developer account management, and platform synchronization logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStats();
            if (activeTab === 'users') fetchUsers(userPagination.page);
            if (activeTab === 'logs') fetchLogs();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All</span>
        </button>
      </div>

      {/* System Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Users</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {loadingStats ? '—' : stats?.totalUsers?.toLocaleString() || 0}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Registered developer profiles</p>
        </div>

        {/* Linked Platform Accounts */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Linked Accounts</p>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {loadingStats ? '—' : stats?.totalPlatformAccounts?.toLocaleString() || 0}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Across LC, CF & HackerRank</p>
        </div>

        {/* Submissions Logged */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Submissions Logged</p>
              <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {loadingStats ? '—' : stats?.totalSubmissions?.toLocaleString() || 0}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <History className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Aggregated submission timeline</p>
        </div>

        {/* Canonical Problems */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Problems Indexed</p>
              <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {loadingStats ? '—' : stats?.totalProblems?.toLocaleString() || 0}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cross-platform problem catalogue</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          User Management ({userPagination.total})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Platform Sync Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email address..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">User</th>
                    <th className="py-3.5 px-4 font-semibold">Role</th>
                    <th className="py-3.5 px-4 font-semibold">Connected Platforms</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Submissions</th>
                    <th className="py-3.5 px-4 font-semibold">Joined At</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loadingUsers ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36 mb-1" />
                          <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-48" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 mx-auto" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No users match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isSelf = u._id === user?._id;
                      return (
                        <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Name & Email */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {u.email}
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                u.role === 'ADMIN'
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <Shield className="w-3 h-3" />
                              {u.role}
                            </span>
                          </td>

                          {/* Platforms */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {u.platforms?.length > 0 ? (
                                u.platforms.map((p) => (
                                  <div
                                    key={p.platform}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] border border-slate-200/60 dark:border-slate-700/60"
                                  >
                                    <PlatformIcon platform={p.platform} className="w-3 h-3" />
                                    <span className="font-mono text-slate-600 dark:text-slate-300">
                                      @{p.username}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-slate-400 text-[11px]">None linked</span>
                              )}
                            </div>
                          </td>

                          {/* Submissions */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                            {u.submissionCount?.toLocaleString() || 0}
                          </td>

                          {/* Join Date */}
                          <td className="py-3.5 px-4 text-slate-400 text-xs">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            {isSelf ? (
                              <span className="text-[11px] text-slate-400 italic">Your Account</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRoleToggle(u)}
                                disabled={updatingRoleId === u._id}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                  u.role === 'ADMIN'
                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/40'
                                    : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
                                }`}
                              >
                                {updatingRoleId === u._id
                                  ? 'Updating...'
                                  : u.role === 'ADMIN'
                                  ? 'Revoke Admin'
                                  : 'Make Admin'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Page {userPagination.page} of {userPagination.pages || 1} ({userPagination.total} users)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={userPagination.page <= 1 || loadingUsers}
                  onClick={() => fetchUsers(userPagination.page - 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={userPagination.page >= userPagination.pages || loadingUsers}
                  onClick={() => fetchUsers(userPagination.page + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sync Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Recent Synchronization Executions
            </h4>
            <span className="text-xs text-slate-400">Showing last {logs.length} sync logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Platform</th>
                  <th className="py-3 px-4 font-semibold">Handle</th>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Last Synced</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loadingLogs ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No synchronization events recorded.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={log._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            log.syncStatus === 'SUCCESS'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                              : log.syncStatus === 'SYNCING'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                          }`}
                        >
                          {log.syncStatus === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                          {log.syncStatus === 'SYNCING' && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {log.syncStatus === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                          {log.syncStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <PlatformIcon platform={log.platform} className="w-3.5 h-3.5" />
                          <span>{log.platform}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        @{log.username}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {log.user?.name || log.userId || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {log.lastSyncedAt ? new Date(log.lastSyncedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
