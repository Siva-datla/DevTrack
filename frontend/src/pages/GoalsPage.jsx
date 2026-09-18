import React, { useState, useEffect, useCallback } from 'react';
import goalsApi from '../api/goals';
import CreateGoalModal from '../components/goals/CreateGoalModal';
import { useToast } from '../context/ToastContext';
import {
  Target,
  Plus,
  Flame,
  Trophy,
  Code2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { PlatformIcon } from '../components/common/PlatformIcon';

const statusFilters = [
  { key: '', label: 'All Goals' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'FAILED', label: 'Expired' },
];

const typeIcons = {
  SOLVE_PROBLEMS: Code2,
  STREAK: Flame,
  RATING_TARGET: Trophy,
};

export const GoalsPage = () => {
  const toast = useToast();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchGoals = useCallback(async (filterStatus = '', showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const res = await goalsApi.getGoals(params);
      if (res.success) {
        setGoals(res.data || []);
      }
    } catch (err) {
      console.error('[GoalsPage] Error loading goals:', err);
      toast.error('Failed to load goals.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGoals(statusFilter, true);
  }, [fetchGoals, statusFilter]);

  const handleDeleteGoal = async (id, title) => {
    setDeletingId(id);
    try {
      const res = await goalsApi.deleteGoal(id);
      if (res.success) {
        toast.success(`Goal "${title}" deleted.`);
        // Optimistically remove immediately from local state
        setGoals((prev) => prev.filter((g) => g._id !== id));
      } else {
        toast.error(res.error?.message || 'Failed to delete goal.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error deleting goal.');
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics summary and platform filtering
  const filteredGoals = goals.filter((g) => {
    if (!platformFilter) return true;
    return (g.platform || 'ALL') === platformFilter;
  });

  const totalGoals = filteredGoals.length;
  const completedCount = filteredGoals.filter((g) => g.status === 'COMPLETED').length;
  const activeCount = filteredGoals.filter((g) => g.status === 'IN_PROGRESS').length;
  const failedCount = filteredGoals.filter((g) => g.status === 'FAILED').length;

  const getDaysRemaining = (deadline) => {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Ends today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Target Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Goals & Milestones
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set and track custom problem-solving volumes, daily streaks, and rating milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchGoals(statusFilter)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
            title="Refresh Goals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Goals */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress</p>
              <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {activeCount}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Active targets being tracked</p>
        </div>

        {/* Completed Goals */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</p>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {completedCount}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Milestones reached on time</p>
        </div>

        {/* Expired / Failed */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Expired / Overdue</p>
              <h4 className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                {failedCount}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Missed target deadline</p>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {statusFilters.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Platform Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {[
              { key: '', label: 'All Platforms' },
              { key: 'LEETCODE', label: 'LeetCode' },
              { key: 'CODEFORCES', label: 'Codeforces' },
              { key: 'HACKERRANK', label: 'HackerRank' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPlatformFilter(p.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  platformFilter === p.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {p.key && <PlatformIcon platform={p.key} className="w-3 h-3" />}
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong>{filteredGoals.length}</strong> goals
        </span>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-28" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/50">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Goals Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5">
            {statusFilter || platformFilter
              ? 'No goals match the selected filter criteria.'
              : 'Set a target for problem volume, contest rating, or daily consistency to stay accountable.'}
          </p>
          {!statusFilter && !platformFilter && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Goal</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const Icon = typeIcons[goal.type] || Target;
            const progressPct = Math.min(
              100,
              Math.max(0, Math.round(((goal.currentValue || 0) / (goal.target || 1)) * 100))
            );

            const isCompleted = goal.status === 'COMPLETED';
            const isFailed = goal.status === 'FAILED';

            return (
              <div
                key={goal._id}
                className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Type & Platform Badge & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {goal.type.replace('_', ' ')}
                          </span>
                          {goal.platform && goal.platform !== 'ALL' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <PlatformIcon platform={goal.platform} className="w-3 h-3" />
                              <span className="capitalize">{goal.platform.toLowerCase()}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                              <span>All Platforms</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                          : isFailed
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                          : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60'
                      }`}
                    >
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Goal Title */}
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {goal.title}
                  </h4>

                  {/* Progress Bar & Numeric Readout */}
                  <div className="my-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Progress:{' '}
                        <strong className="text-slate-900 dark:text-white font-mono">
                          {(goal.currentValue || 0).toLocaleString()}
                        </strong>{' '}
                        / {goal.target.toLocaleString()}{' '}
                        <span className="text-slate-400 text-[11px]">
                          {goal.type === 'SOLVE_PROBLEMS'
                            ? 'solved'
                            : goal.type === 'STREAK'
                            ? 'days'
                            : 'pts'}
                        </span>
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {progressPct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isFailed
                            ? 'bg-rose-500'
                            : 'bg-indigo-600 dark:bg-indigo-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Info & Delete Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{getDaysRemaining(goal.deadline)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal._id, goal.title)}
                    disabled={deletingId === goal._id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => fetchGoals(statusFilter, false)}
      />
    </div>
  );
};

export default GoalsPage;
