/**
 * Validation Utilities
 * Helper functions for input validation
 */

const validator = require('validator');

/**
 * Validate phone number (Indian format)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean}
 */
const validatePhoneNumber = (phoneNumber) => {
  return /^[0-9]{10}$/.test(phoneNumber.toString());
};

/**
 * Validate Aadhaar number
 * @param {string} aadhaarNumber - Aadhaar to validate
 * @returns {boolean}
 */
const validateAadhaarNumber = (aadhaarNumber) => {
  return /^[0-9]{12}$/.test(aadhaarNumber.toString());
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const validateEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate name (at least 2 characters, no numbers)
 * @param {string} name - Name to validate
 * @returns {boolean}
 */
const validateName = (name) => {
  return /^[a-zA-Z\s]{2,}$/.test(name.trim());
};

/**
 * Validate date of birth
 * @param {string} dob - Date of birth (YYYY-MM-DD)
 * @returns {boolean}
 */
const validateDOB = (dob) => {
  if (!validator.isISO8601(dob)) {
    return false;
  }

  const birthDate = new Date(dob);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  return age >= 18 && age <= 120;
};

/**
 * Validate visitor purpose
 * @param {string} purpose - Visit purpose
 * @returns {boolean}
 */
const validateVisitPurpose = (purpose) => {
  const validPurposes = [
    'business_meeting',
    'delivery',
    'service',
    'interview',
    'inspection',
    'other',
  ];

  return validPurposes.includes(purpose);
};

/**
 * Validate gate name
 * @param {string} gate - Gate name
 * @returns {boolean}
 */
const validateGate = (gate) => {
  const validGates = ['gate_1', 'gate_2', 'main_entrance', 'side_entrance'];
  return validGates.includes(gate);
};

/**
 * Validate role
 * @param {string} role - User role
 * @returns {boolean}
 */
const validateRole = (role) => {
  const validRoles = ['admin', 'security_guard', 'receptionist'];
  return validRoles.includes(role);
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {boolean}
 */
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  return (
    pageNum >= 1 &&
    limitNum >= 1 &&
    limitNum <= 100 &&
    !isNaN(pageNum) &&
    !isNaN(limitNum)
  );
};

/**
 * Validate visitor status
 * @param {string} status - Visitor status
 * @returns {boolean}
 */
const validateVisitorStatus = (status) => {
  const validStatuses = [
    'registered',
    'checked_in',
    'checked_out',
    'rejected',
  ];

  return validStatuses.includes(status);
};

/**
 * Validate approval status
 * @param {string} status - Approval status
 * @returns {boolean}
 */
const validateApprovalStatus = (status) => {
  const validStatuses = ['pending', 'approved', 'rejected'];
  return validStatuses.includes(status);
};

module.exports = {
  validatePhoneNumber,
  validateAadhaarNumber,
  validateEmail,
  validateName,
  validateDOB,
  validateVisitPurpose,
  validateGate,
  validateRole,
  validatePagination,
  validateVisitorStatus,
  validateApprovalStatus,
};
