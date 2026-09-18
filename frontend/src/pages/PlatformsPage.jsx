import React, { useState, useEffect, useCallback } from 'react';
import platformsApi from '../api/platforms';
import PlatformCard from '../components/platforms/PlatformCard';
import LinkAccountModal from '../components/platforms/LinkAccountModal';
import UnlinkModal from '../components/platforms/UnlinkModal';
import {
  Link2,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export const PlatformsPage = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingMap, setSyncingMap] = useState({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Notifications
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', text: '' }

  // Modal States
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedPlatformForModal, setSelectedPlatformForModal] = useState('LEETCODE');

  const [unlinkModalState, setUnlinkModalState] = useState({
    isOpen: false,
    platform: '',
    platformName: '',
    username: '',
  });

  const loadPlatforms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformsApi.getPlatforms();
      if (res.success) {
        setPlatforms(res.data || []);
      }
    } catch (err) {
      console.error('[PlatformsPage] Error loading accounts:', err);
      setBanner({
        type: 'error',
        text: 'Failed to load linked platform accounts. Please refresh.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlatforms();
  }, [loadPlatforms]);

  // Sync a single platform
  const handleSyncPlatform = async (platformKey) => {
    setSyncingMap((prev) => ({ ...prev, [platformKey]: true }));
    setBanner(null);

    try {
      const res = await platformsApi.syncPlatform(platformKey);
      if (res.success) {
        setBanner({
          type: 'success',
          text: res.message || `Successfully synced ${platformKey}!`,
        });
        await loadPlatforms();
      } else {
        setBanner({
          type: 'error',
          text: res.error?.message || `Sync failed for ${platformKey}.`,
        });
      }
    } catch (err) {
      setBanner({
        type: 'error',
        text:
          err.response?.data?.error?.message ||
          err.message ||
          `Sync failed for ${platformKey}.`,
      });
    } finally {
      setSyncingMap((prev) => ({ ...prev, [platformKey]: false }));
    }
  };

  // Sync all connected platforms in parallel
  const handleSyncAll = async () => {
    if (platforms.length === 0) return;
    setIsSyncingAll(true);
    setBanner(null);

    try {
      const results = await Promise.allSettled(
        platforms.map((p) => platformsApi.syncPlatform(p.platform))
      );

      const successful = results.filter((r) => r.status === 'fulfilled' && r.value?.success).length;
      setBanner({
        type: 'success',
        text: `Sync complete: ${successful} of ${platforms.length} accounts updated successfully.`,
      });
      await loadPlatforms();
    } catch (err) {
      setBanner({
        type: 'error',
        text: 'Error synchronizing some platforms. Please check individual status.',
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const openConnectModal = (platformKey) => {
    let keyToSelect = platformKey;
    if (!keyToSelect) {
      const unlinked = ['LEETCODE', 'CODEFORCES', 'HACKERRANK'].find(
        (p) => !platforms.some((acc) => acc.platform?.toUpperCase() === p)
      );
      keyToSelect = unlinked || 'LEETCODE';
    }
    setSelectedPlatformForModal(keyToSelect);
    setLinkModalOpen(true);
  };

  const openUnlinkModal = (platform, platformName, username) => {
    setUnlinkModalState({
      isOpen: true,
      platform,
      platformName,
      username,
    });
  };

  const connectedCount = platforms.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Platform Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Connected Coding Platforms
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your profiles across LeetCode, Codeforces, and HackerRank with real-time sync.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncingAll || connectedCount === 0 || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{isSyncingAll ? 'Syncing All...' : 'Sync All Accounts'}</span>
          </button>

          <button
            type="button"
            onClick={() => openConnectModal('LEETCODE')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Account</span>
          </button>
        </div>
      </div>

      {/* Banner / Toast notification */}
      {banner && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            banner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span className="font-medium">{banner.text}</span>
          </div>

          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-[11px] font-semibold underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connection Summary Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">
              {connectedCount} of 3 Supported Platforms Linked
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Sync runs daily in the background and can be triggered on-demand anytime.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['LEETCODE', 'CODEFORCES', 'HACKERRANK'].map((p) => {
            const isConn = platforms.some((item) => item.platform?.toUpperCase() === p);
            return (
              <span
                key={p}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isConn
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                {p}
              </span>
            );
          })}
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['LEETCODE', 'CODEFORCES', 'HACKERRANK'].map((platformKey) => {
          const account = platforms.find((p) => p.platform?.toUpperCase() === platformKey);
          return (
            <PlatformCard
              key={platformKey}
              platformKey={platformKey}
              account={account}
              isSyncing={!!syncingMap[platformKey] || isSyncingAll}
              onSync={handleSyncPlatform}
              onConnect={openConnectModal}
              onUnlink={openUnlinkModal}
            />
          );
        })}
      </div>

      {/* How Synchronization Works Guide Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm text-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>How Synchronization Works</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-500 dark:text-slate-400 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              1. Direct API Ingestion
            </span>
            Submissions, problem metadata, and contest ratings are fetched directly through official platform APIs and GraphQL interfaces.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              2. Normalization & Deduplication
            </span>
            Raw payloads are canonicalized into standard verdicts (Accepted, Wrong Answer, TLE), and distinct problem IDs prevent double counting.
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              3. Dynamic Metric Updates
            </span>
            Your streaks, 365-day submission heatmap, difficulty percentages, and active goals are recalculated on every sync.
          </div>
        </div>
      </div>

      {/* Connect Account Modal */}
      <LinkAccountModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        initialPlatform={selectedPlatformForModal}
        connectedAccounts={platforms}
        onSuccess={(msg) => {
          setBanner({ type: 'success', text: msg });
          loadPlatforms();
        }}
      />

      {/* Unlink Account Modal */}
      <UnlinkModal
        isOpen={unlinkModalState.isOpen}
        onClose={() =>
          setUnlinkModalState((prev) => ({ ...prev, isOpen: false }))
        }
        platform={unlinkModalState.platform}
        platformName={unlinkModalState.platformName}
        username={unlinkModalState.username}
        onSuccess={(msg) => {
          setBanner({ type: 'success', text: msg });
          loadPlatforms();
        }}
      />
    </div>
  );
};

export default PlatformsPage;
