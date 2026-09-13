/**
 * Problems Controller
 * Handles querying canonical problems and solve statuses.
 */

export const getProblems = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get problems list template'
  });
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `Get problem ${id} details template`
  });
};

export default {
  getProblems,
  getProblemById
};
