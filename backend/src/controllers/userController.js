/**
 * User & Profile Controller
 * Handles user profile retrieval and updates.
 */

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get current user profile template'
  });
};

export const updateMe = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update current user profile template'
  });
};

export default {
  getMe,
  updateMe
};
