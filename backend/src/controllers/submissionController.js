import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import DashboardService from '../services/dashboardService.js';

/**
 * Submissions Controller
 * Handles querying synced submissions across platforms with pagination and filtering.
 */

/**
 * GET /api/submissions
 * Query submissions with flexible filters, pagination, and sorting.
 */
export const getSubmissions = async (req, res, next) => {
  try {
    const filter = {};

    // 1. Resolve user filter
    const userIdentifier =
      req.query.user ||
      req.query.username ||
      req.query.userId ||
      req.query.handle ||
      req.user?._id ||
      req.user?.id;

    if (userIdentifier) {
      const resolvedId = await DashboardService.resolveUserId(userIdentifier);
      if (resolvedId) {
        filter.userId = resolvedId;
      }
    }

    // 2. Platform filter (CODEFORCES, LEETCODE, HACKERRANK)
    if (req.query.platform) {
      filter.platform = String(req.query.platform).toUpperCase();
    }

    // 3. Verdict filter (e.g. ACCEPTED, WRONG_ANSWER, OK)
    if (req.query.verdict) {
      filter.verdict = String(req.query.verdict).toUpperCase();
    }

    // 4. Difficulty filter (EASY, MEDIUM, HARD, UNRATED)
    if (req.query.difficulty) {
      filter.difficulty = String(req.query.difficulty).toUpperCase();
    }

    // 5. Language filter
    if (req.query.language) {
      filter.language = { $regex: new RegExp(req.query.language.trim(), 'i') };
    }

    // 6. Search problem title or problem ID
    if (req.query.search) {
      const searchRegex = { $regex: new RegExp(req.query.search.trim(), 'i') };
      filter.$or = [{ problemName: searchRegex }, { problemId: searchRegex }];
    }

    // 7. Date range filters
    if (req.query.startDate || req.query.endDate) {
      filter.submittedAt = {};
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (!isNaN(start.getTime())) filter.submittedAt.$gte = start;
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (!isNaN(end.getTime())) filter.submittedAt.$lte = end;
      }
    }

    // 8. Pagination parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    // 9. Sorting
    const allowedSortFields = ['submittedAt', 'problemName', 'difficulty', 'createdAt'];
    const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'submittedAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    // 10. Execute queries in parallel
    const [total, submissions] = await Promise.all([
      Submission.countDocuments(filter),
      Submission.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        user: userIdentifier || null,
        platform: req.query.platform || null,
        verdict: req.query.verdict || null,
        difficulty: req.query.difficulty || null,
        language: req.query.language || null,
        search: req.query.search || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
      },
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/submissions/stats
 * Aggregated summary statistics for submissions.
 */
export const getSubmissionsStats = async (req, res, next) => {
  try {
    const filter = {};
    const userIdentifier =
      req.query.user ||
      req.query.username ||
      req.query.userId ||
      req.query.handle ||
      req.user?._id ||
      req.user?.id;

    if (userIdentifier) {
      const resolvedId = await DashboardService.resolveUserId(userIdentifier);
      if (resolvedId) filter.userId = resolvedId;
    }

    const [totalSubmissions, acceptedSubmissions, byPlatform, byDifficulty] = await Promise.all([
      Submission.countDocuments(filter),
      Submission.countDocuments({ ...filter, verdict: 'ACCEPTED' }),
      Submission.aggregate([
        { $match: filter },
        { $group: { _id: '$platform', count: { $sum: 1 } } },
      ]),
      Submission.aggregate([
        { $match: { ...filter, verdict: 'ACCEPTED' } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
    ]);

    const platformBreakdown = {
      CODEFORCES: 0,
      LEETCODE: 0,
      HACKERRANK: 0,
    };
    byPlatform.forEach((p) => {
      if (p._id) platformBreakdown[p._id] = p.count;
    });

    const difficultyBreakdown = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      UNRATED: 0,
    };
    byDifficulty.forEach((d) => {
      if (d._id) difficultyBreakdown[d._id] = d.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        acceptedSubmissions,
        byPlatform: platformBreakdown,
        byDifficulty: difficultyBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/submissions/:id
 * Retrieve single submission by MongoDB ObjectId or platformSubmissionId.
 */
export const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let submission = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      submission = await Submission.findById(id).lean();
    }

    if (!submission) {
      submission = await Submission.findOne({ platformSubmissionId: id }).lean();
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: `Submission "${id}" was not found.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getSubmissions,
  getSubmissionsStats,
  getSubmissionById,
};
