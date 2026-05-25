/**
 * Admin Routes
 * Routes for admin dashboard, visitor management, and analytics
 */

const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllVisitors,
  approveVisitor,
  rejectVisitor,
  getDailyReport,
} = require('../controllers/adminController');
const { authenticateJWT } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorization');

/**
 * GET /api/admin/dashboard
 * Get admin dashboard with analytics
 * Protected: Admin only
 */
router.get('/dashboard', authenticateJWT, isAdmin, getDashboard);

/**
 * GET /api/admin/visitors
 * Get all visitors with filtering
 * Protected: Admin only
 */
router.get('/visitors', authenticateJWT, isAdmin, getAllVisitors);

/**
 * PUT /api/admin/approve/:id
 * Approve visitor registration
 * Protected: Admin only
 */
router.put('/approve/:id', authenticateJWT, isAdmin, approveVisitor);

/**
 * PUT /api/admin/reject/:id
 * Reject visitor registration
 * Protected: Admin only
 */
router.put('/reject/:id', authenticateJWT, isAdmin, rejectVisitor);

/**
 * GET /api/admin/reports/daily
 * Get daily report
 * Protected: Admin only
 */
router.get('/reports/daily', authenticateJWT, isAdmin, getDailyReport);

module.exports = router;
