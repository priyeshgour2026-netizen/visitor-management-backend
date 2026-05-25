/**
 * Visitor Controller
 * Handles visitor registration, profile management, and uploads
 */

const { sendSuccessResponse, sendPaginatedResponse, sendErrorResponse } = require('../utils/apiResponse');
const { extractAadhaarDetails, validateAadhaarData } = require('../services/ocrService');
const { generateQRCode } = require('../services/qrService');
const Visitor = require('../models/Visitor');
const path = require('path');

/**
 * POST /api/visitor/create
 * Create new visitor registration
 */
const createVisitor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      visitPurpose,
      departmentToVisit,
      personToMeet,
      emergencyContact,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !visitPurpose || !departmentToVisit || !personToMeet) {
      return sendErrorResponse(
        res,
        'All required fields must be provided',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Check if visitor already exists with same phone and same day
    const existingVisitor = await Visitor.findOne({
      phoneNumber,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    if (existingVisitor && existingVisitor.approvalStatus !== 'rejected') {
      return sendErrorResponse(
        res,
        'Visitor registration already exists for today',
        400,
        'DUPLICATE_VISITOR'
      );
    }

    // Create visitor
    const visitor = new Visitor({
      firstName,
      lastName,
      email,
      phoneNumber,
      visitPurpose,
      departmentToVisit,
      personToMeet,
      emergencyContact,
      otpVerified: true,
      otpVerifiedAt: new Date(),
    });

    await visitor.save();

    return sendSuccessResponse(
      res,
      {
        _id: visitor._id,
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        phoneNumber: visitor.phoneNumber,
        approvalStatus: visitor.approvalStatus,
        visitorStatus: visitor.visitorStatus,
        createdAt: visitor.createdAt,
      },
      'Visitor registration created successfully',
      201
    );
  } catch (error) {
    console.error('Create visitor error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * GET /api/visitor/:id
 * Get visitor profile
 */
const getVisitorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id).populate('approvedBy', 'name email role');

    if (!visitor) {
      return sendErrorResponse(
        res,
        'Visitor not found',
        404,
        'NOT_FOUND'
      );
    }

    return sendSuccessResponse(
      res,
      visitor,
      'Visitor profile retrieved',
      200
    );
  } catch (error) {
    console.error('Get visitor error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * PUT /api/visitor/update/:id
 * Update visitor profile
 */
const updateVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Fields that cannot be updated
    const protectedFields = ['approvalStatus', 'visitorStatus', 'qrCode', 'qrUniqueId', 'checkInTime', 'checkOutTime'];

    // Remove protected fields
    protectedFields.forEach(field => delete updates[field]);

    const visitor = await Visitor.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!visitor) {
      return sendErrorResponse(
        res,
        'Visitor not found',
        404,
        'NOT_FOUND'
      );
    }

    return sendSuccessResponse(
      res,
      visitor,
      'Visitor profile updated successfully',
      200
    );
  } catch (error) {
    console.error('Update visitor error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * GET /api/visitor/history/:phoneNumber
 * Get visitor visit history
 */
const getVisitorHistory = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const visitors = await Visitor.find({ phoneNumber })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Visitor.countDocuments({ phoneNumber });

    return sendPaginatedResponse(
      res,
      visitors,
      total,
      parseInt(page),
      parseInt(limit),
      'Visitor history retrieved'
    );
  } catch (error) {
    console.error('Get visitor history error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * POST /api/upload/aadhaar
 * Upload Aadhaar document
 */
const uploadAadhaar = async (req, res) => {
  try {
    const { visitorId } = req.body;

    if (!req.file) {
      return sendErrorResponse(
        res,
        'Aadhaar file is required',
        400,
        'FILE_REQUIRED'
      );
    }

    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return sendErrorResponse(
        res,
        'Visitor not found',
        404,
        'NOT_FOUND'
      );
    }

    // Store file path
    visitor.aadhaarFile = `/uploads/aadhaar/${req.file.filename}`;

    // Extract Aadhaar details using OCR
    const ocrResult = await extractAadhaarDetails(req.file.path);

    if (ocrResult.success) {
      visitor.aadhaarData = ocrResult.data;

      // Validate extracted data
      const validation = validateAadhaarData(ocrResult.data);

      if (!validation.valid) {
        return sendErrorResponse(
          res,
          'Aadhaar data validation failed',
          400,
          'VALIDATION_ERROR'
        );
      }

      visitor.aadhaarNumber = ocrResult.data.aadhaarNumber;
    }

    await visitor.save();

    return sendSuccessResponse(
      res,
      {
        visitorId: visitor._id,
        aadhaarFile: visitor.aadhaarFile,
        aadhaarData: visitor.aadhaarData,
        confidence: ocrResult.confidence,
      },
      'Aadhaar uploaded and verified successfully',
      200
    );
  } catch (error) {
    console.error('Upload Aadhaar error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * POST /api/upload/selfie
 * Upload selfie photo
 */
const uploadSelfie = async (req, res) => {
  try {
    const { visitorId } = req.body;

    if (!req.file) {
      return sendErrorResponse(
        res,
        'Selfie file is required',
        400,
        'FILE_REQUIRED'
      );
    }

    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return sendErrorResponse(
        res,
        'Visitor not found',
        404,
        'NOT_FOUND'
      );
    }

    // Store file path
    visitor.selfiePhoto = `/uploads/profile/${req.file.filename}`;
    visitor.profilePhoto = `/uploads/profile/${req.file.filename}`;

    await visitor.save();

    return sendSuccessResponse(
      res,
      {
        visitorId: visitor._id,
        selfiePhoto: visitor.selfiePhoto,
      },
      'Selfie uploaded successfully',
      200
    );
  } catch (error) {
    console.error('Upload selfie error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

module.exports = {
  createVisitor,
  getVisitorProfile,
  updateVisitor,
  getVisitorHistory,
  uploadAadhaar,
  uploadSelfie,
};
