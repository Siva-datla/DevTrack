import React from 'react';
import { Layers } from 'lucide-react';

export const DifficultyCard = ({ difficulty = {}, totalSolved = 0 }) => {
  const easy = difficulty.EASY || 0;
  const medium = difficulty.MEDIUM || 0;
  const hard = difficulty.HARD || 0;
  const unrated = difficulty.UNRATED || 0;

  const total = totalSolved || easy + medium + hard + unrated || 1;

  const easyPercent = Math.round((easy / total) * 100) || 0;
  const mediumPercent = Math.round((medium / total) * 100) || 0;
  const hardPercent = Math.round((hard / total) * 100) || 0;

  const tiers = [
    {
      name: 'Easy',
      count: easy,
      percentage: easyPercent,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      barBg: 'bg-emerald-500',
      trackBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    },
    {
      name: 'Medium',
      count: medium,
      percentage: mediumPercent,
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      barBg: 'bg-amber-500',
      trackBg: 'bg-amber-50 dark:bg-amber-950/40',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
    },
    {
      name: 'Hard',
      count: hard,
      percentage: hardPercent,
      color: 'bg-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      barBg: 'bg-rose-500',
      trackBg: 'bg-rose-50 dark:bg-rose-950/40',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Difficulty Breakdown
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {totalSolved} Solved
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex my-5">
          {easy > 0 && (
            <div
              style={{ width: `${easyPercent}%` }}
              title={`Easy: ${easy} (${easyPercent}%)`}
              className="h-full bg-emerald-500 transition-all duration-300"
            />
          )}
          {medium > 0 && (
            <div
              style={{ width: `${mediumPercent}%` }}
              title={`Medium: ${medium} (${mediumPercent}%)`}
              className="h-full bg-amber-500 transition-all duration-300"
            />
          )}
          {hard > 0 && (
            <div
              style={{ width: `${hardPercent}%` }}
              title={`Hard: ${hard} (${hardPercent}%)`}
              className="h-full bg-rose-500 transition-all duration-300"
            />
          )}
        </div>

        {/* Tier Details */}
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${tier.color}`} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {tier.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {tier.count}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    ({tier.percentage}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${tier.barBg} rounded-full transition-all duration-300`}
                  style={{ width: `${tier.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {unrated > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
          <span>Unrated / Custom Problems</span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">{unrated}</span>
        </div>
      )}
    </div>
  );
};

export default DifficultyCard;
