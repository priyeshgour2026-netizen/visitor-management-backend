/**
 * Constants
 * Application-wide constants and configurations
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  FILE_SIZE_ERROR: 'FILE_SIZE_ERROR',
  FILE_COUNT_ERROR: 'FILE_COUNT_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  OTP_VERIFICATION_FAILED: 'OTP_VERIFICATION_FAILED',
  INVALID_QR: 'INVALID_QR',
  VISITOR_NOT_APPROVED: 'VISITOR_NOT_APPROVED',
  QR_EXPIRED: 'QR_EXPIRED',
  NO_ACTIVE_CHECK_IN: 'NO_ACTIVE_CHECK_IN',
  DUPLICATE_VISITOR: 'DUPLICATE_VISITOR',
  USER_INACTIVE: 'USER_INACTIVE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  FILE_REQUIRED: 'FILE_REQUIRED',
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  SECURITY_GUARD: 'security_guard',
  RECEPTIONIST: 'receptionist',
};

// Visitor Status
const VISITOR_STATUS = {
  REGISTERED: 'registered',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  REJECTED: 'rejected',
};

// Approval Status
const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Visit Purpose
const VISIT_PURPOSE = {
  BUSINESS_MEETING: 'business_meeting',
  DELIVERY: 'delivery',
  SERVICE: 'service',
  INTERVIEW: 'interview',
  INSPECTION: 'inspection',
  OTHER: 'other',
};

// Gates
const GATES = {
  GATE_1: 'gate_1',
  GATE_2: 'gate_2',
  MAIN_ENTRANCE: 'main_entrance',
  SIDE_ENTRANCE: 'side_entrance',
};

// Entry Status
const ENTRY_STATUS = {
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  EXIT_PENDING: 'exit_pending',
};

// Notification Types
const NOTIFICATION_TYPES = {
  OTP_SENT: 'otp_sent',
  APPROVAL_APPROVED: 'approval_approved',
  APPROVAL_REJECTED: 'approval_rejected',
  CHECK_IN_REMINDER: 'check_in_reminder',
  CHECK_OUT_REMINDER: 'check_out_reminder',
  VISITOR_ARRIVED: 'visitor_arrived',
  ANOMALY_DETECTED: 'anomaly_detected',
  DAILY_SUMMARY: 'daily_summary',
};

// Priority Levels
const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Anomaly Types
const ANOMALIES = {
  QR_EXPIRED: 'qr_expired',
  MULTIPLE_ENTRIES: 'multiple_entries',
  UNUSUAL_TIME: 'unusual_time',
};

// File Limits
const FILE_LIMITS = {
  MAX_AADHAAR_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PROFILE_SIZE: 3 * 1024 * 1024, // 3MB
  ALLOWED_AADHAAR_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
  ALLOWED_PROFILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// OTP Configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY: 600, // 10 minutes in seconds
  MAX_ATTEMPTS: 3,
};

// QR Configuration
const QR_CONFIG = {
  EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  SIZE: 300,
  MARGIN: 2,
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

// Lock Configuration
const LOCK_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCK_TIME: 15 * 60 * 1000, // 15 minutes
};

module.exports = {
  HTTP_STATUS,
  ERROR_CODES,
  USER_ROLES,
  VISITOR_STATUS,
  APPROVAL_STATUS,
  VISIT_PURPOSE,
  GATES,
  ENTRY_STATUS,
  NOTIFICATION_TYPES,
  PRIORITY,
  ANOMALIES,
  FILE_LIMITS,
  OTP_CONFIG,
  QR_CONFIG,
  PAGINATION,
  LOCK_CONFIG,
};
