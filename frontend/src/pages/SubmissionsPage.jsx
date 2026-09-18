import React, { useState, useEffect, useCallback } from 'react';
import submissionsApi from '../api/submissions';
import SubmissionDetailModal from '../components/submissions/SubmissionDetailModal';
import { useToast } from '../context/ToastContext';
import {
  History,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Layers,
  Check,
  Copy,
  SlidersHorizontal,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';

const platformPills = [
  { key: '', label: 'All Platforms' },
  { key: 'LEETCODE', label: 'LeetCode' },
  { key: 'CODEFORCES', label: 'Codeforces' },
  { key: 'HACKERRANK', label: 'HackerRank' },
];

const verdictPills = [
  { key: '', label: 'All Verdicts' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'WRONG_ANSWER', label: 'Wrong Answer' },
  { key: 'TIME_LIMIT_EXCEEDED', label: 'TLE' },
  { key: 'RUNTIME_ERROR', label: 'Runtime Error' },
  { key: 'COMPILATION_ERROR', label: 'Compile Error' },
];

const difficultyPills = [
  { key: '', label: 'All Difficulties' },
  { key: 'EASY', label: 'Easy' },
  { key: 'MEDIUM', label: 'Medium' },
  { key: 'HARD', label: 'Hard' },
  { key: 'UNRATED', label: 'Unrated' },
];

const quickLanguages = ['All', 'C++', 'Python', 'Java', 'JavaScript', 'Go'];

const verdictConfig = {
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    icon: CheckCircle2,
  },
  OK: {
    label: 'Accepted',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    icon: CheckCircle2,
  },
  WRONG_ANSWER: {
    label: 'Wrong Answer',
    bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    icon: XCircle,
  },
  TIME_LIMIT_EXCEEDED: {
    label: 'TLE',
    bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    icon: Clock,
  },
  MEMORY_LIMIT_EXCEEDED: {
    label: 'MLE',
    bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    icon: Clock,
  },
  RUNTIME_ERROR: {
    label: 'Runtime Error',
    bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    icon: AlertCircle,
  },
  COMPILATION_ERROR: {
    label: 'Compile Error',
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: AlertCircle,
  },
};

