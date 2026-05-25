/**
 * QR Code Controller
 * Handles QR code generation, validation, and scanning
 */

const { sendSuccessResponse, sendErrorResponse } = require('../utils/apiResponse');
const { generateQRCode, validateQRCode } = require('../services/qrService');
const Visitor = require('../models/Visitor');

/**
 * POST /api/qr/generate
 * Generate QR code for visitor
 */
const generateQRForVisitor = async (req, res) => {
  try {
    const { visitorId } = req.body;

    if (!visitorId) {
      return sendErrorResponse(
        res,
        'Visitor ID is required',
        400,
        'VALIDATION_ERROR'
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

    // Check if visitor is approved
    if (visitor.approvalStatus !== 'approved') {
      return sendErrorResponse(
        res,
        'Visitor must be approved before generating QR code',
        400,
        'VISITOR_NOT_APPROVED'
      );
    }

    // Generate QR code
    const qrData = await generateQRCode(visitor);

    // Update visitor with QR code
    visitor.qrCode = qrData.qrCode;
    visitor.qrUniqueId = qrData.qrUniqueId;
    visitor.qrExpiresAt = qrData.expiresAt;
    await visitor.save();

    return sendSuccessResponse(
      res,
      {
        visitorId: visitor._id,
        visitorName: visitor.getFullName(),
        qrCode: qrData.qrCode,
        qrUniqueId: qrData.qrUniqueId,
        expiresAt: qrData.expiresAt,
      },
      'QR code generated successfully',
      200
    );
  } catch (error) {
    console.error('Generate QR error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * POST /api/qr/validate
 * Validate QR code
 */
const validateQR = async (req, res) => {
  try {
    const { qrUniqueId } = req.body;

    if (!qrUniqueId) {
      return sendErrorResponse(
        res,
        'QR unique ID is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    const visitor = await Visitor.findOne({ qrUniqueId });

    if (!visitor) {
      return sendErrorResponse(
        res,
        'Invalid QR code',
        404,
        'INVALID_QR'
      );
    }

    // Validate QR code
    const validationResult = validateQRCode(qrUniqueId, visitor);

    if (!validationResult.valid) {
      return sendErrorResponse(
        res,
        validationResult.message,
        400,
        'INVALID_QR'
      );
    }

    return sendSuccessResponse(
      res,
      {
        valid: true,
        visitor: {
          _id: visitor._id,
          name: visitor.getFullName(),
          phoneNumber: visitor.phoneNumber,
          purpose: visitor.visitPurpose,
          department: visitor.departmentToVisit,
          personToMeet: visitor.personToMeet,
        },
      },
      'QR code is valid',
      200
    );
  } catch (error) {
    console.error('Validate QR error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * GET /api/qr/:qrUniqueId
 * Get QR code details
 */
const getQRDetails = async (req, res) => {
  try {
    const { qrUniqueId } = req.params;

    const visitor = await Visitor.findOne({ qrUniqueId });

    if (!visitor) {
      return sendErrorResponse(
        res,
        'QR not found',
        404,
        'NOT_FOUND'
      );
    }

    return sendSuccessResponse(
      res,
      {
        qrUniqueId: visitor.qrUniqueId,
        expiresAt: visitor.qrExpiresAt,
        isExpired: visitor.isQRExpired(),
        visitor: {
          _id: visitor._id,
          name: visitor.getFullName(),
          purpose: visitor.visitPurpose,
          department: visitor.departmentToVisit,
        },
      },
      'QR details retrieved',
      200
    );
  } catch (error) {
    console.error('Get QR details error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

module.exports = {
  generateQRForVisitor,
  validateQR,
  getQRDetails,
};
