import bcrypt from 'bcrypt';
import User from '../models/User.js';
import PlatformAccount from '../models/PlatformAccount.js';
import Submission from '../models/Submission.js';
import Goal from '../models/Goal.js';
import ContestService from '../services/contestService.js';

/**
 * Get current authenticated user profile and connected platforms
 * GET /api/users/me
 */
export const getMe = async (req, res, next) => {
  try {
    const platforms = await PlatformAccount.find({ userId: req.user._id }).select(
      'platform username syncStatus rating totalSolved lastSyncedAt'
    );

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        platforms,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update current authenticated user profile
 * PUT /api/users/me
 */
export const updateMe = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      avatar,
      website,
      githubHandle,
      linkedinHandle,
      preferredPlatform,
      currentPassword,
      newPassword,
    } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }

    if (name && name.trim()) user.name = name.trim();
    if (bio !== undefined) user.bio = String(bio).trim();
    if (avatar !== undefined) user.avatar = String(avatar).trim();
    if (website !== undefined) user.website = String(website).trim();
    if (githubHandle !== undefined) user.githubHandle = String(githubHandle).trim();
    if (linkedinHandle !== undefined) user.linkedinHandle = String(linkedinHandle).trim();
    if (
      preferredPlatform &&
      ['ALL', 'LEETCODE', 'CODEFORCES', 'HACKERRANK'].includes(preferredPlatform.toUpperCase())
    ) {
      user.preferredPlatform = preferredPlatform.toUpperCase();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CURRENT_PASSWORD_REQUIRED',
            message: 'Current password is required to set a new password.',
          },
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password does not match.',
          },
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORD_TOO_SHORT',
            message: 'New password must be at least 6 characters long.',
          },
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
          avatar: user.avatar,
          website: user.website,
          githubHandle: user.githubHandle,
          linkedinHandle: user.linkedinHandle,
          preferredPlatform: user.preferredPlatform,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Export complete developer data as JSON
 * GET /api/users/me/export
 */
export const exportUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }

    const [platforms, submissions, goals, contestHistory] = await Promise.all([
      PlatformAccount.find({ userId }).select('-__v'),
      Submission.find({ userId }).select('-__v').sort({ submittedAt: -1 }),
      Goal.find({ userId }).select('-__v').sort({ createdAt: -1 }),
      ContestService.getRatingHistory(userId).catch(() => null),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        avatar: user.avatar || '',
        website: user.website || '',
        githubHandle: user.githubHandle || '',
        linkedinHandle: user.linkedinHandle || '',
        preferredPlatform: user.preferredPlatform || 'ALL',
        createdAt: user.createdAt,
      },
      platforms: platforms.map((p) => ({
        platform: p.platform,
        username: p.username,
        rating: p.rating,
        totalSolved: p.totalSolved,
        syncStatus: p.syncStatus,
        lastSyncedAt: p.lastSyncedAt,
      })),
      goals: goals.map((g) => ({
        title: g.title,
        type: g.type,
        platform: g.platform,
        target: g.target,
        currentValue: g.currentValue,
        deadline: g.deadline,
        status: g.status,
        createdAt: g.createdAt,
      })),
      contests: contestHistory?.history || [],
      submissionsCount: submissions.length,
      submissions: submissions.map((s) => ({
        platform: s.platform,
        problemId: s.problemId,
        title: s.title,
        verdict: s.verdict,
        language: s.language,
        submittedAt: s.submittedAt,
        runtime: s.runtime,
        memory: s.memory,
      })),
    };

    const safeName = (user.name || 'developer').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `devtrack-export-${safeName}-${new Date().toISOString().slice(0, 10)}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(JSON.stringify(exportPayload, null, 2));
  } catch (err) {
    next(err);
  }
};

export default {
  getMe,
  updateMe,
  exportUserData,
};
