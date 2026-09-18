import React, { useState, useEffect, useCallback } from 'react';
import problemsApi from '../api/problems';
import ProblemDetailModal from '../components/problems/ProblemDetailModal';
import {
  Code2,
  Search,
  CheckCircle2,
  AlertCircle,
  Circle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const platformPills = [
  { key: '', label: 'All Platforms' },
  { key: 'LEETCODE', label: 'LeetCode' },
  { key: 'CODEFORCES', label: 'Codeforces' },
  { key: 'HACKERRANK', label: 'HackerRank' },
];

const difficultyPills = [
  { key: '', label: 'All Difficulties' },
  { key: 'EASY', label: 'Easy' },
  { key: 'MEDIUM', label: 'Medium' },
  { key: 'HARD', label: 'Hard' },
];

const statusPills = [
  { key: '', label: 'All Statuses' },
  { key: 'SOLVED', label: 'Solved' },
  { key: 'ATTEMPTED', label: 'Attempted' },
  { key: 'UNSOLVED', label: 'Unsolved' },
];

const platformColors = {
  LEETCODE: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
  CODEFORCES: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50',
  HACKERRANK: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
};

const diffColors = {
  EASY: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
  MEDIUM: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
  HARD: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
  UNRATED: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
};

export const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });

  // Filter States
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');

  // Inspect Modal
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  const fetchProblems = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      try {
        const params = {
          page: pageToLoad,
          limit: 20,
        };
        if (search.trim()) params.q = search.trim();
        if (platform) params.platform = platform;
        if (difficulty) params.difficulty = difficulty;
        if (status) params.status = status;
        if (tag.trim()) params.tag = tag.trim();

        const res = await problemsApi.getProblems(params);
        if (res.success) {
          setProblems(res.data || []);
          setPagination(res.pagination || { page: pageToLoad, pages: 1, total: 0, limit: 20 });
        }
      } catch (err) {
        console.error('[ProblemsPage] Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    },
    [search, platform, difficulty, status, tag]
  );

  useEffect(() => {
    fetchProblems(1);
  }, [fetchProblems]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchProblems(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Problem Explorer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Problem Catalogue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search canonical problems across LeetCode, Codeforces, and HackerRank and view personal solve status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchProblems(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by name or ID (e.g., Two Sum, 1A)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="w-full sm:w-60">
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Filter by tag (e.g., dp, graphs)..."
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Platform Pills */}
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

          {/* Difficulty Pills */}
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

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
              Status:
            </span>
            {statusPills.map((s) => (
              <button
                key={s.key}
                onClick={() => setStatus(s.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  status === s.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <tr>
                <th className="py-3.5 px-4 font-semibold w-12 text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold">Problem Title</th>
                <th className="py-3.5 px-4 font-semibold">Platform</th>
                <th className="py-3.5 px-4 font-semibold">Difficulty</th>
                <th className="py-3.5 px-4 font-semibold">Topic Tags</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto" />
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
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Code2 className="w-8 h-8 opacity-40" />
                      <p className="font-semibold text-sm">No problems match your filters</p>
                      <p className="text-xs">Try adjusting your search keywords, difficulty, or platform filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                problems.map((prob) => {
                  const pColor = platformColors[prob.platform] || 'text-slate-600 bg-slate-100';
                  const dColor = diffColors[prob.difficulty] || diffColors.UNRATED;

                  return (
                    <tr
                      key={prob._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedProblemId(prob._id)}
                    >
                      {/* Solve Status Icon */}
                      <td className="py-3.5 px-4 text-center">
                        {prob.userStatus === 'SOLVED' ? (
                          <CheckCircle2
                            className="w-4 h-4 text-emerald-500 mx-auto"
                            title="Solved by you"
                          />
                        ) : prob.userStatus === 'ATTEMPTED' ? (
                          <AlertCircle
                            className="w-4 h-4 text-amber-500 mx-auto"
                            title="Attempted"
                          />
                        ) : (
                          <Circle
                            className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mx-auto"
                            title="Unsolved"
                          />
                        )}
                      </td>

                      {/* Problem Title & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400">
                          {prob.title}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          ID: {prob.externalId}
                        </span>
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${pColor}`}>
                          {prob.platform}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${dColor}`}>
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {prob.tags?.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                            >
                              {t}
                            </span>
                          ))}
                          {prob.tags?.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{prob.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProblemId(prob._id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors"
                          >
                            Details
                          </button>

                          {prob.url && (
                            <a
                              href={prob.url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open on Platform"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
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
            Showing <strong className="text-slate-800 dark:text-slate-200">{problems.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{pagination.total}</strong> problems
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

      {/* Problem Detail Modal */}
      <ProblemDetailModal
        problemId={selectedProblemId}
        isOpen={!!selectedProblemId}
        onClose={() => setSelectedProblemId(null)}
      />
    </div>
  );
};

export default ProblemsPage;
