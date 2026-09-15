import bcrypt from 'bcrypt';
import User from '../models/User.js';
import PlatformAccount from '../models/PlatformAccount.js';

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
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }

    if (name && name.trim()) {
      user.name = name.trim();
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
          name: user.name,
          email: user.email,
          role: user.role,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getMe,
  updateMe,
};
