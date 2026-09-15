import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Middleware: Requires valid Bearer JWT access token.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. No authentication token provided.',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired. Please refresh your token.',
          },
        });
      }
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Authentication token is invalid.',
        },
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User belonging to this token no longer exists.',
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Optionally verifies Bearer JWT access token.
 * Populates req.user if valid token present, otherwise req.user = null.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      req.user = user || null;
    } catch {
      req.user = null;
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Requires ADMIN role.
 * Must be placed after requireAuth.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied. Administrator privileges required.',
      },
    });
  }
  next();
};

export default {
  requireAuth,
  optionalAuth,
  requireAdmin,
};
