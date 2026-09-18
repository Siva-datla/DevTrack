import React from 'react';
import { Link } from 'react-router-dom';
import { History, ExternalLink, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const verdictConfig = {
  ACCEPTED: {
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

export const RecentSubmissions = ({ submissions = [] }) => {
  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        <Link
          to="/submissions"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
        >
          <span>All Submissions</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
          No recent submissions found. Connect your accounts and sync to import activity.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="pb-3 font-semibold">Problem</th>
                <th className="pb-3 font-semibold">Platform</th>
                <th className="pb-3 font-semibold">Verdict</th>
                <th className="pb-3 font-semibold">Language</th>
                <th className="pb-3 font-semibold text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {submissions.slice(0, 6).map((sub) => {
                const verdict = verdictConfig[sub.verdict] || {
                  label: sub.verdict || 'Unknown',
                  bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700',
                  icon: Clock,
                };
                const VerdictIcon = verdict.icon;
                const pBadge = platformBadge[sub.platform] || {
                  label: sub.platform,
                  color: 'text-slate-600 bg-slate-100',
                };

                return (
                  <tr key={sub._id || sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-medium text-slate-900 dark:text-white max-w-[220px] truncate">
                      {sub.problemUrl ? (
                        <a
                          href={sub.problemUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                        >
                          {sub.problemName || sub.problemId}
                        </a>
                      ) : (
                        sub.problemName || sub.problemId
                      )}
                    </td>

                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${pBadge.color}`}>
                        {pBadge.label}
                      </span>
                    </td>

                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[10px] border ${verdict.bg}`}>
                        <VerdictIcon className="w-3 h-3" />
                        {verdict.label}
                      </span>
                    </td>

                    <td className="py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {sub.language || '—'}
                    </td>

                    <td className="py-3 text-right text-slate-400 dark:text-slate-500">
                      {sub.submittedAt
                        ? new Date(sub.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentSubmissions;
