/**
 * Date/Time Utilities
 * Helper functions for date and time operations
 */

/**
 * Format date to ISO string
 * @param {Date} date - Date to format
 * @returns {string} ISO formatted date
 */
const formatDateISO = (date) => {
  return date ? new Date(date).toISOString() : null;
};

/**
 * Get start of day
 * @param {Date} date - Reference date
 * @returns {Date} Start of day
 */
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 * @param {Date} date - Reference date
 * @returns {Date} End of day
 */
const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get date range for period
 * @param {string} period - 'today', 'week', 'month', 'year'
 * @returns {Object} Start and end dates
 */
const getDateRange = (period = 'today') => {
  const endDate = new Date();
  let startDate = new Date();

  switch (period) {
    case 'today':
      startDate = getStartOfDay();
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      startDate = getStartOfDay(startDate);
      break;

    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      startDate = getStartOfDay(startDate);
      break;

    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate = getStartOfDay(startDate);
      break;

    default:
      startDate = getStartOfDay();
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

/**
 * Calculate age from date of birth
 * @param {Date} dob - Date of birth
 * @returns {number} Age in years
 */
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Format duration in seconds to readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.length > 0 ? parts.join(' ') : '0s';
};

/**
 * Calculate duration between two dates in minutes
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Duration in minutes
 */
const calculateDurationInMinutes = (startDate, endDate) => {
  const diff = endDate - startDate;
  return Math.round(diff / (1000 * 60));
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);

  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is in past
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in future
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Get time difference in human-readable format
 * @param {Date} date - Reference date
 * @returns {string} Time difference
 */
const getTimeDifference = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
};

module.exports = {
  formatDateISO,
  getStartOfDay,
  getEndOfDay,
  getDateRange,
  calculateAge,
  formatDuration,
  calculateDurationInMinutes,
  isToday,
  isPast,
  isFuture,
  getTimeDifference,
};
