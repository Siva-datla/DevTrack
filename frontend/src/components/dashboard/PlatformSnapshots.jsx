import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle2, Clock, AlertTriangle, Link2, Sparkles } from 'lucide-react';
import { PlatformIcon } from '../common/PlatformIcon';

const platformMeta = {
  LEETCODE: {
    name: 'LeetCode',
    color: '#FFA116',
    border: 'border-amber-500/20',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    url: (user) => `https://leetcode.com/${user}`,
  },
  CODEFORCES: {
    name: 'Codeforces',
    color: '#318CE7',
    border: 'border-blue-500/20',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    url: (user) => `https://codeforces.com/profile/${user}`,
  },
  HACKERRANK: {
    name: 'HackerRank',
    color: '#00EA64',
    border: 'border-emerald-500/20',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    url: (user) => `https://www.hackerrank.com/${user}`,
  },
};

export const PlatformSnapshots = ({ platforms = [] }) => {
  const allPlatforms = ['LEETCODE', 'CODEFORCES', 'HACKERRANK'];

  const getAccount = (platformName) =>
    platforms.find((p) => p.platform?.toUpperCase() === platformName);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Connected Accounts
          </h3>
        </div>
        <Link
          to="/platforms"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Manage Accounts</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {allPlatforms.map((pKey) => {
          const meta = platformMeta[pKey];
          const account = getAccount(pKey);
          const isLinked = !!account?.username;

          return (
            <div
              key={pKey}
              className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={pKey} className="w-4 h-4" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {meta.name}
                    </span>
                  </div>

                  {isLinked ? (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeBg}`}
                    >
                      Linked
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Not Linked
                    </span>
                  )}
                </div>

                {isLinked ? (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Username</span>
                      <a
                        href={meta.url(account.username)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        @{account.username}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {account.rating ? (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Rating</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {account.rating}
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Total Solved</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {account.totalSolved || 0}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Connect your handle to sync problems & submissions
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {isLinked ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {account.syncStatus || 'SUCCESS'}
                    </span>
                    <span>
                      {account.lastSyncedAt
                        ? new Date(account.lastSyncedAt).toLocaleDateString()
                        : 'Synced'}
                    </span>
                  </div>
                ) : (
                  <Link
                    to="/platforms"
                    className="block text-center text-xs font-semibold py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    + Link Handle
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformSnapshots;
