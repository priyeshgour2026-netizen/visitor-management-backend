/**
 * OTP Utility
 * Generates and manages One-Time Passwords
 */

// Simple in-memory OTP store (in production, use Redis)
const otpStore = new Map();

/**
 * Generate a random OTP
 * @param {number} length - OTP length (default 6)
 * @returns {string} Generated OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * 10));
  }

  return otp;
};

/**
 * Store OTP with phone number
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP to store
 * @param {number} expiryTime - Expiry time in seconds (default 600)
 */
const storeOTP = (phoneNumber, otp, expiryTime = 600) => {
  const expiresAt = Date.now() + expiryTime * 1000;

  otpStore.set(phoneNumber, {
    otp,
    expiresAt,
    attempts: 0,
  });

  // Clean up expired OTP after expiry time
  setTimeout(() => {
    otpStore.delete(phoneNumber);
  }, expiryTime * 1000);

  return {
    expiresIn: expiryTime,
  };
};

/**
 * Verify OTP
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP to verify
 * @returns {Object} Verification result
 */
const verifyOTP = (phoneNumber, otp) => {
  const storedOTP = otpStore.get(phoneNumber);

  if (!storedOTP) {
    return {
      verified: false,
      message: 'OTP not found or expired',
      attemptsRemaining: 0,
    };
  }

  // Check if OTP has expired
  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(phoneNumber);
    return {
      verified: false,
      message: 'OTP has expired',
      attemptsRemaining: 0,
    };
  }

  // Check attempts
  const maxAttempts = 3;
  if (storedOTP.attempts >= maxAttempts) {
    otpStore.delete(phoneNumber);
    return {
      verified: false,
      message: 'Maximum OTP attempts exceeded',
      attemptsRemaining: 0,
    };
  }

  // Verify OTP
  if (storedOTP.otp !== otp) {
    storedOTP.attempts += 1;
    return {
      verified: false,
      message: 'Invalid OTP',
      attemptsRemaining: maxAttempts - storedOTP.attempts,
    };
  }

  // OTP verified successfully
  otpStore.delete(phoneNumber);
  return {
    verified: true,
    message: 'OTP verified successfully',
    attemptsRemaining: 0,
  };
};

/**
 * Resend OTP
 * @param {string} phoneNumber - Phone number
 * @returns {Object} Resend result
 */
const resendOTP = (phoneNumber) => {
  const newOTP = generateOTP();
  return storeOTP(phoneNumber, newOTP);
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  resendOTP,
};