const platformBadge = {
  LEETCODE: { label: 'LeetCode', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
  CODEFORCES: { label: 'Codeforces', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' },
  HACKERRANK: { label: 'HackerRank', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
};

const diffColors = {
  EASY: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
  MEDIUM: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
  HARD: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
  UNRATED: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
};

export const SubmissionsPage = () => {
  const toast = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    byPlatform: { CODEFORCES: 0, LEETCODE: 0, HACKERRANK: 0 },
    byDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0, UNRATED: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });

  // Filters
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [verdict, setVerdict] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [language, setLanguage] = useState('');

  // Selected Submission Modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Stats Summary
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await submissionsApi.getSubmissionsStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('[SubmissionsPage] Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Submissions List
  const fetchSubmissions = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const params = {
          page: pageToLoad,
          limit: 20,
        };
        if (search.trim()) params.search = search.trim();
        if (platform) params.platform = platform;
        if (verdict) params.verdict = verdict;
        if (difficulty) params.difficulty = difficulty;
        if (language && language !== 'All') params.language = language;

        const res = await submissionsApi.getSubmissions(params);
        if (res.success) {
          setSubmissions(res.data || []);
          setPagination(res.pagination || { page: pageToLoad, totalPages: 1, total: 0, limit: 20 });
        }
      } catch (err) {
        console.error('[SubmissionsPage] Error fetching submissions:', err);
        toast.error('Failed to load submissions history');
      } finally {
        setLoading(false);
      }
    },
    [search, platform, verdict, difficulty, language, toast]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSubmissions(1);
  }, [fetchSubmissions]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchSubmissions(newPage);
  };

  const handleClearFilters = () => {
    setSearch('');
    setPlatform('');
    setVerdict('');
    setDifficulty('');
    setLanguage('');
  };

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Submission ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasActiveFilters = !!(search || platform || verdict || difficulty || (language && language !== 'All'));
  const acceptanceRate = stats.totalSubmissions > 0
    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Submissions Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Submissions Feed
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consolidated timeline of your problem submissions across LeetCode, Codeforces, and HackerRank.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStats();
            fetchSubmissions(pagination.page);
          }}
          disabled={loading || statsLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submissions</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {statsLoading ? '—' : stats.totalSubmissions.toLocaleString()}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>All recorded platform attempts</span>
          </div>
        </div>

        {/* Accepted Solutions */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accepted</p>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {statsLoading ? '—' : stats.acceptedSubmissions.toLocaleString()}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Verified passed verdicts</span>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Acceptance Rate</p>
              <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {statsLoading ? '—' : `${acceptanceRate}%`}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, acceptanceRate))}%` }}
            />
          </div>
        </div>

        {/* Platform Share Breakdown */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">By Platform</p>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center justify-between gap-1 text-[11px] pt-1">
            <div className="text-center">
              <span className="text-slate-400 block font-medium">LC</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {stats.byPlatform?.LEETCODE || 0}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-slate-400 block font-medium">CF</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {stats.byPlatform?.CODEFORCES || 0}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-slate-400 block font-medium">HR</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {stats.byPlatform?.HACKERRANK || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by problem title or ID (e.g., Two Sum, 1234A)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Filter language (e.g., C++, Python)..."
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Platform & Verdict Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Platform */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
                Platform:
              </span>
              {platformPills.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPlatform(p.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    platform === p.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Verdict */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
                Verdict:
              </span>
              {verdictPills.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setVerdict(v.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    verdict === v.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Quick Languages */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Difficulty */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
                Difficulty:
              </span>
              {difficultyPills.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDifficulty(d.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    difficulty === d.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Quick Languages */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
                Language:
              </span>
              {quickLanguages.map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l === 'All' ? '' : l)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    (l === 'All' && !language) || language === l
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Verdict</th>
                <th className="py-3.5 px-4 font-semibold">Problem Title</th>
                <th className="py-3.5 px-4 font-semibold">Platform</th>
                <th className="py-3.5 px-4 font-semibold">Difficulty</th>
                <th className="py-3.5 px-4 font-semibold">Language</th>
                <th className="py-3.5 px-4 font-semibold">Submitted At</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-1" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-14 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <History className="w-8 h-8 opacity-40" />
                      <p className="font-semibold text-sm">No submissions match your query</p>
                      <p className="text-xs">
                        {hasActiveFilters
                          ? 'Try clearing or modifying your filters above.'
                          : 'Connect your platforms and sync to start logging your submissions.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const verdictItem = verdictConfig[sub.verdict] || {
                    label: sub.verdict || 'Unknown',
                    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                    icon: Clock,
                  };
                  const VerdictIcon = verdictItem.icon;
                  const pBadge = platformBadge[sub.platform] || {
                    label: sub.platform,
                    color: 'text-slate-600 bg-slate-100',
                  };
                  const dColor = diffColors[sub.difficulty] || diffColors.UNRATED;

                  return (
                    <tr
                      key={sub._id || sub.platformSubmissionId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      {/* Verdict */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${verdictItem.bg}`}>
                          <VerdictIcon className="w-3.5 h-3.5" />
                          {verdictItem.label}
                        </span>
                      </td>

                      {/* Problem Title & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 max-w-xs truncate">
                          {sub.problemName || sub.problemId}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400">
                            ID: {sub.problemId}
                          </span>
                          {sub.contestId && (
                            <span className="text-[10px] px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              #{sub.contestId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${pBadge.color}`}>
                          {pBadge.label}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${dColor}`}>
                          {sub.difficulty || 'UNRATED'}
                        </span>
                      </td>

                      {/* Language */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {sub.language || '—'}
                      </td>

                      {/* Submitted At */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.platformSubmissionId && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(e, sub.platformSubmissionId)}
                              title="Copy Submission ID"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              {copiedId === sub.platformSubmissionId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors"
                          >
                            Details
                          </button>
                        </div>
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
            Showing <strong className="text-slate-800 dark:text-slate-200">{submissions.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{pagination.total}</strong> submissions
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
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        submissionId={selectedSubmission?._id || selectedSubmission?.platformSubmissionId}
        initialData={selectedSubmission}
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
};

export default SubmissionsPage;
