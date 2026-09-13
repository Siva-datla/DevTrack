/**
 * Submissions Controller
 * Handles querying synced submissions across platforms.
 */

export const getSubmissions = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get submissions list template'
  });
};

export const getSubmissionById = async (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `Get submission ${id} details template`
  });
};

export default {
  getSubmissions,
  getSubmissionById
};
