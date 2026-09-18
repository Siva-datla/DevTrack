import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import Submission from '../models/Submission.js';
import PlatformAccount from '../models/PlatformAccount.js';
import DashboardService from '../services/dashboardService.js';
import SyncService from '../services/syncService.js';

/**
 * Helper: Resolve user ID from request (auth token, query param, or demo user fallback).
 */
const resolveUserId = async (req) => {
  if (req.user?._id) return req.user._id;
  if (req.user?.id) return req.user.id;
  if (req.query?.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
    return req.query.userId;
  }
  const demoUser = await SyncService.getOrCreateDemoUser();
  return demoUser?._id;
};

/**
 * Helper: Evaluates and updates a goal's progress and status dynamically.
 */
export const evaluateGoalProgress = async (goal, userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  let changed = false;

  if (goal.type === 'SOLVE_PROBLEMS') {
    const platformAccounts = await PlatformAccount.find({ userId: userObjectId });

    // Check if goal is scoped to a specific platform (via goal.platform or detected in title)
    let targetPlatform = goal.platform && goal.platform !== 'ALL' ? goal.platform.toUpperCase() : null;
    if (!targetPlatform && goal.title) {
      const lower = goal.title.toLowerCase();
      if (lower.includes('leetcode')) targetPlatform = 'LEETCODE';
      else if (lower.includes('codeforces')) targetPlatform = 'CODEFORCES';
      else if (lower.includes('hackerrank')) targetPlatform = 'HACKERRANK';
    }

    let officialSolved = 0;
    if (targetPlatform) {
      const acc = platformAccounts.find((a) => a.platform === targetPlatform);
      officialSolved = acc?.totalSolved || 0;
    } else {
      officialSolved = platformAccounts.reduce((sum, acc) => sum + (acc.totalSolved || 0), 0);
    }

    // Also check raw submissions count as fallback or if higher
    const subFilter = { userId: userObjectId, verdict: 'ACCEPTED' };
    if (targetPlatform) subFilter.platform = targetPlatform;
    const distinctSubs = await Submission.distinct('problemId', subFilter);

    const evaluatedVal = Math.max(officialSolved, distinctSubs.length);

    if (goal.currentValue !== evaluatedVal) {
      goal.currentValue = evaluatedVal;
      changed = true;
    }
  } else if (goal.type === 'STREAK') {
    const stats = await DashboardService.getOverviewStats(userObjectId);
    if (goal.currentValue !== stats.currentStreak) {
      goal.currentValue = stats.currentStreak;
      changed = true;
    }
  } else if (goal.type === 'RATING_TARGET') {
    const accounts = await PlatformAccount.find({ userId: userObjectId });

    let targetPlatform = goal.platform && goal.platform !== 'ALL' ? goal.platform.toUpperCase() : null;
    if (!targetPlatform && goal.title) {
      const lower = goal.title.toLowerCase();
      if (lower.includes('leetcode')) targetPlatform = 'LEETCODE';
      else if (lower.includes('codeforces')) targetPlatform = 'CODEFORCES';
      else if (lower.includes('hackerrank')) targetPlatform = 'HACKERRANK';
    }

    const relevantAccounts = targetPlatform
      ? accounts.filter((a) => a.platform === targetPlatform)
      : accounts;

    const ratings = relevantAccounts.map((acc) => acc.rating).filter((r) => typeof r === 'number' && !isNaN(r));
    const maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;
    if (goal.currentValue !== maxRating) {
      goal.currentValue = maxRating;
      changed = true;
    }
  }

  // Update status based on current value and deadline
  let newStatus = goal.status;
  if (goal.currentValue >= goal.target) {
    newStatus = 'COMPLETED';
  } else if (goal.status !== 'COMPLETED' && new Date() > new Date(goal.deadline)) {
    newStatus = 'FAILED';
  } else if (goal.status !== 'COMPLETED') {
    newStatus = 'IN_PROGRESS';
  }

  if (goal.status !== newStatus) {
    goal.status = newStatus;
    changed = true;
  }

  if (changed) {
    await goal.save();
  }

  return goal;
};

/**
 * GET /api/goals
 * Fetch all goals for the user, with progress dynamically evaluated.
 */
export const getGoals = async (req, res, next) => {
  try {
    const userId = await resolveUserId(req);
    const { status, type, platform } = req.query;

    const query = { userId };
    if (status) query.status = status.toUpperCase();
    if (type) query.type = type.toUpperCase();
    if (platform && platform.toUpperCase() !== 'ALL') query.platform = platform.toUpperCase();

    const goals = await Goal.find(query).sort({ deadline: 1 });

    // Evaluate progress dynamically for all active goals
    const updatedGoals = await Promise.all(
      goals.map(async (g) => {
        try {
          return await evaluateGoalProgress(g, userId);
        } catch {
          return g;
        }
      })
    );

    res.status(200).json({
      success: true,
      count: updatedGoals.length,
      data: updatedGoals,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/goals
 * Create a new goal.
 */
export const createGoal = async (req, res, next) => {
  try {
    const userId = await resolveUserId(req);
    const { title, type, target, deadline, platform = 'ALL' } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TITLE', message: 'Goal title is required.' },
      });
    }

    const validTypes = ['SOLVE_PROBLEMS', 'RATING_TARGET', 'TOPIC_MASTERY', 'STREAK'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: `Goal type must be one of: ${validTypes.join(', ')}`,
        },
      });
    }

    const numericTarget = Number(target);
    if (isNaN(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TARGET', message: 'Target must be a positive number.' },
      });
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DEADLINE', message: 'A valid deadline date is required.' },
      });
    }

    const goal = new Goal({
      userId,
      title: title.trim(),
      type,
      platform: platform ? platform.toUpperCase() : 'ALL',
      target: numericTarget,
      deadline: parsedDeadline,
      currentValue: 0,
      status: 'IN_PROGRESS',
    });

    // Compute initial currentValue
    await evaluateGoalProgress(goal, userId);
    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully.',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/goals/:id
 * Retrieve a specific goal.
 */
export const getGoalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid goal ID format.' },
      });
    }

    const userId = await resolveUserId(req);
    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found.' },
      });
    }

    await evaluateGoalProgress(goal, userId);

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/goals/:id
 * Update an existing goal.
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid goal ID format.' },
      });
    }

    const userId = await resolveUserId(req);
    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found.' },
      });
    }

    const { title, target, deadline, status, platform } = req.body;

    if (title && title.trim()) goal.title = title.trim();
    if (platform && ['ALL', 'LEETCODE', 'CODEFORCES', 'HACKERRANK'].includes(platform.toUpperCase())) {
      goal.platform = platform.toUpperCase();
    }
    if (target !== undefined) {
      const numTarget = Number(target);
      if (isNaN(numTarget) || numTarget <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TARGET', message: 'Target must be a positive number.' },
        });
      }
      goal.target = numTarget;
    }
    if (deadline) {
      const parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_DEADLINE', message: 'A valid deadline date is required.' },
        });
      }
      goal.deadline = parsedDeadline;
    }
    if (status && ['IN_PROGRESS', 'COMPLETED', 'FAILED'].includes(status.toUpperCase())) {
      goal.status = status.toUpperCase();
    }

    await evaluateGoalProgress(goal, userId);
    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully.',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/goals/:id
 * Delete a goal.
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid goal ID format.' },
      });
    }

    const userId = await resolveUserId(req);
    const result = await Goal.findOneAndDelete({ _id: id, userId });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found or unauthorized.' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  evaluateGoalProgress,
};
