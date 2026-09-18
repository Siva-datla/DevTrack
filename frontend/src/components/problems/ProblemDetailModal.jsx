import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code2,
  Tag,
  Loader2,
} from 'lucide-react';
import problemsApi from '../../api/problems';

const platformBadge = {
  LEETCODE: { name: 'LeetCode', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50' },
  CODEFORCES: { name: 'Codeforces', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50' },
  HACKERRANK: { name: 'HackerRank', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50' },
};

const difficultyBadge = {
  EASY: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  HARD: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
  UNRATED: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

export const ProblemDetailModal = ({ problemId, isOpen, onClose }) => {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !problemId) return;

    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await problemsApi.getProblemById(problemId);
        if (res.success) {
          setProblem(res.data);
        } else {
          setError(res.error?.message || 'Problem not found');
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || err.message || 'Error loading problem details');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [isOpen, problemId]);

  if (!isOpen) return null;

  const pBadge = platformBadge[problem?.platform] || { name: problem?.platform, color: 'text-slate-600 bg-slate-100' };
  const dBadge = difficultyBadge[problem?.difficulty] || difficultyBadge.UNRATED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pBadge.color}`}>
                {pBadge.name}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${dBadge}`}>
                {problem?.difficulty || 'UNRATED'}
              </span>
              {problem?.userStatus && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    problem.userStatus === 'SOLVED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                      : problem.userStatus === 'ATTEMPTED'
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {problem.userStatus}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {loading ? 'Loading Problem...' : problem?.title || 'Problem Details'}
            </h3>
            {problem?.externalId && (
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                ID: {problem.externalId}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading problem details...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Tags Section */}
              {problem?.tags && problem.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Topic Tags</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User Submissions History for this problem */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Your Submissions for this Problem</span>
                </h4>

                {problem?.recentSubmissions && problem.recentSubmissions.length > 0 ? (
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Verdict</th>
                          <th className="py-2.5 px-3 font-semibold">Language</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {problem.recentSubmissions.map((sub, idx) => (
                          <tr key={sub._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  sub.verdict === 'ACCEPTED'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                                }`}
                              >
                                {sub.verdict === 'ACCEPTED' ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                {sub.verdict}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                              {sub.language || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-400">
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                    No submissions recorded yet for this problem.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {problem?.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
            >
              <span>Solve on {pBadge.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailModal;
