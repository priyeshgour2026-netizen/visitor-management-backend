/**
 * Authentication Controller
 * Handles user authentication (OTP, verification, token generation)
 */

const jwt = require('jsonwebtoken');

const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/apiResponse');

const {
  generateOTP,
  storeOTP,
  verifyOTP,
} = require('../utils/otp');

const {
  generateToken,
  generateRefreshToken,
} = require('../config/jwt');

const {
  sendOTPviaSMS,
} = require('../services/notificationService');

const Visitor = require('../models/Visitor');
const User = require('../models/User');

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number
 */
const sendOTP = async (req, res) => {

  try {

    const { phoneNumber } = req.body;

    // Validate phone number
    if (
      !phoneNumber ||
      !/^[0-9]{10}$/.test(phoneNumber)
    ) {

      return sendErrorResponse(
        res,
        'Valid 10-digit phone number is required',
        400,
        'VALIDATION_ERROR'
      );

    }

    // Generate OTP
    const otp = generateOTP(6);

    // Store OTP
    const otpData = storeOTP(
      phoneNumber,
      otp,
      600
    );

    // Send SMS
    const smsResult =
      await sendOTPviaSMS(phoneNumber, otp);

    if (!smsResult.success) {

      console.warn(
        'SMS sending failed, but OTP stored'
      );

    }

    return sendSuccessResponse(
      res,
      {
        phoneNumber,
        expiresIn: otpData.expiresIn,
        message:
          'OTP sent successfully. Valid for 10 minutes.',
      },
      'OTP sent successfully',
      200
    );

  } catch (error) {

    console.error('Send OTP error:', error);

    sendErrorResponse(
      res,
      error.message,
      500,
      'SERVER_ERROR'
    );

  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and generate token
 */
const verifyOTPAndGenerateToken = async (
  req,
  res
) => {

  try {

    const {
      phoneNumber,
      otp,
      deviceId,
    } = req.body;

    // Validation
    if (
      !phoneNumber ||
      !otp ||
      !deviceId
    ) {

      return sendErrorResponse(
        res,
        'Phone number, OTP, and device ID are required',
        400,
        'VALIDATION_ERROR'
      );

    }

    // Verify OTP
    const verificationResult =
      verifyOTP(phoneNumber, otp);

    if (!verificationResult.verified) {

      return sendErrorResponse(
        res,
        verificationResult.message,
        400,
        'OTP_VERIFICATION_FAILED'
      );

    }

    // Find Visitor
    let visitor =
      await Visitor.findOne({ phoneNumber });

    // Create visitor if not exists
    if (!visitor) {

      visitor = new Visitor({

        phoneNumber,

        firstName: 'Guest',

        lastName: 'User',

        otpVerified: true,

        otpVerifiedAt: new Date(),

        deviceId,

        visitPurpose: 'other',

        departmentToVisit: 'General',

        personToMeet: 'Reception',

      });

      await visitor.save();

    } else {

      visitor.otpVerified = true;

      visitor.otpVerifiedAt = new Date();

      visitor.deviceId = deviceId;

      await visitor.save();

    }

    // Generate token
    const token = generateToken({

      id: visitor._id,

      phoneNumber:
        visitor.phoneNumber,

      type: 'visitor',

    });

    // Generate refresh token
    const refreshToken =
      generateRefreshToken({

        id: visitor._id,

        phoneNumber:
          visitor.phoneNumber,

        type: 'visitor',

      });

    return sendSuccessResponse(
      res,
      {
        token,
        refreshToken,

        visitor: {

          _id: visitor._id,

          phoneNumber:
            visitor.phoneNumber,

          firstName:
            visitor.firstName,

          lastName:
            visitor.lastName,

          otpVerified:
            visitor.otpVerified,
        },
      },
      'OTP verified successfully',
      200
    );

  } catch (error) {

    console.error(
      'Verify OTP error:',
      error
    );

    sendErrorResponse(
      res,
      error.message,
      500,
      'SERVER_ERROR'
    );

  }
};

/**
 * POST /api/auth/login
 * Admin Login
 */
const login = async (req, res) => {

  try {

    const { email, password } =
      req.body;

    console.log(
      '🔐 Login attempt:',
      email
    );

    // ================= VALIDATION =================

    if (!email || !password) {

      return sendErrorResponse(
        res,
        'Email and password are required',
        400,
        'VALIDATION_ERROR'
      );

    }

    // ================= DEMO ADMIN LOGIN =================

    if (
      email === 'admin@example.com' &&
      password === 'admin123'
    ) {

      const token = jwt.sign(
        {
          email,
          role: 'admin',
          type: 'user',
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        }
      );

      const refreshToken = jwt.sign(
        {
          email,
          role: 'admin',
          type: 'user',
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '30d',
        }
      );

      return sendSuccessResponse(
        res,
        {
          token,
          refreshToken,

          user: {

            name: 'Admin',

            email:
              'admin@example.com',

            role: 'admin',
          },
        },
        'Login successful',
        200
      );

    }

    // ================= DATABASE LOGIN =================

    const user = await User.findOne({
      email,
    }).select('+password');

    if (!user) {

      return sendErrorResponse(
        res,
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );

    }

    // Check active
    if (!user.isActive) {

      return sendErrorResponse(
        res,
        'User account is inactive',
        403,
        'USER_INACTIVE'
      );

    }

    // Verify password
    const isPasswordValid =
      await user.comparePassword(
        password
      );

    if (!isPasswordValid) {

      return sendErrorResponse(
        res,
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );

    }

    // Generate JWT token
    const token = generateToken({

      id: user._id,

      email: user.email,

      role: user.role,

      type: 'user',
    });

    // Generate refresh token
    const refreshToken =
      generateRefreshToken({

        id: user._id,

        email: user.email,

        role: user.role,

        type: 'user',
      });

    return sendSuccessResponse(
      res,
      {
        token,
        refreshToken,

        user: {

          _id: user._id,

          name: user.name,

          email: user.email,

          role: user.role,

          phoneNumber:
            user.phoneNumber,
        },
      },
      'Login successful',
      200
    );

  } catch (error) {

    console.error(
      'Login error:',
      error
    );

    sendErrorResponse(
      res,
      error.message,
      500,
      'SERVER_ERROR'
    );

  }
};

/**
 * POST /api/auth/refresh-token
 */
const refreshAccessToken = async (
  req,
  res
) => {

  try {

    const { refreshToken } =
      req.body;

    if (!refreshToken) {

      return sendErrorResponse(
        res,
        'Refresh token is required',
        400,
        'VALIDATION_ERROR'
      );

    }

    const {
      verifyToken,
    } = require('../config/jwt');

    try {

      const decoded =
        verifyToken(refreshToken);

      const newToken =
        generateToken({

          id: decoded.id,

          email: decoded.email,

          role: decoded.role,

          type: decoded.type,
        });

      return sendSuccessResponse(
        res,
        {
          token: newToken,
        },
        'Token refreshed successfully',
        200
      );

    } catch (error) {

      return sendErrorResponse(
        res,
        'Invalid refresh token',
        401,
        'INVALID_TOKEN'
      );

    }

  } catch (error) {

    console.error(
      'Refresh token error:',
      error
    );

    sendErrorResponse(
      res,
      error.message,
      500,
      'SERVER_ERROR'
    );

  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {

  try {

    return sendSuccessResponse(
      res,
      {},
      'Logout successful',
      200
    );

  } catch (error) {

    console.error(
      'Logout error:',
      error
    );

    sendErrorResponse(
      res,
      error.message,
      500,
      'SERVER_ERROR'
    );

  }
};

/**
 * POST /api/auth/visitor-login
 * Visitor Login using Phone Number
 */
const visitorLogin = async (req, res) => {
  try {

    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return sendErrorResponse(
        res,
        'Phone number is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const visitor = await Visitor.findOne({
      phoneNumber
    });

    if (!visitor) {
      return sendErrorResponse(
        res,
        'Visitor not found',
        404,
        'VISITOR_NOT_FOUND'
      );
    }

    if (visitor.approvalStatus !== 'approved') {
      return sendErrorResponse(
        res,
        'Visitor is not approved yet',
        403,
        'VISITOR_NOT_APPROVED'
      );
    }

    const token = generateToken({
      id: visitor._id,
      phoneNumber: visitor.phoneNumber,
      type: 'visitor'
    });

    const refreshToken = generateRefreshToken({
      id: visitor._id,
      phoneNumber: visitor.phoneNumber,
      type: 'visitor'
    });

    return sendSuccessResponse(
      res,
      {
        token,
        refreshToken,

        visitor: {
          _id: visitor._id,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          phoneNumber: visitor.phoneNumber,
          approvalStatus: visitor.approvalStatus,
        }
      },
      'Login successful',
      200
    );

  } catch (error) {

    console.error('Visitor login error:', error);

    return sendErrorResponse(
      res,
      error.message,
      500,
      'SERVER_ERROR'
    );

  }
};

module.exports = {
  sendOTP,
  verifyOTPAndGenerateToken,
  login,
  visitorLogin,
  refreshAccessToken,
  logout,
};