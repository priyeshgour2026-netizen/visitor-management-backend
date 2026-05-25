/**
 * Entry/Exit Routes
 * Routes for visitor check-in and check-out operations
 */

const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getEntryLogs,
  getEntryStats,
} = require('../controllers/entryController');
const { authenticateJWT } = require('../middleware/auth');
const { isSecurityOrAdmin } = require('../middleware/authorization');

/**
 * POST /api/entry/check-in
 * Record visitor check-in
 */
router.post('/check-in', authenticateJWT, isSecurityOrAdmin, checkIn);

/**
 * POST /api/entry/check-out
 * Record visitor check-out
 */
router.post('/check-out', authenticateJWT, isSecurityOrAdmin, checkOut);

/**
 * GET /api/entry/logs/:visitorId
 * Get entry/exit logs for a visitor
 */
router.get('/logs/:visitorId', authenticateJWT, getEntryLogs);

/**
 * GET /api/entry/stats
 * Get entry/exit statistics
 */
router.get('/stats', authenticateJWT, getEntryStats);

module.exports = router;
