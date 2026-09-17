import User from '../models/User.js';
import Submission from '../models/Submission.js';
import PlatformAccount from '../models/PlatformAccount.js';
import Problem from '../models/Problem.js';
import mongoose from 'mongoose';

/**
 * Calculates current and longest consecutive daily streaks.
 * @param {string[]} sortedDateStrings - Array of 'YYYY-MM-DD' dates in ascending order
 */
export const calculateStreaks = (sortedDateStrings) => {
  if (!sortedDateStrings || sortedDateStrings.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const dates = sortedDateStrings.map((d) => new Date(`${d}T00:00:00Z`).getTime());

  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round((dates[i] - dates[i - 1]) / oneDayMs);
    if (diff === 1) {
      tempStreak++;
    } else if (diff > 1) {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Calculate current streak relative to today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMs = new Date(`${todayStr}T00:00:00Z`).getTime();
  const lastActiveDate = dates[dates.length - 1];
  const diffFromToday = Math.round((todayMs - lastActiveDate) / oneDayMs);

  let currentStreak = 0;
  if (diffFromToday === 0 || diffFromToday === 1) {
    currentStreak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const diff = Math.round((dates[i] - dates[i - 1]) / oneDayMs);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
};

export class DashboardService {
  /**
   * Resolves a userId from an identifier (MongoDB ID, platform handle, or email).
   * Falls back to demo user if no identifier is passed.
   */
  static async resolveUserId(identifier) {
    // 1. If no identifier provided, fallback to demo user
    if (!identifier) {
      const demoUser = await User.findOne({ email: 'demo@devtrack.local' });
      return demoUser?._id;
    }

    // 2. Check if it's already a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const user = await User.findById(identifier);
      if (user) return user._id;
    }

    // 3. Check if it matches a connected platform handle (Codeforces / LeetCode / HackerRank)
    const platformAccount = await PlatformAccount.findOne({
      username: { $regex: new RegExp(`^${identifier}$`, 'i') },
    });
    if (platformAccount) return platformAccount.userId;

    // 4. Check if it matches a User's email or name
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { name: { $regex: new RegExp(`^${identifier}$`, 'i') } },
      ],
    });
    if (user) return user._id;

    return null;
  }

  /**
   * Unified summary metrics across all platforms
   */
  static async getOverviewStats(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Total unique problems solved (ACCEPTED)
    const uniqueSolved = await Submission.distinct('problemId', {
      userId: userObjectId,
      verdict: 'ACCEPTED',
    });

    // 2. Connected platform accounts with their handle & rating
    const platforms = await PlatformAccount.find({ userId: userObjectId }).select(
      'platform username rating totalSolved syncStatus lastSyncedAt -_id'
    );

    // 3. Difficulty distribution (EASY, MEDIUM, HARD, UNRATED)
    const difficultyAgg = await Submission.aggregate([
      { $match: { userId: userObjectId, verdict: 'ACCEPTED' } },
      { $group: { _id: '$difficulty', uniqueProblems: { $addToSet: '$problemId' } } },
      { $project: { _id: 0, difficulty: '$_id', count: { $size: '$uniqueProblems' } } },
    ]);

    const difficultyBreakdown = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      UNRATED: 0,
    };
    difficultyAgg.forEach((d) => {
      difficultyBreakdown[d.difficulty] = d.count;
    });

    // 4. Streaks
    const activeDatesAgg = await Submission.aggregate([
      { $match: { userId: userObjectId, verdict: 'ACCEPTED' } },
      {
        $project: {
          dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
        },
      },
      { $group: { _id: '$dateStr' } },
      { $sort: { _id: 1 } },
    ]);

    const sortedDates = activeDatesAgg.map((d) => d._id);
    const { currentStreak, longestStreak } = calculateStreaks(sortedDates);

    return {
      totalSolved: uniqueSolved.length,
      currentStreak,
      longestStreak,
      platforms,
      difficulty: difficultyBreakdown,
    };
  }

  /**
   * Aggregates activity counts by date for GitHub-style heatmap
   */
  static async getHeatmapData(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const heatmap = await Submission.aggregate([
      { $match: { userId: userObjectId, verdict: 'ACCEPTED' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: '$count',
        },
      },
    ]);

    return heatmap;
  }

  /**
   * Aggregates topic / tag mastery analysis across accepted submissions.
   */
  static async getTopicAnalytics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Get unique solved problem IDs
    const solvedProblemIds = await Submission.distinct('problemId', {
      userId: userObjectId,
      verdict: 'ACCEPTED',
    });

    if (solvedProblemIds.length === 0) {
      return {
        totalTopics: 0,
        totalSolved: 0,
        topics: [],
        topTopics: [],
      };
    }

    // 2. Fetch tags from canonical Problem collection
    const problems = await Problem.find({
      externalId: { $in: solvedProblemIds },
    }).select('externalId tags difficulty platform').lean();

    const topicCounts = new Map();

    for (const prob of problems) {
      const tags = (prob.tags && prob.tags.length > 0) ? prob.tags : ['General Practice'];
      for (const tag of tags) {
        const cleanTag = tag.trim().toLowerCase();
        if (cleanTag) {
          topicCounts.set(cleanTag, (topicCounts.get(cleanTag) || 0) + 1);
        }
      }
    }

    // If problems weren't tagged yet, add a baseline topic
    if (topicCounts.size === 0) {
      topicCounts.set('general problem solving', solvedProblemIds.length);
    }

    const ACRONYM_MAP = {
      dp: 'Dynamic Programming',
      dsu: 'Disjoint Set Union',
      bit: 'Binary Indexed Tree',
      fft: 'Fast Fourier Transform',
      dfs: 'DFS',
      bfs: 'BFS',
      sql: 'SQL',
    };

    const formatTopicName = (name) => {
      const lower = name.toLowerCase().trim();
      if (ACRONYM_MAP[lower]) return ACRONYM_MAP[lower];
      return name
        .split(/[\s-]+/)
        .map((word) => {
          const wLower = word.toLowerCase();
          if (ACRONYM_MAP[wLower]) return ACRONYM_MAP[wLower];
          if (wLower === 'and' || wLower === 'or' || wLower === 'of') return wLower;
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    };

    const totalSolved = solvedProblemIds.length;
    const sortedTopics = [...topicCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        const percentage = Math.round((count / totalSolved) * 100);
        let masteryLevel = 'Beginner';
        if (count >= 30) masteryLevel = 'Advanced';
        else if (count >= 10) masteryLevel = 'Intermediate';

        return {
          topic: formatTopicName(name),
          count,
          percentage: Math.min(100, percentage),
          masteryLevel,
        };
      });

    return {
      totalTopics: sortedTopics.length,
      totalSolved,
      topics: sortedTopics,
      topTopics: sortedTopics.slice(0, 5),
    };
  }
}

export default DashboardService;