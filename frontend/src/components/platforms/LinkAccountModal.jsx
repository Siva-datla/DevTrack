import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2, Link2, Info } from 'lucide-react';
import platformsApi from '../../api/platforms';
import { PlatformIcon } from '../common/PlatformIcon';

const platformDetails = {
  LEETCODE: {
    name: 'LeetCode',
    color: '#FFA116',
    border: 'border-amber-500',
    badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    placeholder: 'e.g., neal_wu or your_username',
    hint: 'Enter your public LeetCode username (found in your leetcode.com profile URL).',
  },
  CODEFORCES: {
    name: 'Codeforces',
    color: '#318CE7',
    border: 'border-blue-500',
    badge: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    placeholder: 'e.g., tourist or your_handle',
    hint: 'Enter your Codeforces handle. Submissions and rating history will be synced.',
  },
  HACKERRANK: {
    name: 'HackerRank',
    color: '#00EA64',
    border: 'border-emerald-500',
    badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    placeholder: 'e.g., your_username',
    hint: 'Enter your HackerRank username to sync your badges, scores, and problem solutions.',
  },
};

export const LinkAccountModal = ({
  isOpen,
  onClose,
  initialPlatform = 'LEETCODE',
  connectedAccounts = [],
  onSuccess,
}) => {
  const [platform, setPlatform] = useState(initialPlatform);
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Crucial fix: update selected platform and reset fields whenever modal opens or initialPlatform changes
  useEffect(() => {
    if (isOpen) {
      setPlatform(initialPlatform);
      setUsername('');
      setError('');
    }
  }, [isOpen, initialPlatform]);

  if (!isOpen) return null;

  const currentMeta = platformDetails[platform] || platformDetails.LEETCODE;

  // Check if the currently selected platform is already connected
  const existingAccount = connectedAccounts.find(
    (a) => a.platform?.toUpperCase() === platform?.toUpperCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username or handle.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await platformsApi.addPlatform(platform, username.trim());
      if (res.success) {
        onSuccess?.(res.message || `Successfully connected ${currentMeta.name}!`);
        onClose();
      } else {
        setError(res.error?.message || 'Failed to connect account.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Could not verify account. Please check the handle and try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center p-2 shadow-sm border border-slate-200/60 dark:border-slate-800"
              style={{ backgroundColor: `${currentMeta.color}15` }}
            >
              <PlatformIcon platform={platform} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Connect {currentMeta.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Link your handle to import submissions and ratings
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

        {/* Error Notice */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Existing Connection Warning */}
        {existingAccount && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>{currentMeta.name}</strong> is currently linked to{' '}
              <span className="font-mono font-semibold">@{existingAccount.username}</span>. Entering a new handle will update your linked account.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Platform Selector Tabs */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(platformDetails).map((key) => {
                const p = platformDetails[key];
                const isSelected = platform === key;
                const isConnected = connectedAccounts.some(
                  (a) => a.platform?.toUpperCase() === key
                );

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setPlatform(key);
                      setError('');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <PlatformIcon platform={key} className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </div>

                    {isConnected && (
                      <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Linked</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username / Handle input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {currentMeta.name} Username or Handle
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={currentMeta.placeholder}
              required
              autoFocus
              disabled={submitting}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              {currentMeta.hint}
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying & Syncing...</span>
                </>
              ) : (
                <span>{existingAccount ? 'Update & Sync' : 'Connect & Sync'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkAccountModal;
