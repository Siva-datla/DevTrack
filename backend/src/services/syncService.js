// backend/src/services/syncService.js
import User from '../models/User.js';
import PlatformAccount from '../models/PlatformAccount.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import CodeforcesService from './platforms/codeforcesService.js';
import LeetCodeService from './platforms/leetcodeService.js';
import HackerRankService from './platforms/hackerrankService.js';
import {
  normalizeCodeforcesSubmission,
  normalizeLeetCodeSubmission,
  normalizeHackerRankSubmission,
  mapCodeforcesDifficulty,
} from '../utils/normalizer.js';

export class SyncService {
  /**
   * Helper: Get or create a default demo user for testing while Auth is on hold.
   */
  static async getOrCreateDemoUser() {
    let user = await User.findOne({ email: 'demo@devtrack.local' });
    if (!user) {
      user = await User.create({
        name: 'Demo Developer',
        email: 'demo@devtrack.local',
        password: 'demo_password_hash',
        role: 'USER',
      });
    }
    return user;
  }

  /**
   * Helper: Resolve userId for a platform handle.
   * Checks req.user, req.query.userId, connected PlatformAccount, or demo user.
   */
  static async resolveUserId(platform, username, req = {}) {
    if (req?.user?._id) return req.user._id;
    if (req?.user?.id) return req.user.id;
    if (req?.query?.userId) return req.query.userId;

    try {
      const account = await PlatformAccount.findOne({
        platform: platform.toUpperCase(),
        username: { $regex: new RegExp(`^${username}$`, 'i') },
      });
      if (account?.userId) return account.userId;
    } catch {
      // Ignore DB error
    }

    try {
      const demoUser = await this.getOrCreateDemoUser();
      return demoUser?._id || null;
    } catch {
      return null;
    }
  }

  /**
   * Synchronize a Codeforces handle into DevTrack.
   * @param {string} handle - Codeforces username
   */
  static async syncCodeforces(handle, userId = null) {
    const targetUserId = userId || (await this.getOrCreateDemoUser())._id;

    // 1. Verify user on Codeforces
    const cfUser = await CodeforcesService.getUserInfo(handle);

    // 2. Link or update PlatformAccount in DB
    const account = await PlatformAccount.findOneAndUpdate(
      { userId: targetUserId, platform: 'CODEFORCES' },
      {
        username: cfUser.handle,
        syncStatus: 'SYNCING',
        rating: cfUser.rating || null,
      },
      { upsert: true, returnDocument: 'after' }
    );

    try {
      // 3. Fetch submissions
      const rawSubmissions = await CodeforcesService.getSubmissions(cfUser.handle, 500);

      // 4. Normalize submissions
      const normalizedSubs = rawSubmissions.map((sub) =>
        normalizeCodeforcesSubmission(sub, targetUserId)
      );

      // 5. Bulk Upsert Submissions into MongoDB
      if (normalizedSubs.length > 0) {
        const bulkOperations = normalizedSubs.map((sub) => ({
          updateOne: {
            filter: {
              userId: targetUserId,
              platform: 'CODEFORCES',
              platformSubmissionId: sub.platformSubmissionId,
            },
            update: { $set: sub },
            upsert: true,
          },
        }));

        await Submission.bulkWrite(bulkOperations);

        // 5b. Upsert canonical Problem records
        const problemOps = [];
        const seenProblems = new Set();
        for (const raw of rawSubmissions) {
          const prob = raw.problem || {};
          const contestId = prob.contestId || raw.contestId || null;
          const index = prob.index || '';
          const externalId = contestId && index ? `${contestId}${index}` : (index || 'UNKNOWN');

          if (externalId !== 'UNKNOWN' && !seenProblems.has(externalId)) {
            seenProblems.add(externalId);
            problemOps.push({
              updateOne: {
                filter: { platform: 'CODEFORCES', externalId },
                update: {
                  $set: {
                    platform: 'CODEFORCES',
                    externalId,
                    title: prob.name || `Problem ${externalId}`,
                    difficulty: mapCodeforcesDifficulty(prob.rating),
                    url: contestId && index ? `https://codeforces.com/contest/${contestId}/problem/${index}` : '',
                    tags: prob.tags || [],
                  },
                },
                upsert: true,
              },
            });
          }
        }

        if (problemOps.length > 0) {
          await Problem.bulkWrite(problemOps);
        }
      }

      // 6. Calculate total unique problems solved (ACCEPTED)
      const solvedProblems = await Submission.distinct('problemId', {
        userId: targetUserId,
        platform: 'CODEFORCES',
        verdict: 'ACCEPTED',
      });

      // 7. Update PlatformAccount with success stats
      account.syncStatus = 'SUCCESS';
      account.lastSyncedAt = new Date();
      account.totalSolved = solvedProblems.length;
      account.rating = cfUser.rating || null;
      await account.save();

      return {
        success: true,
        handle: cfUser.handle,
        rating: cfUser.rating || 'Unrated',
        rank: cfUser.rank || 'Unrated',
        totalSubmissionsFetched: normalizedSubs.length,
        totalUniqueSolved: solvedProblems.length,
        lastSyncedAt: account.lastSyncedAt,
      };
    } catch (err) {
      account.syncStatus = 'FAILED';
      await account.save();
      throw err;
    }
  }

