import React, { useState, useEffect, useCallback } from 'react';
import leaderboardApi from '../api/leaderboard';
import { PlatformIcon } from '../components/common/PlatformIcon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Trophy,
  Medal,
  Flame,
  Code2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Crown,
  Award,
  Shield,
  Layers,
} from 'lucide-react';

const sortOptions = [
  { key: 'solved', label: 'Problems Solved', icon: Code2 },
  { key: 'streak', label: 'Active Streak', icon: Flame },
  { key: 'rating', label: 'Peak Rating', icon: Trophy },
];

const platformOptions = [
  { key: 'ALL', label: 'All Platforms' },
  { key: 'LEETCODE', label: 'LeetCode' },
  { key: 'CODEFORCES', label: 'Codeforces' },
  { key: 'HACKERRANK', label: 'HackerRank' },
];

export const LeaderboardPage = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('solved');
  const [platform, setPlatform] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const fetchLeaderboard = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const res = await leaderboardApi.getLeaderboard({
          sortBy,
          platform,
          page: pageToLoad,
          limit: 20,
        });

        if (res.success) {
          setLeaderboard(res.data || []);
          setPagination(res.pagination || { page: pageToLoad, limit: 20, total: 0, pages: 1 });
        }
      } catch (err) {
        console.error('[LeaderboardPage] Error fetching rankings:', err);
        toast.error('Failed to load leaderboard rankings.');
      } finally {
        setLoading(false);
      }
    },
    [sortBy, platform, toast]
  );

  useEffect(() => {
    fetchLeaderboard(1);
  }, [fetchLeaderboard]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchLeaderboard(newPage);
  };

  // Top 3 for Podium
  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Community Rankings</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Developer Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global developer rankings based on verified problem solutions, streaks, and ratings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLeaderboard(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sorting & Filter Controls */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Sort By Toggle */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Rank By Metric:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {sortOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = sortBy === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSortBy(opt.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Filter Toggle */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Platform Filter:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {platformOptions.map((p) => {
                const isSelected = platform === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPlatform(p.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length >= 3 && pagination.page === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Silver (Left) */}
          <div className="order-2 md:order-1 bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300 flex items-center justify-center font-black text-xl mb-3 border border-slate-200 dark:border-slate-700">
              🥈 2
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {topThree[1]?.name || 'Developer'}
              </h4>
              <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                {topThree[1]?.platforms?.map((p) => (
                  <PlatformIcon key={p.platform} platform={p.platform} className="w-3.5 h-3.5" />
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 w-full">
              <span className="text-xl font-black text-slate-800 dark:text-slate-200">
                {sortBy === 'solved' && `${topThree[1]?.totalSolved} Solved`}
                {sortBy === 'streak' && `${topThree[1]?.currentStreak} Days`}
                {sortBy === 'rating' && (topThree[1]?.peakRating ? `${topThree[1]?.peakRating} Rating` : 'Unrated')}
              </span>
            </div>
          </div>

          {/* #1 Gold (Center) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 to-transparent dark:bg-[#0f172a]/90 border-2 border-amber-500/40 rounded-3xl p-6 shadow-md flex flex-col justify-between items-center text-center relative overflow-hidden transform md:-translate-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-2xl mb-3 border border-amber-200 dark:border-amber-800/60 shadow-sm">
              👑 1
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[11px] font-bold mb-1 border border-amber-200 dark:border-amber-800/60">
                <Crown className="w-3 h-3" />
                <span>Champion</span>
              </div>
              <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {topThree[0]?.name || 'Developer'}
              </h4>
              <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                {topThree[0]?.platforms?.map((p) => (
                  <PlatformIcon key={p.platform} platform={p.platform} className="w-4 h-4" />
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 w-full">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {sortBy === 'solved' && `${topThree[0]?.totalSolved} Solved`}
                {sortBy === 'streak' && `${topThree[0]?.currentStreak} Days`}
                {sortBy === 'rating' && (topThree[0]?.peakRating ? `${topThree[0]?.peakRating} Rating` : 'Unrated')}
              </span>
            </div>
          </div>

          {/* #3 Bronze (Right) */}
          <div className="order-3 bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-900/10 text-amber-800 dark:text-amber-500 flex items-center justify-center font-black text-xl mb-3 border border-amber-800/20">
              🥉 3
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {topThree[2]?.name || 'Developer'}
              </h4>
              <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                {topThree[2]?.platforms?.map((p) => (
                  <PlatformIcon key={p.platform} platform={p.platform} className="w-3.5 h-3.5" />
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 w-full">
              <span className="text-xl font-black text-slate-800 dark:text-slate-200">
                {sortBy === 'solved' && `${topThree[2]?.totalSolved} Solved`}
                {sortBy === 'streak' && `${topThree[2]?.currentStreak} Days`}
                {sortBy === 'rating' && (topThree[2]?.peakRating ? `${topThree[2]?.peakRating} Rating` : 'Unrated')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <tr>
                <th className="py-3.5 px-4 font-semibold w-16 text-center">Rank</th>
                <th className="py-3.5 px-4 font-semibold">Developer</th>
                <th className="py-3.5 px-4 font-semibold">Platforms</th>
                <th className="py-3.5 px-4 font-semibold text-center">Solved Problems</th>
                <th className="py-3.5 px-4 font-semibold text-center">Current Streak</th>
                <th className="py-3.5 px-4 font-semibold text-center">Peak Rating</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36 mb-1" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Medal className="w-8 h-8 opacity-40" />
                      <p className="font-semibold text-sm">No rankings available</p>
                      <p className="text-xs">Users with synced submissions will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isCurrent = currentUser?._id === entry.userId;
                  const rank = entry.rank;

                  return (
                    <tr
                      key={entry.userId}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Rank Position */}
                      <td className="py-3.5 px-4 text-center font-mono font-extrabold text-sm">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                            🥇
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            🥈
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-900/10 text-amber-800 dark:text-amber-500">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-400">#{rank}</span>
                        )}
                      </td>

                      {/* Developer Name & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {entry.name}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                              You
                            </span>
                          )}
                          {entry.role === 'ADMIN' && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              <Shield className="w-2.5 h-2.5" />
                              Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Platforms */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {entry.platforms?.length > 0 ? (
                            entry.platforms.map((p) => (
                              <div
                                key={p.platform}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-[11px]"
                                title={`${p.platform}: @${p.username}`}
                              >
                                <PlatformIcon platform={p.platform} className="w-3 h-3" />
                                <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                                  {p.username}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">No accounts</span>
                          )}
                        </div>
                      </td>

                      {/* Solved Problems */}
                      <td className="py-3.5 px-4 text-center font-bold text-sm text-slate-900 dark:text-white font-mono">
                        {entry.totalSolved?.toLocaleString() || 0}
                      </td>

                      {/* Current Streak */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-sm text-amber-600 dark:text-amber-400 font-mono">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{entry.currentStreak || 0}d</span>
                        </div>
                      </td>

                      {/* Peak Rating */}
                      <td className="py-3.5 px-4 text-center font-bold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                        {entry.peakRating ? Math.round(entry.peakRating) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{leaderboard.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{pagination.total}</strong> ranked developers
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="font-semibold text-slate-700 dark:text-slate-300 px-1">
              Page {pagination.page} of {pagination.pages || 1}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.pages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
