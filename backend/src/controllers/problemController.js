import mongoose from 'mongoose';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import SyncService from '../services/syncService.js';

/**
 * Helper: Resolve userId if present.
 */
const resolveUserId = async (req) => {
  if (req.user?._id) return req.user._id;
  if (req.user?.id) return req.user.id;
  if (req.query?.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
    return req.query.userId;
  }
  return null;
};

/**
 * GET /api/problems
 * Query, search, filter, and paginate canonical problems across platforms.
 * Enriches each problem with user solve status (SOLVED, ATTEMPTED, UNSOLVED) if authenticated.
 */
export const getProblems = async (req, res, next) => {
  try {
    const {
      q,
      search,
      platform,
      difficulty,
      tag,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    // Search keyword
    const searchTerm = q || search;
    if (searchTerm && searchTerm.trim()) {
      const regex = new RegExp(searchTerm.trim(), 'i');
      filter.$or = [{ title: regex }, { externalId: regex }];
    }

    // Platform filter
    if (platform && ['CODEFORCES', 'LEETCODE', 'HACKERRANK'].includes(platform.toUpperCase())) {
      filter.platform = platform.toUpperCase();
    }

    // Difficulty filter
    if (difficulty && ['EASY', 'MEDIUM', 'HARD', 'UNRATED'].includes(difficulty.toUpperCase())) {
      filter.difficulty = difficulty.toUpperCase();
    }

    // Tag filter
    if (tag && tag.trim()) {
      filter.tags = { $regex: new RegExp(`^${tag.trim()}$`, 'i') };
    }

    const userId = await resolveUserId(req);

    // If filtering by user solve status (SOLVED / ATTEMPTED / UNSOLVED), resolve problem IDs
    if (status && userId) {
      const statusUpper = status.toUpperCase();
      if (statusUpper === 'SOLVED') {
        const solvedProblemIds = await Submission.distinct('problemId', {
          userId,
          verdict: 'ACCEPTED',
        });
        filter.externalId = { $in: solvedProblemIds };
      } else if (statusUpper === 'ATTEMPTED') {
        const attemptedProblemIds = await Submission.distinct('problemId', {
          userId,
          verdict: { $ne: 'ACCEPTED' },
        });
        const solvedProblemIds = await Submission.distinct('problemId', {
          userId,
          verdict: 'ACCEPTED',
        });
        // Attempted but not yet solved
        const onlyAttempted = attemptedProblemIds.filter((id) => !solvedProblemIds.includes(id));
        filter.externalId = { $in: onlyAttempted };
      } else if (statusUpper === 'UNSOLVED') {
        const anySubmissionIds = await Submission.distinct('problemId', { userId });
        filter.externalId = { $nin: anySubmissionIds };
      }
    }

    const sortOption = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    sortOption[sortBy] = order;

    const [total, problems] = await Promise.all([
      Problem.countDocuments(filter),
      Problem.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
    ]);

    // Annotate user solve status if authenticated
    let enrichedProblems = problems;
    if (userId && problems.length > 0) {
      const problemIds = problems.map((p) => p.externalId);
      const userSubs = await Submission.find({
        userId,
        problemId: { $in: problemIds },
      }).select('problemId verdict').lean();

      const statusMap = new Map();
      for (const sub of userSubs) {
        const prev = statusMap.get(sub.problemId);
        if (sub.verdict === 'ACCEPTED' || prev === 'SOLVED') {
          statusMap.set(sub.problemId, 'SOLVED');
        } else {
          statusMap.set(sub.problemId, 'ATTEMPTED');
        }
      }

      enrichedProblems = problems.map((p) => ({
        ...p,
        userStatus: statusMap.get(p.externalId) || 'UNSOLVED',
      }));
    }

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
      data: enrichedProblems,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/problems/:id
 * Retrieve problem details by ID or externalId, with user submission history if authenticated.
 */
export const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let problem = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      problem = await Problem.findById(id).lean();
    }
    if (!problem) {
      problem = await Problem.findOne({ externalId: id }).lean();
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROBLEM_NOT_FOUND', message: `Problem with ID "${id}" not found.` },
      });
    }

    const userId = await resolveUserId(req);
    let userStatus = 'UNSOLVED';
    let userSubmissions = [];

    if (userId) {
      userSubmissions = await Submission.find({
        userId,
        problemId: problem.externalId,
      })
        .sort({ submittedAt: -1 })
        .limit(10)
        .lean();

      if (userSubmissions.some((s) => s.verdict === 'ACCEPTED')) {
        userStatus = 'SOLVED';
      } else if (userSubmissions.length > 0) {
        userStatus = 'ATTEMPTED';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...problem,
        userStatus,
        recentSubmissions: userSubmissions,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getProblems,
  getProblemById,
};
