/**
 * Visitor Model
 * Represents visitors to the facility
 */

const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    // ================= PERSONAL INFORMATION =================

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits'],
    },

    // ================= DOCUMENT INFORMATION =================

    aadhaarNumber: {
      type: String,
      match: [/^[0-9]{12}$/, 'Aadhaar number must be 12 digits'],
    },

    aadhaarFile: {
      type: String,
      default: null,
    },

    aadhaarData: {
      name: String,
      dob: String,
      address: String,
      gender: String,
    },

    // ================= MEDIA FILES =================

    profilePhoto: {
      type: String,
      default: null,
    },

    selfiePhoto: {
      type: String,
      default: null,
    },

    // ================= VISIT INFORMATION =================

    visitPurpose: {
      type: String,
      required: [true, 'Visit purpose is required'],
      enum: [
        'business_meeting',
        'delivery',
        'service',
        'interview',
        'inspection',
        'other',
      ],
    },

    departmentToVisit: {
      type: String,
      required: [true, 'Department is required'],
    },

    personToMeet: {
      type: String,
      required: [true, 'Person to meet is required'],
    },

    // ================= QR CODE INFORMATION =================

    qrCode: {
      type: String,
      default: null,
    },

    qrUniqueId: {
      type: String,
      unique: true,
      sparse: true,
    },

    qrExpiresAt: {
      type: Date,
    },

    // ================= APPROVAL STATUS =================

    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    // ================= VISIT DURATION =================

    checkInTime: {
      type: Date,
      default: null,
    },

    checkOutTime: {
      type: Date,
      default: null,
    },

    visitDuration: {
      type: Number,
      default: null,
    },

    // ================= DEVICE INFORMATION =================

    deviceId: {
      type: String,
    },

    ipAddress: {
      type: String,
    },

    // ================= STATUS =================

    isActive: {
      type: Boolean,
      default: true,
    },

    visitorStatus: {
      type: String,
      enum: ['registered', 'checked_in', 'checked_out', 'rejected'],
      default: 'registered',
    },

    // ================= OTP VERIFICATION =================

    otpVerified: {
      type: Boolean,
      default: false,
    },

    otpVerifiedAt: {
      type: Date,
    },

    // ================= EMERGENCY CONTACT =================

    emergencyContact: {
      name: String,
      phoneNumber: String,
    },

    // ================= NOTES =================

    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculate visit duration
 */
visitorSchema.methods.calculateVisitDuration = function () {

  if (this.checkInTime && this.checkOutTime) {

    const duration =
      (this.checkOutTime - this.checkInTime) / (1000 * 60);

    this.visitDuration = Math.round(duration);

  }
};

/**
 * Get full name
 */
visitorSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Check if QR expired
 */
visitorSchema.methods.isQRExpired = function () {

  if (!this.qrExpiresAt) return false;

  return new Date() > this.qrExpiresAt;
};

/**
 * Pre-save hook
 */
visitorSchema.pre('save', function (next) {

  this.calculateVisitDuration();

  next();

});

// ================= INDEXES =================

visitorSchema.index({ aadhaarNumber: 1 });

visitorSchema.index({ phoneNumber: 1 });
 

visitorSchema.index({ createdAt: -1 });

visitorSchema.index({ approvalStatus: 1 });

visitorSchema.index({ visitorStatus: 1 });

// ================= EXPORT =================

module.exports = mongoose.model('Visitor', visitorSchema);