  /**
   * Synchronize a LeetCode handle into DevTrack.
   * @param {string} handle - LeetCode username
   * @param {string|null} userId - Optional user ID
   */
  static async syncLeetCode(handle, userId = null) {
    const targetUserId = userId || (await this.getOrCreateDemoUser())._id;

    // 1. Verify user profile on LeetCode
    const lcUser = await LeetCodeService.getUserProfile(handle);

    // 2. Link or update PlatformAccount in DB
    const account = await PlatformAccount.findOneAndUpdate(
      { userId: targetUserId, platform: 'LEETCODE' },
      {
        username: lcUser.username,
        syncStatus: 'SYNCING',
        totalSolved: lcUser.totalSolved,
        rating: lcUser.ranking || null,
      },
      { upsert: true, returnDocument: 'after' }
    );

    try {
      // 3. Fetch recent accepted submissions
      const rawSubmissions = await LeetCodeService.getRecentSubmissions(lcUser.username, 50);

      // 4. Normalize submissions
      const normalizedSubs = rawSubmissions.map((sub) =>
        normalizeLeetCodeSubmission(sub, targetUserId)
      );

      // 5. Bulk Upsert into MongoDB to prevent duplicates
      if (normalizedSubs.length > 0) {
        const bulkOperations = normalizedSubs.map((sub) => ({
          updateOne: {
            filter: {
              userId: targetUserId,
              platform: 'LEETCODE',
              platformSubmissionId: sub.platformSubmissionId,
            },
            update: { $set: sub },
            upsert: true,
          },
        }));

        await Submission.bulkWrite(bulkOperations);

        // 5b. Upsert canonical Problem records
        const problemOps = [];
        const seenProblems = new Set();
        for (const sub of normalizedSubs) {
          if (sub.problemId && sub.problemId !== 'UNKNOWN' && !seenProblems.has(sub.problemId)) {
            seenProblems.add(sub.problemId);
            problemOps.push({
              updateOne: {
                filter: { platform: 'LEETCODE', externalId: sub.problemId },
                update: {
                  $set: {
                    platform: 'LEETCODE',
                    externalId: sub.problemId,
                    title: sub.problemName,
                    difficulty: sub.difficulty,
                    url: `https://leetcode.com/problems/${sub.problemId}/`,
                    tags: sub.tags || [],
                  },
                },
                upsert: true,
              },
            });
          }
        }

        if (problemOps.length > 0) {
          await Problem.bulkWrite(problemOps);
        }
      }

      // 6. Update PlatformAccount with success status
      account.syncStatus = 'SUCCESS';
      account.lastSyncedAt = new Date();
      account.totalSolved = lcUser.totalSolved;
      await account.save();

      return {
        success: true,
        handle: lcUser.username,
        ranking: lcUser.ranking,
        totalSolved: lcUser.totalSolved,
        breakdown: {
          easy: lcUser.easySolved,
          medium: lcUser.mediumSolved,
          hard: lcUser.hardSolved,
        },
        recentSubmissionsSynced: normalizedSubs.length,
        lastSyncedAt: account.lastSyncedAt,
      };
    } catch (err) {
      account.syncStatus = 'FAILED';
      await account.save();
      throw err;
    }
  }

