/**
 * QR Code Routes
 * Routes for QR code generation and validation
 */

const express = require('express');
const router = express.Router();
const {
  generateQRForVisitor,
  validateQR,
  getQRDetails,
} = require('../controllers/qrController');
const { authenticateJWT } = require('../middleware/auth');

/**
 * POST /api/qr/generate
 * Generate QR code for visitor
 */
router.post('/generate', authenticateJWT, generateQRForVisitor);

/**
 * POST /api/qr/validate
 * Validate QR code
 */
router.post('/validate', validateQR);

/**
 * GET /api/qr/:qrUniqueId
 * Get QR code details
 */
router.get('/:qrUniqueId', getQRDetails);

module.exports = router;
