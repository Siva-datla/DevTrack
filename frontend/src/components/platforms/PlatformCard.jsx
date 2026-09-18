import React from 'react';
import {
  ExternalLink,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trophy,
  Award,
  Code2,
  Plus,
} from 'lucide-react';

const platformStyles = {
  LEETCODE: {
    name: 'LeetCode',
    tagline: 'Algorithmic Problem Solving & Contests',
    color: '#FFA116',
    border: 'border-amber-500/20',
    accentBg: 'bg-amber-50 dark:bg-amber-950/40',
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    profileUrl: (u) => `https://leetcode.com/${u}`,
    features: ['Problem Solves & Submissions', 'Contest Ranking History', 'Topic Breakdown'],
  },
  CODEFORCES: {
    name: 'Codeforces',
    tagline: 'Competitive Programming Contests & Ratings',
    color: '#318CE7',
    border: 'border-blue-500/20',
    accentBg: 'bg-blue-50 dark:bg-blue-950/40',
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    profileUrl: (u) => `https://codeforces.com/profile/${u}`,
    features: ['Official Rating History', 'Submissions Log', 'Contest Performance'],
  },
  HACKERRANK: {
    name: 'HackerRank',
    tagline: 'Skills, Badges & Domain Challenges',
    color: '#00EA64',
    border: 'border-emerald-500/20',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    profileUrl: (u) => `https://www.hackerrank.com/${u}`,
    features: ['Skill Badges & Stars', 'Domain Challenge Scores', 'Solved Problems'],
  },
};

export const PlatformCard = ({
  platformKey,
  account,
  isSyncing,
  onSync,
  onConnect,
  onUnlink,
}) => {
  const meta = platformStyles[platformKey] || platformStyles.LEETCODE;
  const isLinked = !!account?.username;

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diffSec = Math.floor((now - new Date(timestamp).getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
      {/* Top Brand Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm"
              style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {meta.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {meta.tagline}
              </p>
            </div>
          </div>

          {/* Connected / Unconnected Pill */}
          {isLinked ? (
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.badge}`}
            >
              Connected
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Not Connected
            </span>
          )}
        </div>

        {/* Linked Details Section */}
        {isLinked ? (
          <div className="space-y-4 my-5">
            {/* Handle & External Link */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                  Linked Handle
                </span>
                <div className="font-mono font-bold text-sm text-slate-900 dark:text-white truncate">
                  @{account.username}
                </div>
              </div>

              <a
                href={meta.profileUrl(account.username)}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                title="View Profile on Platform"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] mb-1">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Problems Solved</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {account.totalSolved ?? 0}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Contest Rating</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {account.rating ? Math.round(account.rating) : 'Unrated'}
                </div>
              </div>
            </div>

            {/* Sync Status info */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1.5">
                {account.syncStatus === 'SUCCESS' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {account.syncStatus === 'SYNCING' && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                )}
                {account.syncStatus === 'FAILED' && (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {account.syncStatus || 'SUCCESS'}
                </span>
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Synced {getRelativeTime(account.lastSyncedAt)}</span>
              </span>
            </div>
          </div>
        ) : (
          /* Unlinked Empty View */
          <div className="my-6 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect your {meta.name} profile to automatically sync your problem solving history, ratings, and daily contributions.
            </p>

            <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {meta.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {isLinked ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSync(platformKey)}
              disabled={isSyncing}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            <button
              type="button"
              onClick={() => onUnlink(platformKey, meta.name, account.username)}
              disabled={isSyncing}
              title="Disconnect Account"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onConnect(platformKey)}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700/80 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Connect {meta.name}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PlatformCard;
