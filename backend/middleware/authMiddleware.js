const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes middleware - verifies JWT token from Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token missing'
        });
      }

      // Verify token
      const secret = process.env.JWT_SECRET || 'careerpilot_dev_jwt_secret_key_2026';
      const decoded = jwt.verify(token, secret);

      // Get user from token ID (excluding password)
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      // Attach user object to request
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing'
    });
  }
};

/**
 * Optional Auth middleware - verifies JWT if present, but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null') {
        const secret = process.env.JWT_SECRET || 'careerpilot_dev_jwt_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      }
    } catch (error) {
      // Ignore error for optional auth and proceed
    }
  }

  return next();
};

/**
 * Admin authorization middleware - ensures req.user has admin role
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};

module.exports = { protect, optionalAuth, adminOnly };
