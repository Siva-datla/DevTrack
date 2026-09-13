/**
 * Health check controller
 * Handles system health and status verification requests.
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DevTrack Backend API'
  });
};

export const healthCheck = getHealth;

export default {
  getHealth,
  healthCheck
};
