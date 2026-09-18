import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Flame,
  Trophy,
  Code2,
  Calendar,
  AlertCircle,
  Loader2,
  Layers,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import goalsApi from '../../api/goals';
import platformsApi from '../../api/platforms';
import { useToast } from '../../context/ToastContext';
import { PlatformIcon } from '../common/PlatformIcon';

const goalTypes = [
  {
    type: 'SOLVE_PROBLEMS',
    label: 'Problems Solved',
    description: 'Total accepted problems solved',
    icon: Code2,
    placeholder: 'e.g., 1500',
    unit: 'problems',
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60',
  },
  {
    type: 'STREAK',
    label: 'Daily Streak',
    description: 'Consecutive active coding days',
    icon: Flame,
    placeholder: 'e.g., 30',
    unit: 'days',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
  },
  {
    type: 'RATING_TARGET',
    label: 'Peak Rating',
    description: 'Contest rating milestone',
    icon: Trophy,
    placeholder: 'e.g., 1600',
    unit: 'rating pts',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
  },
];

const platformOptions = [
  { value: 'ALL', label: 'All Platforms', isAll: true },
  { value: 'LEETCODE', label: 'LeetCode', isAll: false },
  { value: 'CODEFORCES', label: 'Codeforces', isAll: false },
  { value: 'HACKERRANK', label: 'HackerRank', isAll: false },
];

