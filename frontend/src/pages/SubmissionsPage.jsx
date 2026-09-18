import React from 'react';
import { History, Sparkles } from 'lucide-react';

export const SubmissionsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/50">
          <History className="w-6 h-6" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scheduled for Phase 4</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Submissions History & Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          In Phase 4, you will be able to inspect your entire submission history across all platforms with advanced verdict and language filtering.
        </p>
      </div>
    </div>
  );
};

export default SubmissionsPage;
