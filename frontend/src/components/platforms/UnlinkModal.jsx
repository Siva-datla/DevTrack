import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import platformsApi from '../../api/platforms';

export const UnlinkModal = ({
  isOpen,
  onClose,
  platform,
  platformName,
  username,
  onSuccess,
}) => {
  const [purging, setPurging] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setPurging(true);
    setError('');

    try {
      const res = await platformsApi.deletePlatform(platform, true);
      if (res.success) {
        onSuccess?.(res.message || `Unlinked ${platformName} account @${username}`);
        onClose();
      } else {
        setError(res.error?.message || 'Failed to unlink account.');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Error disconnecting account.');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-center text-base font-bold text-slate-900 dark:text-white">
          Disconnect {platformName}?
        </h3>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Are you sure you want to unlink <span className="font-semibold text-slate-800 dark:text-slate-200">@{username}</span>? This will stop syncing and remove its associated submissions from your metrics.
        </p>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs text-center border border-rose-200 dark:border-rose-800/50">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={purging}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={purging}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
          >
            {purging ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Disconnecting...</span>
              </>
            ) : (
              <span>Disconnect</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlinkModal;
