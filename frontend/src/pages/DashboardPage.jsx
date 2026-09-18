import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import dashboardApi from '../api/dashboard';
import submissionsApi from '../api/submissions';
import StatCard from '../components/dashboard/StatCard';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import DifficultyCard from '../components/dashboard/DifficultyCard';
import PlatformSnapshots from '../components/dashboard/PlatformSnapshots';
import RecentSubmissions from '../components/dashboard/RecentSubmissions';
import {
  Code2,
  Flame,
  Trophy,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [subStats, setSubStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [statsRes, heatmapRes, subsRes, subStatsRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getHeatmap(),
        submissionsApi.getSubmissions({ limit: 6 }),
        submissionsApi.getSubmissionsStats(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }
      if (heatmapRes.status === 'fulfilled' && heatmapRes.value?.success) {
        setHeatmap(heatmapRes.value.data);
      }
      if (subsRes.status === 'fulfilled' && subsRes.value?.success) {
        setSubmissions(subsRes.value.data);
      }
      if (subStatsRes.status === 'fulfilled' && subStatsRes.value?.success) {
        setSubStats(subStatsRes.value.data);
      }

      if (isSilent) {
        toast.success('Dashboard metrics updated!');
      }
    } catch (err) {
      console.error('[DashboardPage] Error fetching dashboard data:', err);
      setError('Failed to load some dashboard metrics. Please refresh.');
      if (isSilent) {
        toast.error('Failed to update metrics. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute overall acceptance rate
  const totalSubs = subStats?.totalSubmissions || 0;
  const acceptedSubs = subStats?.acceptedSubmissions || 0;
  const acceptanceRate = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Developer Overview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'Developer'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your consolidated problem solving progress across all linked coding platforms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>

          <Link
            to="/platforms"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
          >
            <span>Sync Accounts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Unique Solved"
          value={loading ? '...' : stats?.totalSolved ?? 0}
          subtext="Unique problems solved across platforms"
          icon={Code2}
          color="indigo"
          badge="Verified"
        />

        <StatCard
          title="Current Streak"
          value={loading ? '...' : `${stats?.currentStreak ?? 0} Days`}
          subtext="Consecutive days with accepted solves"
          icon={Flame}
          color="amber"
          badge={stats?.currentStreak > 0 ? 'Active 🔥' : 'Start Today'}
        />

        <StatCard
          title="Longest Streak"
          value={loading ? '...' : `${stats?.longestStreak ?? 0} Days`}
          subtext="All-time personal record"
          icon={Trophy}
          color="emerald"
          badge="Best Streak"
        />

        <StatCard
          title="Acceptance Rate"
          value={loading ? '...' : `${acceptanceRate}%`}
          subtext={`${acceptedSubs} accepted / ${totalSubs} attempts`}
          icon={CheckCircle2}
          color="violet"
          badge={`${totalSubs} Total`}
        />
      </div>

      {/* 365-Day Activity Heatmap */}
      <ActivityHeatmap
        data={heatmap}
        currentStreak={stats?.currentStreak || 0}
        longestStreak={stats?.longestStreak || 0}
      />

      {/* Two Column Section: Platforms & Activity vs Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Connected Platforms + Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <PlatformSnapshots platforms={stats?.platforms || []} />
          <RecentSubmissions submissions={submissions} />
        </div>

        {/* Right 1 column: Difficulty Breakdown + Quick Navigation */}
        <div className="space-y-6">
          <DifficultyCard
            difficulty={stats?.difficulty || {}}
            totalSolved={stats?.totalSolved || 0}
          />

          {/* Quick Target / Goals teaser card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <h4 className="text-sm font-bold tracking-tight mb-2">Set Your Next Milestone</h4>
            <p className="text-xs text-indigo-200/80 mb-4 leading-relaxed">
              Track custom goals for daily streaks, problem volumes, or target contest ratings.
            </p>
            <Link
              to="/goals"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Explore Goals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
