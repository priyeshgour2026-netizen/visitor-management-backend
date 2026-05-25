/**
 * Authentication Routes
 * Routes for OTP, login, and token management
 */

const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTPAndGenerateToken,
  login,
  refreshAccessToken,
  logout,
} = require('../controllers/authController');

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number
 */
router.post('/send-otp', sendOTP);

/**
 * POST /api/auth/verify-otp
 * Verify OTP and get JWT token
 */
router.post('/verify-otp', verifyOTPAndGenerateToken);

/**
 * POST /api/auth/login
 * Admin/Staff login
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh-token
 * Refresh JWT token
 */
router.post('/refresh-token', refreshAccessToken);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', logout);

module.exports = router;
