import React, { useMemo, useState } from 'react';
import { Flame, Calendar, Info } from 'lucide-react';

const getLevel = (count) => {
  if (!count || count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
};

// Generate the 52 weeks of dates ending today
const generateCalendarDays = (activityMap) => {
  const days = [];
  const today = new Date();
  // Normalize today to UTC date string
  const todayDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  // End on the coming Saturday of current week to finish grid nicely
  const dayOfWeek = todayDate.getUTCDay(); // 0 = Sunday
  const daysToAdd = 6 - dayOfWeek;
  const endDate = new Date(todayDate.getTime() + daysToAdd * 86400000);

  // Total 53 weeks * 7 = 371 days
  const totalDays = 53 * 7;
  const startDate = new Date(endDate.getTime() - (totalDays - 1) * 86400000);

  let cur = new Date(startDate.getTime());
  while (cur <= endDate) {
    const dateStr = cur.toISOString().slice(0, 10);
    const count = activityMap.get(dateStr) || 0;
    const isFuture = cur > todayDate;

    days.push({
      dateStr,
      date: new Date(cur.getTime()),
      count: isFuture ? 0 : count,
      level: isFuture ? 0 : getLevel(count),
      isFuture,
      dayOfWeek: cur.getUTCDay(),
      month: cur.getUTCMonth(),
      year: cur.getUTCFullYear(),
    });

    cur = new Date(cur.getTime() + 86400000);
  }

  return days;
};

export const ActivityHeatmap = ({
  data = [],
  currentStreak = 0,
  longestStreak = 0,
  title = 'Activity Heatmap',
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  const { calendarWeeks, totalContributions, monthLabels } = useMemo(() => {
    const map = new Map();
    let total = 0;

    (data || []).forEach((item) => {
      if (item.date && typeof item.count === 'number') {
        map.set(item.date, item.count);
        total += item.count;
      }
    });

    const allDays = generateCalendarDays(map);
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    // Determine month labels positions
    const months = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDayOfMonth = week.find((d) => d.date.getUTCDate() <= 7);
      if (firstDayOfMonth && firstDayOfMonth.month !== lastMonth) {
        lastMonth = firstDayOfMonth.month;
        const monthName = firstDayOfMonth.date.toLocaleString('en-US', {
          month: 'short',
          timeZone: 'UTC',
        });
        months.push({ weekIndex, name: monthName });
      }
    });

    return {
      calendarWeeks: weeks,
      totalContributions: total,
      monthLabels: months,
    };
  }, [data]);

  // Color classes for Dark and Light mode
  const getCellClass = (level, isFuture) => {
    if (isFuture) {
      return 'bg-transparent border border-dashed border-slate-200/50 dark:border-slate-800/40 opacity-30';
    }

    switch (level) {
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-300/50 dark:border-emerald-800/50';
      case 2:
        return 'bg-emerald-400 dark:bg-emerald-700 border border-emerald-500/50 dark:border-emerald-600/50';
      case 3:
        return 'bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-400 text-white';
      case 4:
        return 'bg-emerald-600 dark:bg-emerald-400 border border-emerald-700 dark:border-emerald-300 shadow-sm shadow-emerald-500/40';
      default:
        return 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {totalContributions}
            </span>{' '}
            accepted submissions in the last 12 months
          </p>
        </div>

        {/* Streaks Pills */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] mr-1">Current:</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">
                {currentStreak} days
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Best:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {longestStreak} days
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid View with horizontal scroll */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          {/* Months header labels */}
          <div className="flex text-[11px] text-slate-400 dark:text-slate-500 mb-1.5 pl-7">
            {calendarWeeks.map((_, weekIndex) => {
              const label = monthLabels.find((m) => m.weekIndex === weekIndex);
              return (
                <div key={weekIndex} className="w-3.5 mr-1 text-left">
                  {label && <span className="font-medium">{label.name}</span>}
                </div>
              );
            })}
          </div>

          {/* Days Grid: 7 rows */}
          <div className="flex">
            {/* Weekday indicators on the left */}
            <div className="flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 pr-2 pt-0.5 pb-1 select-none w-7">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1">
              {calendarWeeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.dateStr}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={`${day.count} accepted submission(s) on ${formatDate(day.dateStr)}`}
                      className={`w-3.5 h-3.5 rounded-sm transition-transform duration-100 cursor-pointer ${getCellClass(
                        day.level,
                        day.isFuture
                      )} ${hoveredDay?.dateStr === day.dateStr ? 'scale-125 z-10' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Tooltip info + Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="text-slate-500 dark:text-slate-400 min-h-[1.25rem] flex items-center gap-1.5">
          {hoveredDay ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {hoveredDay.count} submission{hoveredDay.count === 1 ? '' : 's'}
              </span>{' '}
              on {formatDate(hoveredDay.dateStr)}
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">
              Hover over a square to inspect daily submissions
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <span className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800" />
          <span className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600" />
          <span className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-400" />
          <span className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-400 border border-emerald-700 dark:border-emerald-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
