import React from 'react';

const colorThemes = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-100 dark:border-indigo-900/50',
    iconBg: 'bg-indigo-600 dark:bg-indigo-500 text-white',
    accentText: 'text-indigo-600 dark:text-indigo-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-600 dark:bg-emerald-500 text-white',
    accentText: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-100 dark:border-amber-900/50',
    iconBg: 'bg-amber-500 text-white',
    accentText: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-100 dark:border-rose-900/50',
    iconBg: 'bg-rose-600 dark:bg-rose-500 text-white',
    accentText: 'text-rose-600 dark:text-rose-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-100 dark:border-violet-900/50',
    iconBg: 'bg-violet-600 dark:bg-violet-500 text-white',
    accentText: 'text-violet-600 dark:text-violet-400',
  },
};

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'indigo',
  badge,
  className = '',
}) => {
  const theme = colorThemes[color] || colorThemes.indigo;

  return (
    <div
      className={`bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${theme.iconBg}`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 truncate">{subtext}</span>
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full font-semibold ${theme.bg} ${theme.border} ${theme.accentText} border`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
