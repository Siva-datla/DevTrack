import CodeforcesService from './platforms/codeforcesService.js';
import LeetCodeService from './platforms/leetcodeService.js';
import PlatformAccount from '../models/PlatformAccount.js';

let contestCache = {
  timestamp: 0,
  data: [],
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class ContestService {
  /**
   * Helper: Computes next upcoming LeetCode Weekly and Biweekly contests.
   */
  static getUpcomingLeetCodeContests() {
    const contests = [];
    const now = new Date();

    // Next 2 Sundays for Weekly Contest (Sunday 02:30 UTC)
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      if (d.getUTCDay() === 0) { // Sunday
        const weeklyStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 2, 30, 0));
        if (weeklyStart > now) {
          contests.push({
            id: `lc-weekly-${weeklyStart.toISOString().slice(0, 10)}`,
            platform: 'LEETCODE',
            name: 'LeetCode Weekly Contest',
            type: 'CF/ICPC',
            phase: 'BEFORE',
            durationSeconds: 5400, // 90 min
            startTime: weeklyStart,
            endTime: new Date(weeklyStart.getTime() + 5400 * 1000),
            url: 'https://leetcode.com/contest/',
          });
          break; // Take closest upcoming
        }
      }
    }

    // Next Saturday for Biweekly Contest (Saturday 14:30 UTC)
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      if (d.getUTCDay() === 6) { // Saturday
        const biweeklyStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 14, 30, 0));
        if (biweeklyStart > now) {
          contests.push({
            id: `lc-biweekly-${biweeklyStart.toISOString().slice(0, 10)}`,
            platform: 'LEETCODE',
            name: 'LeetCode Biweekly Contest',
            type: 'CF/ICPC',
            phase: 'BEFORE',
            durationSeconds: 5400, // 90 min
            startTime: biweeklyStart,
            endTime: new Date(biweeklyStart.getTime() + 5400 * 1000),
            url: 'https://leetcode.com/contest/',
          });
          break;
        }
      }
    }

    return contests;
  }

  /**
   * Fetch upcoming and ongoing contests from Codeforces + LeetCode.
   */
  static async getContests() {
    const now = Date.now();
    if (contestCache.data.length > 0 && now - contestCache.timestamp < CACHE_TTL_MS) {
      return contestCache.data;
    }

    let cfContests = [];
    try {
      const response = await fetch('https://codeforces.com/api/contest.list?gym=false');
      const data = await response.json();
      if (data.status === 'OK' && Array.isArray(data.result)) {
        cfContests = data.result
          .filter((c) => c.phase === 'BEFORE' || c.phase === 'CODING')
          .map((c) => ({
            id: `cf-${c.id}`,
            platform: 'CODEFORCES',
            name: c.name,
            type: c.type,
            phase: c.phase,
            durationSeconds: c.durationSeconds,
            startTime: new Date(c.startTimeSeconds * 1000),
            endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000),
            url: `https://codeforces.com/contest/${c.id}`,
          }));
      }
    } catch (err) {
      console.warn('[ContestService] Could not fetch Codeforces contest feed:', err.message);
    }

    const lcContests = this.getUpcomingLeetCodeContests();
    const allContests = [...cfContests, ...lcContests].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    contestCache = {
      timestamp: now,
      data: allContests,
    };

    return allContests;
  }

  /**
   * Aggregate multi-platform rating history for a user.
   */
  static async getRatingHistory(userId) {
    const accounts = await PlatformAccount.find({ userId });
    const timeline = [];

    for (const acc of accounts) {
      if (acc.platform === 'CODEFORCES' && acc.username) {
        try {
          const cfHistory = await CodeforcesService.getRatingHistory(acc.username);
          if (Array.isArray(cfHistory)) {
            for (const h of cfHistory) {
              timeline.push({
                platform: 'CODEFORCES',
                handle: acc.username,
                contestId: String(h.contestId),
                contestName: h.contestName,
                rank: h.rank,
                oldRating: h.oldRating,
                newRating: h.newRating,
                ratingChange: h.newRating - h.oldRating,
                date: new Date(h.ratingUpdateTimeSeconds * 1000),
              });
            }
          }
        } catch (err) {
          console.warn(`[ContestService] Error fetching CF rating history for ${acc.username}:`, err.message);
        }
      }

      if (acc.platform === 'LEETCODE' && acc.username) {
        try {
          const lcRanking = await LeetCodeService.getContestRanking(acc.username);
          const history = lcRanking.userContestRankingHistory || [];
          let prevRating = 1500; // LeetCode baseline starting rating
          for (const h of history) {
            if (h.attended) {
              const currentRating = Math.round(h.rating);
              timeline.push({
                platform: 'LEETCODE',
                handle: acc.username,
                contestId: h.contest?.title ? h.contest.title.toLowerCase().replace(/\s+/g, '-') : null,
                contestName: h.contest?.title || 'LeetCode Contest',
                rank: h.ranking,
                oldRating: prevRating,
                newRating: currentRating,
                ratingChange: currentRating - prevRating,
                problemsSolved: h.problemsSolved,
                date: new Date(h.contest?.startTime * 1000),
              });
              prevRating = currentRating;
            }
          }
        } catch (err) {
          console.warn(`[ContestService] Error fetching LeetCode rating history for ${acc.username}:`, err.message);
        }
      }
    }

    // Sort chronologically ascending
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      connectedPlatforms: accounts.map((a) => ({
        platform: a.platform,
        username: a.username,
        rating: a.rating,
      })),
      totalEvents: timeline.length,
      history: timeline,
    };
  }
}

export default ContestService;
