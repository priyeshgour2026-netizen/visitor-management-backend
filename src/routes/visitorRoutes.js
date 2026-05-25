/**
 * Visitor Routes
 * Routes for visitor registration and profile management
 */

const express = require('express');
const router = express.Router();
const {
  createVisitor,
  getVisitorProfile,
  updateVisitor,
  getVisitorHistory,
  uploadAadhaar,
  uploadSelfie,
} = require('../controllers/visitorController');
const { authenticateJWT, optionalAuth } = require('../middleware/auth');
const { uploadAadhaar: aadhaarMulter, uploadProfile: profileMulter } = require('../config/multer');

/**
 * POST /api/visitor/create
 * Create new visitor registration
 */
router.post('/create', createVisitor);

/**
 * GET /api/visitor/:id
 * Get visitor profile
 */
router.get('/:id', getVisitorProfile);

/**
 * PUT /api/visitor/update/:id
 * Update visitor profile
 */
router.put('/update/:id', updateVisitor);

/**
 * GET /api/visitor/history/:phoneNumber
 * Get visitor visit history
 */
router.get('/history/:phoneNumber', getVisitorHistory);

/**
 * POST /api/upload/aadhaar
 * Upload Aadhaar document with OCR processing
 */
router.post('/upload/aadhaar', aadhaarMulter.single('aadhaarFile'), uploadAadhaar);

/**
 * POST /api/upload/selfie
 * Upload selfie photo
 */
router.post('/upload/selfie', profileMulter.single('selfieFile'), uploadSelfie);

module.exports = router;
