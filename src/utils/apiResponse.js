/**
 * API Response Utility
 * Standardized response formatting for all API endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccessResponse = (
  res,
  data,
  message = 'Success',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 */
const sendPaginatedResponse = (
  res,
  data,
  total,
  page,
  limit,
  message = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      pageSize: limit,
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {Object} errors - Detailed errors
 */
const sendErrorResponse = (
  res,
  message = 'Error',
  statusCode = 500,
  code = 'ERROR',
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    errors,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Example API responses for documentation
 */
const API_RESPONSE_EXAMPLES = {
  // Auth endpoints
  sendOTP: {
    request: {
      phoneNumber: '9876543210',
    },
    successResponse: {
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber: '9876543210',
        expiresIn: 600, // seconds
      },
    },
  },

  verifyOTP: {
    request: {
      phoneNumber: '9876543210',
      otp: '123456',
      deviceId: 'device-uuid',
    },
    successResponse: {
      success: true,
      message: 'OTP verified successfully',
      data: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        visitor: {
          _id: 'visitor-id',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '9876543210',
        },
      },
    },
  },

  // Visitor endpoints
  createVisitor: {
    request: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '9876543210',
      visitPurpose: 'business_meeting',
      departmentToVisit: 'Sales',
      personToMeet: 'Manager Name',
      emergencyContact: {
        name: 'Jane Doe',
        phoneNumber: '9876543211',
      },
    },
    successResponse: {
      success: true,
      message: 'Visitor created successfully',
      data: {
        _id: 'visitor-id',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '9876543210',
        approvalStatus: 'pending',
        visitorStatus: 'registered',
      },
    },
  },

  // QR endpoints
  generateQR: {
    request: {
      visitorId: 'visitor-id',
    },
    successResponse: {
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode: 'data:image/png;base64,...',
        qrUniqueId: 'qr-unique-id',
        expiresAt: '2024-05-24T12:00:00Z',
      },
    },
  },

  // Entry endpoints
  checkIn: {
    request: {
      qrUniqueId: 'qr-unique-id',
      gate: 'gate_1',
      deviceId: 'scanner-device-id',
    },
    successResponse: {
      success: true,
      message: 'Visitor checked in successfully',
      data: {
        entryLogId: 'entry-log-id',
        visitorName: 'John Doe',
        checkInTime: '2024-05-24T10:30:00Z',
        department: 'Sales',
      },
    },
  },

  // Admin endpoints
  adminDashboard: {
    successResponse: {
      success: true,
      message: 'Dashboard data retrieved',
      data: {
        totalVisitors: 245,
        activeVisitors: 12,
        todayVisitors: 18,
        pendingApprovals: 5,
        rejectedToday: 2,
        todayCheckIns: 18,
        todayCheckOuts: 12,
        averageVisitDuration: 45, // in minutes
      },
    },
  },

  // Error responses
  errorResponse: {
    validationError: {
      success: false,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      errors: {
        email: 'Invalid email format',
        phoneNumber: 'Phone number must be 10 digits',
      },
    },
    unauthorized: {
      success: false,
      message: 'Access token is required',
      code: 'UNAUTHORIZED',
    },
    forbidden: {
      success: false,
      message: 'Insufficient permissions',
      code: 'FORBIDDEN',
    },
    notFound: {
      success: false,
      message: 'Resource not found',
      code: 'NOT_FOUND',
    },
  },
};

module.exports = {
  sendSuccessResponse,
  sendPaginatedResponse,
  sendErrorResponse,
  API_RESPONSE_EXAMPLES,
};
