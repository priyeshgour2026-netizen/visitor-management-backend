/**
 * Error Handling Middleware
 * Centralizes error handling for the application
 */

const { sendErrorResponse } = require('../utils/apiResponse');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ');
    return sendErrorResponse(res, messages, 400, 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendErrorResponse(
      res,
      `${field} already exists`,
      400,
      'DUPLICATE_ERROR'
    );
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return sendErrorResponse(
      res,
      'Invalid ID format',
      400,
      'CAST_ERROR'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, 'Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 'Token has expired', 401, 'TOKEN_EXPIRED');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendErrorResponse(res, 'File size too large', 400, 'FILE_SIZE_ERROR');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return sendErrorResponse(res, 'Too many files', 400, 'FILE_COUNT_ERROR');
    }
  }

  // Custom application errors
  if (err.isCustom) {
    return sendErrorResponse(
      res,
      err.message,
      err.statusCode || 500,
      err.code || 'ERROR'
    );
  }

  // Default error
  sendErrorResponse(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    500,
    'INTERNAL_SERVER_ERROR'
  );
};

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  sendErrorResponse(
    res,
    `Route ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isCustom = true;
  }
}

module.exports = {
  errorHandler,
  notFound,
  AppError,
};