  /**
   * Synchronize a HackerRank handle into DevTrack.
   * @param {string} handle - HackerRank username
   * @param {string|null} userId - Optional user ID
   */
  static async syncHackerRank(handle, userId = null) {
    const targetUserId = userId || (await this.getOrCreateDemoUser())._id;

    // 1. Fetch user profile, badges, scores, and recent challenges
    const { profile, badges, scores, recentChallenges } = await HackerRankService.getUserFullData(handle);

    const totalSolved = Array.isArray(badges)
      ? badges.reduce((sum, b) => sum + (b.solved || 0), 0)
      : 0;

    const topScore = Array.isArray(scores)
      ? scores.find((s) => s.slug === 'algorithms' || s.slug === 'data-structures' || s.slug === 'python')
      : null;
    const primaryRating = topScore?.practice?.score
      ? Math.round(topScore.practice.score)
      : (profile.level || null);

    // 2. Link or update PlatformAccount in DB
    const account = await PlatformAccount.findOneAndUpdate(
      { userId: targetUserId, platform: 'HACKERRANK' },
      {
        username: profile.username,
        syncStatus: 'SYNCING',
        totalSolved,
        rating: primaryRating,
      },
      { upsert: true, returnDocument: 'after' }
    );

    try {
      // 3. Enrich recent challenges with details (difficulty & domain/track tags)
      const enrichedChallenges = await Promise.all(
        recentChallenges.map(async (ch) => {
          const slug = ch.ch_slug || ch.slug || ch.challenge_id;
          const details = await HackerRankService.getChallengeDetails(slug);
          return {
            ...ch,
            name: details.name || ch.name || slug,
            difficulty: details.difficulty,
            tags: details.tags || [],
          };
        })
      );

      // 4. Normalize recent challenges into unified submissions
      const normalizedSubs = enrichedChallenges.map((ch) =>
        normalizeHackerRankSubmission(ch, targetUserId)
      );

      // 5. Bulk Upsert into MongoDB
      if (normalizedSubs.length > 0) {
        const bulkOperations = normalizedSubs.map((sub) => ({
          updateOne: {
            filter: {
              userId: targetUserId,
              platform: 'HACKERRANK',
              platformSubmissionId: sub.platformSubmissionId,
            },
            update: { $set: sub },
            upsert: true,
          },
        }));

        await Submission.bulkWrite(bulkOperations);

        // 5b. Upsert canonical Problem records with real names, difficulty, and tags
        const problemOps = [];
        const seenProblems = new Set();
        for (const ch of enrichedChallenges) {
          const externalId = ch.ch_slug || ch.slug || ch.challenge_id || ch.name;
          if (externalId && !seenProblems.has(externalId)) {
            seenProblems.add(externalId);
            const difficulty = ch.difficulty || 'MEDIUM';
            const url = ch.url
              ? (ch.url.startsWith('http') ? ch.url : `https://www.hackerrank.com${ch.url}`)
              : `https://www.hackerrank.com/challenges/${externalId}`;
            const tags = ch.tags || [];

            problemOps.push({
              updateOne: {
                filter: { platform: 'HACKERRANK', externalId },
                update: {
                  $set: {
                    platform: 'HACKERRANK',
                    externalId,
                    title: ch.name || externalId,
                    difficulty,
                    url,
                    tags,
                  },
                },
                upsert: true,
              },
            });
          }
        }

        if (problemOps.length > 0) {
          await Problem.bulkWrite(problemOps);
        }
      }

      // 5. Update PlatformAccount with success status
      account.syncStatus = 'SUCCESS';
      account.lastSyncedAt = new Date();
      account.totalSolved = totalSolved;
      account.rating = primaryRating;
      await account.save();

      return {
        success: true,
        handle: profile.username,
        name: profile.name,
        level: profile.level,
        badgesCount: badges.length,
        totalSolved,
        recentSubmissionsSynced: normalizedSubs.length,
        lastSyncedAt: account.lastSyncedAt,
      };
    } catch (err) {
      account.syncStatus = 'FAILED';
      await account.save();
      throw err;
    }
  }
}

export default SyncService;