export const CreateGoalModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('SOLVE_PROBLEMS');
  const [platform, setPlatform] = useState('ALL');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [platforms, setPlatforms] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  // Load platform accounts when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoadingPlatforms(true);
    platformsApi
      .getPlatforms()
      .then((res) => {
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setPlatforms(res.data);
        }
      })
      .catch((err) => {
        console.warn('[CreateGoalModal] Error loading platform accounts:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingPlatforms(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTypeMeta = goalTypes.find((t) => t.type === type) || goalTypes[0];

  // Calculate current baseline based on type and selected platform
  const getBaseline = () => {
    if (type === 'SOLVE_PROBLEMS') {
      if (platform === 'ALL') {
        const total = platforms.reduce((sum, p) => sum + (p.totalSolved || 0), 0);
        const breakdown = platforms
          .filter((p) => (p.totalSolved || 0) > 0)
          .map(
            (p) =>
              `${
                p.platform === 'LEETCODE'
                  ? 'LeetCode'
                  : p.platform === 'CODEFORCES'
                  ? 'Codeforces'
                  : 'HackerRank'
              }: ${p.totalSolved.toLocaleString()}`
          );
        return {
          numeric: total,
          highlight: `${total.toLocaleString()} solved total`,
          breakdown: breakdown.length > 0 ? breakdown.join(' • ') : 'No solved problems recorded yet across platforms.',
        };
      } else {
        const acc = platforms.find((p) => p.platform === platform);
        const solved = acc?.totalSolved || 0;
        const name =
          platform === 'LEETCODE'
            ? 'LeetCode'
            : platform === 'CODEFORCES'
            ? 'Codeforces'
            : 'HackerRank';
        return {
          numeric: solved,
          highlight: `${solved.toLocaleString()} solved on ${name}`,
          breakdown: acc?.username
            ? `Linked account: @${acc.username}`
            : `No ${name} account connected yet.`,
        };
      }
    } else if (type === 'RATING_TARGET') {
      if (platform === 'ALL') {
        const ratings = platforms
          .filter((p) => typeof p.rating === 'number' && p.rating > 0)
          .map((p) => ({ rating: p.rating, platform: p.platform }));
        const maxRating = ratings.length > 0 ? Math.max(...ratings.map((r) => r.rating)) : 0;
        const best = ratings.find((r) => r.rating === maxRating);
        return {
          numeric: maxRating,
          highlight: maxRating > 0 ? `Peak Rating: ${maxRating}` : 'No rating recorded yet',
          breakdown: best
            ? `Best rating on ${
                best.platform === 'LEETCODE'
                  ? 'LeetCode'
                  : best.platform === 'CODEFORCES'
                  ? 'Codeforces'
                  : 'HackerRank'
              }`
            : 'Participate in rated contests to get ranked.',
        };
      } else {
        const acc = platforms.find((p) => p.platform === platform);
        const rating = acc?.rating || 0;
        const name =
          platform === 'LEETCODE'
            ? 'LeetCode'
            : platform === 'CODEFORCES'
            ? 'Codeforces'
            : 'HackerRank';
        return {
          numeric: rating,
          highlight: rating > 0 ? `Rating: ${rating}` : `No rating recorded yet on ${name}`,
          breakdown: acc?.username
            ? `Linked account: @${acc.username}`
            : `No ${name} account connected yet.`,
        };
      }
    } else if (type === 'STREAK') {
      return {
        numeric: 0,
        highlight: 'Daily Active Streak',
        breakdown: 'Streak tracks consecutive days with accepted submissions across all platforms.',
      };
    }
    return { numeric: 0, highlight: 'N/A', breakdown: '' };
  };

  const baseline = getBaseline();

  // Dynamic placeholder for title
  const getTitlePlaceholder = () => {
    if (type === 'SOLVE_PROBLEMS') {
      if (platform === 'ALL') return 'e.g., Reach 2,000 problems solved total';
      if (platform === 'LEETCODE') return 'e.g., Solve 1,500 LeetCode problems';
      if (platform === 'CODEFORCES') return 'e.g., Solve 200 Codeforces problems';
      if (platform === 'HACKERRANK') return 'e.g., Solve 350 HackerRank challenges';
    } else if (type === 'RATING_TARGET') {
      if (platform === 'CODEFORCES') return 'e.g., Hit 1400 rating on Codeforces';
      if (platform === 'LEETCODE') return 'e.g., Hit 1650 contest rating on LeetCode';
      return 'e.g., Reach 1600 peak rating';
    }
    return 'e.g., 30-day problem solving streak';
  };

  // Quick preset chips for target
  const handleQuickPreset = (delta) => {
    const newTarget = baseline.numeric > 0 ? baseline.numeric + delta : delta;
    setTarget(String(newTarget));
    setError('');

    // If title is currently blank, autofill a descriptive title
    if (!title.trim()) {
      if (type === 'SOLVE_PROBLEMS') {
        const platformLabel =
          platform === 'ALL'
            ? 'across platforms'
            : platform === 'LEETCODE'
            ? 'on LeetCode'
            : platform === 'CODEFORCES'
            ? 'on Codeforces'
            : 'on HackerRank';
        setTitle(`Solve ${newTarget.toLocaleString()} problems ${platformLabel}`);
      } else if (type === 'RATING_TARGET') {
        const platformLabel =
          platform === 'ALL' ? 'peak' : platform === 'CODEFORCES' ? 'Codeforces' : 'LeetCode';
        setTitle(`Reach ${newTarget} ${platformLabel} rating`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a descriptive goal title.');
      return;
    }

    const numTarget = parseInt(target, 10);
    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Target value must be a positive number.');
      return;
    }

    if (!deadline) {
      setError('Please select a target deadline.');
      return;
    }

    const selectedDate = new Date(deadline);
    if (selectedDate <= new Date()) {
      setError('Deadline must be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await goalsApi.createGoal({
        title: title.trim(),
        type,
        platform: type === 'STREAK' ? 'ALL' : platform,
        target: numTarget,
        deadline: selectedDate.toISOString(),
      });

      if (res.success) {
        toast.success(`Goal "${title.trim()}" created successfully!`);
        onSuccess?.();
        onClose();
        setTitle('');
        setTarget('');
        setDeadline('');
        setPlatform('ALL');
      } else {
        setError(res.error?.message || 'Failed to create goal.');
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          'Error creating goal. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const numTargetVal = parseInt(target, 10);
  const isTargetBelowBaseline =
    numTargetVal > 0 && baseline.numeric > 0 && numTargetVal <= baseline.numeric;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Goal
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Track your milestone with auto-evaluated platform progress
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Goal Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Goal Objective Type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {goalTypes.map((gt) => {
                const Icon = gt.icon;
                const isSelected = type === gt.type;
                return (
                  <button
                    key={gt.type}
                    type="button"
                    onClick={() => {
                      setType(gt.type);
                      setError('');
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center mb-2 border ${gt.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs leading-snug">{gt.label}</div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight block mt-0.5">
                        {gt.unit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Scope Selector (for problems & rating goals) */}
          {type !== 'STREAK' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Target Platform Scope
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {platformOptions.map((opt) => {
                  const isSelected = platform === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setPlatform(opt.value);
                        setError('');
                      }}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      {opt.isAll ? (
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <PlatformIcon platform={opt.value} className="w-3.5 h-3.5" />
                      )}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Baseline Banner */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                Current Baseline:
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {loadingPlatforms ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin inline text-slate-400" />
                ) : (
                  baseline.highlight
                )}
              </span>
            </div>
            {baseline.breakdown && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {baseline.breakdown}
              </p>
            )}
          </div>

          {/* Goal Title */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Goal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getTitlePlaceholder()}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Target Value & Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Target ({currentTypeMeta.unit})
              </label>

              {/* Quick Increment Chips if baseline exists */}
              {type === 'SOLVE_PROBLEMS' && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 mr-0.5">Quick add:</span>
                  {[25, 50, 100, 200].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => handleQuickPreset(inc)}
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
                    >
                      +{inc}
                    </button>
                  ))}
                </div>
              )}
              {type === 'STREAK' && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 mr-0.5">Quick set:</span>
                  {[7, 14, 30, 100].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        setTarget(String(days));
                        if (!title.trim()) setTitle(`${days}-Day Problem Solving Streak`);
                      }}
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60 transition-colors"
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="number"
              min="1"
              step="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={currentTypeMeta.placeholder}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />

            {/* Warning if target is below current baseline */}
            {isTargetBelowBaseline && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Your target ({numTargetVal}) is at or below your current count ({baseline.numeric}).
                  Aim higher (e.g. {baseline.numeric + 50}) to track meaningful new progress!
                </span>
              </p>
            )}
          </div>

          {/* Deadline Date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Deadline Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={tomorrowStr}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Goal...</span>
                </>
              ) : (
                <span>Create Goal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalModal;
