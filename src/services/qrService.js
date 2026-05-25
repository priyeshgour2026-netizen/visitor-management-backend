/**
 * QR Code Service
 * Handles QR code generation, validation, and management
 */

const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate unique QR ID
 * @returns {string} Unique QR ID
 */
const generateUniqueQRId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generate QR code for visitor
 * @param {Object} visitor - Visitor object
 * @returns {Promise<Object>} QR code data
 */
const generateQRCode = async (visitor) => {
  try {
    // Generate unique QR ID
    const qrUniqueId = generateUniqueQRId();

    // QR code data - contains essential visitor information
    const qrData = {
      qrId: qrUniqueId,
      visitorId: visitor._id.toString(),
      name: visitor.getFullName(),
      phoneNumber: visitor.phoneNumber,
      purpose: visitor.visitPurpose,
      department: visitor.departmentToVisit,
      timestamp: new Date().toISOString(),
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // QR code expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return {
      qrCode: qrCodeDataURL,
      qrUniqueId,
      qrData,
      expiresAt,
    };
  } catch (error) {
    throw new Error(`QR code generation failed: ${error.message}`);
  }
};

/**
 * Generate QR code as file
 * @param {Object} visitor - Visitor object
 * @param {string} filePath - Path to save QR code
 * @returns {Promise<string>} File path
 */
const generateQRCodeAsFile = async (visitor, filePath) => {
  try {
    const qrUniqueId = generateUniqueQRId();

    const qrData = {
      qrId: qrUniqueId,
      visitorId: visitor._id.toString(),
      name: visitor.getFullName(),
      phoneNumber: visitor.phoneNumber,
      purpose: visitor.visitPurpose,
      timestamp: new Date().toISOString(),
    };

    // Generate QR code as file
    await QRCode.toFile(filePath, JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });

    return {
      filePath,
      qrUniqueId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  } catch (error) {
    throw new Error(`QR file generation failed: ${error.message}`);
  }
};

/**
 * Validate QR code
 * @param {string} qrUniqueId - QR unique ID to validate
 * @param {Object} visitor - Visitor object to validate against
 * @returns {Object} Validation result
 */
const validateQRCode = (qrUniqueId, visitor) => {
  if (!qrUniqueId || !visitor.qrUniqueId) {
    return {
      valid: false,
      message: 'QR code not found',
    };
  }

  if (qrUniqueId !== visitor.qrUniqueId) {
    return {
      valid: false,
      message: 'QR code does not match visitor',
    };
  }

  if (visitor.isQRExpired()) {
    return {
      valid: false,
      message: 'QR code has expired',
    };
  }

  if (visitor.approvalStatus !== 'approved') {
    return {
      valid: false,
      message: 'Visitor not approved',
    };
  }

  return {
    valid: true,
    message: 'QR code is valid',
    visitor: {
      name: visitor.getFullName(),
      phoneNumber: visitor.phoneNumber,
      purpose: visitor.visitPurpose,
      department: visitor.departmentToVisit,
    },
  };
};

/**
 * Decode QR code data
 * @param {string} qrData - QR data string
 * @returns {Object} Decoded data
 */
const decodeQRData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    throw new Error('Invalid QR data format');
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeAsFile,
  validateQRCode,
  decodeQRData,
  generateUniqueQRId,
};
