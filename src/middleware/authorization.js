/**
 * Authorization Middleware
 * Checks user roles and permissions
 */

const { sendErrorResponse } = require('../utils/apiResponse');

/**
 * Check if user has required role
 * @param {...string} allowedRoles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(
        res,
        'User authentication required',
        401,
        'UNAUTHORIZED'
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        'Insufficient permissions to access this resource',
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = authorize('admin');

/**
 * Check if user is security guard or admin
 */
const isSecurityOrAdmin = authorize('security_guard', 'admin');

/**
 * Check if user is receptionist or admin
 */
const isReceptionistOrAdmin = authorize('receptionist', 'admin');

module.exports = {
  authorize,
  isAdmin,
  isSecurityOrAdmin,
  isReceptionistOrAdmin,
};
