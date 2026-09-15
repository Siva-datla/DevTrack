import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devtrack_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'devtrack_jwt_refresh_key_2026';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate Access Token for authenticated user.
 * @param {object} user - User document or object with _id, email, role
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role || 'USER',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Generate Refresh Token for renewing sessions.
 * @param {object} user - User document or object with _id
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

/**
 * Verify an Access Token.
 * @param {string} token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify a Refresh Token.
 * @param {string} token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
