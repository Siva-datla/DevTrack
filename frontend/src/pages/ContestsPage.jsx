import React, { useState, useEffect, useCallback } from 'react';
import contestsApi from '../api/contests';
import { PlatformIcon } from '../components/common/PlatformIcon';
import { useToast } from '../context/ToastContext';
import {
  Trophy,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const platformFilters = [
  { key: '', label: 'All Contests' },
  { key: 'LEETCODE', label: 'LeetCode' },
  { key: 'CODEFORCES', label: 'Codeforces' },
];

export const ContestsPage = () => {
  const toast = useToast();

  const [contests, setContests] = useState([]);
  const [ratingData, setRatingData] = useState(null);
  const [loadingContests, setLoadingContests] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('');

  // Fetch Contests Schedule
  const fetchContests = useCallback(async (platform = '') => {
    setLoadingContests(true);
    try {
      const res = await contestsApi.getContests(platform);
      if (res.success) {
        setContests(res.data || []);
      }
    } catch (err) {
      console.error('[ContestsPage] Error loading contests:', err);
      toast.error('Failed to load contest calendar');
    } finally {
      setLoadingContests(false);
    }
  }, [toast]);

  // Fetch Rating History
  const fetchRatingHistory = useCallback(async () => {
    setLoadingRatings(true);
    try {
      const res = await contestsApi.getRatingHistory();
      if (res.success && res.data) {
        setRatingData(res.data);
      }
    } catch (err) {
      console.error('[ContestsPage] Error loading rating history:', err);
    } finally {
      setLoadingRatings(false);
    }
  }, []);

  useEffect(() => {
    fetchContests(selectedPlatform);
  }, [fetchContests, selectedPlatform]);

  useEffect(() => {
    fetchRatingHistory();
  }, [fetchRatingHistory]);

  const handleRefresh = () => {
    fetchContests(selectedPlatform);
    fetchRatingHistory();
  };

  // Format Duration (seconds to human readable)
  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs} hours`;
    return `${mins} mins`;
  };

  // Format Countdown until start
  const getCountdown = (startDate) => {
    const diff = new Date(startDate).getTime() - Date.now();
    if (diff <= 0) return 'Live Now!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${mins}m`;
    return `Starts in ${mins} mins`;
  };

  // Transform Rating History into chronological Recharts series
  const chartData = React.useMemo(() => {
    if (!ratingData?.history || ratingData.history.length === 0) return [];

    let currentCF = null;
    let currentLC = null;

    return ratingData.history.map((event) => {
      const dateStr = new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      });

      if (event.platform === 'CODEFORCES') currentCF = event.newRating;
      if (event.platform === 'LEETCODE') currentLC = event.newRating;

      return {
        date: dateStr,
        fullDate: new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' }),
        platform: event.platform,
        contestName: event.contestName,
        rank: event.rank,
        delta: event.ratingChange,
        Codeforces: currentCF,
        LeetCode: currentLC,
      };
    });
  }, [ratingData]);

  // Platform-specific Peak Ratings and metadata
  const { peakLC, peakCF, currentLC, currentCF, lcUsername, cfUsername } = React.useMemo(() => {
    const lcAccount = ratingData?.connectedPlatforms?.find((p) => p.platform === 'LEETCODE');
    const cfAccount = ratingData?.connectedPlatforms?.find((p) => p.platform === 'CODEFORCES');

    const lcEvents = ratingData?.history?.filter((h) => h.platform === 'LEETCODE') || [];
    const cfEvents = ratingData?.history?.filter((h) => h.platform === 'CODEFORCES') || [];

    const maxLCEvent = lcEvents.length > 0 ? Math.max(...lcEvents.map((h) => h.newRating || 0)) : null;
    const maxCFEvent = cfEvents.length > 0 ? Math.max(...cfEvents.map((h) => h.newRating || 0)) : null;

    const finalPeakLC = maxLCEvent && maxLCEvent > 0 ? maxLCEvent : (lcAccount?.rating || null);
    const finalPeakCF = maxCFEvent && maxCFEvent > 0 ? maxCFEvent : (cfAccount?.rating || null);

    const latestLC = lcEvents.length > 0 ? lcEvents[lcEvents.length - 1].newRating : lcAccount?.rating;
    const latestCF = cfEvents.length > 0 ? cfEvents[cfEvents.length - 1].newRating : cfAccount?.rating;

    return {
      peakLC: finalPeakLC,
      peakCF: finalPeakCF,
      currentLC: latestLC || null,
      currentCF: latestCF || null,
      lcUsername: lcAccount?.username || null,
      cfUsername: cfAccount?.username || null,
    };
  }, [ratingData]);

  // Codeforces Rank Title
  const getCodeforcesRank = (rating) => {
    if (!rating) return 'Unrated';
    if (rating < 1200) return 'Newbie';
    if (rating < 1400) return 'Pupil';
    if (rating < 1600) return 'Specialist';
    if (rating < 1900) return 'Expert';
    if (rating < 2100) return 'Candidate Master';
    if (rating < 2300) return 'Master';
    if (rating < 2400) return 'International Master';
    return 'Grandmaster';
  };

  // LeetCode Contest Tier
  const getLeetCodeTier = (rating) => {
    if (!rating) return 'Unrated';
    if (rating >= 2150) return 'Guardian';
    if (rating >= 1850) return 'Knight';
    if (rating >= 1600) return 'Top Tier';
    return 'Contestant';
  };

  const lcContestsCount = ratingData?.history?.filter((h) => h.platform === 'LEETCODE').length || 0;
  const cfContestsCount = ratingData?.history?.filter((h) => h.platform === 'CODEFORCES').length || 0;
  const upcomingLCCount = contests.filter((c) => c.platform === 'LEETCODE').length;
  const upcomingCFCount = contests.filter((c) => c.platform === 'CODEFORCES').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Contest Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Contests & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track upcoming contests on LeetCode & Codeforces and analyze your rating progression over time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loadingContests || loadingRatings}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingContests || loadingRatings ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overview Stat Cards - Dual Platform Peak Ratings & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LeetCode Peak Rating Card */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <PlatformIcon platform="LEETCODE" className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  LeetCode Peak
                </span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {peakLC ? Math.round(peakLC) : 'Unrated'}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {peakLC ? getLeetCodeTier(peakLC) : 'Contest Rating'}
            </span>
            {lcUsername ? (
              <span className="font-mono text-slate-500 truncate max-w-[110px]">@{lcUsername}</span>
            ) : (
              <span className="text-slate-400">Not connected</span>
            )}
          </div>
        </div>

        {/* Codeforces Peak Rating Card */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <PlatformIcon platform="CODEFORCES" className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Codeforces Peak
                </span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {peakCF ? Math.round(peakCF) : 'Unrated'}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <Trophy className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {peakCF ? getCodeforcesRank(peakCF) : 'Contest Rating'}
            </span>
            {cfUsername ? (
              <span className="font-mono text-slate-500 truncate max-w-[110px]">@{cfUsername}</span>
            ) : (
              <span className="text-slate-400">Not connected</span>
            )}
          </div>
        </div>

        {/* Rated Contests Attended */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Contests Attended
              </span>
              <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {ratingData?.totalEvents ?? 0}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span>Rounds Completed</span>
            <span className="text-slate-500 font-mono">
              {lcContestsCount} LC • {cfContestsCount} CF
            </span>
          </div>
        </div>

        {/* Upcoming Contests Available */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Upcoming Contests
              </span>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {contests.length}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span>Official Schedule</span>
            <span className="text-slate-500 font-mono">
              {upcomingLCCount} LC • {upcomingCFCount} CF
            </span>
          </div>
        </div>
      </div>

      {/* Rating Timeline Section */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Rating Progression Timeline
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical competitive rating progression comparing LeetCode and Codeforces
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>Codeforces</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>LeetCode</span>
            </div>
          </div>
        </div>

        {/* Recharts Curve */}
        {loadingRatings ? (
          <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6">
            <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Rated Contests Recorded Yet</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Participate in rated contests on LeetCode or Codeforces, then sync your handles in the Platforms section to visualize your rating trajectory.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1', opacity: 0.3 }}
                />
                <YAxis
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1', opacity: 0.3 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <PlatformIcon platform={data.platform} className="w-3.5 h-3.5" />
                            <span>{data.contestName || 'Contest'}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{data.fullDate}</div>
                          {data.rank && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-300">
                              Rank: <strong className="font-mono">#{data.rank}</strong>
                            </div>
                          )}
                          <div className="flex items-center gap-3 pt-1 font-semibold font-mono">
                            {data.Codeforces && (
                              <span className="text-blue-600 dark:text-blue-400">
                                CF: {data.Codeforces}
                              </span>
                            )}
                            {data.LeetCode && (
                              <span className="text-amber-600 dark:text-amber-400">
                                LC: {data.LeetCode}
                              </span>
                            )}
                            {typeof data.delta === 'number' && (
                              <span
                                className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
                                  data.delta >= 0
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                                    : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                                }`}
                              >
                                {data.delta >= 0 ? `+${data.delta}` : data.delta}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Codeforces"
                  stroke="#318CE7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#318CE7' }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="LeetCode"
                  stroke="#FFA116"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#FFA116' }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Upcoming Contests Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming & Live Contests
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct contest registration and countdown timers
            </p>
          </div>

          {/* Platform Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {platformFilters.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedPlatform(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPlatform === tab.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contests Cards Grid */}
        {loadingContests ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-32" />
              </div>
            ))}
          </div>
        ) : contests.length === 0 ? (
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-10 text-center text-slate-400 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-sm">No Upcoming Contests Found</p>
            <p className="mt-1">Check back soon for newly scheduled contest rounds.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contests.map((contest) => {
              const isCoding = contest.phase === 'CODING';
              return (
                <div
                  key={contest.id}
                  className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Platform Tag & Countdown Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <PlatformIcon platform={contest.platform} className="w-4 h-4" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {contest.platform}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isCoding
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 animate-pulse'
                            : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60'
                        }`}
                      >
                        {getCountdown(contest.startTime)}
                      </span>
                    </div>

                    {/* Contest Name */}
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {contest.name}
                    </h4>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(contest.startTime).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration: {formatDuration(contest.durationSeconds)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Open Registration Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <a
                      href={contest.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span>{isCoding ? 'Join Contest' : 'Register / View Details'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestsPage;
