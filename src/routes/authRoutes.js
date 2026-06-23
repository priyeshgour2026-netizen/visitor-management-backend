/**
 * Authentication Routes
 * Routes for login and token management
 */

const express = require('express');
const router = express.Router();

const {
  sendOTP,
  verifyOTPAndGenerateToken,
  login,
  visitorLogin,
  refreshAccessToken,
  logout,
} = require('../controllers/authController');

/**
 * Visitor Login
 */
router.post('/visitor-login', visitorLogin);

/**
 * Admin/Staff Login
 */
router.post('/login', login);

/**
 * Refresh Token
 */
router.post('/refresh-token', refreshAccessToken);

/**
 * Logout
 */
router.post('/logout', logout);

module.exports = router;