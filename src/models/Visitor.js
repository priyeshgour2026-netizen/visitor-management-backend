/**
 * Visitor Model
 * Clean & Production Safe Version (Fixed)
 */

const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
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
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },

    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits'],
    },

    aadhaarNumber: {
      type: String,
      trim: true,
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

    visitPurpose: {
      type: String,
      required: [true, 'Visit purpose is required'],
      enum: ['business_meeting', 'delivery', 'service', 'interview', 'inspection', 'other'],
    },

    departmentToVisit: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },

    personToMeet: {
      type: String,
      required: [true, 'Person to meet is required'],
      trim: true,
    },

    company: {
      type: String,
      trim: true,
    },

    profilePhoto: {
      type: String,
      default: null,
    },

    selfiePhoto: {
      type: String,
      default: null,
    },

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

    deviceId: String,
    ipAddress: String,

    isActive: {
      type: Boolean,
      default: true,
    },

    visitorStatus: {
      type: String,
      enum: ['registered', 'checked_in', 'checked_out', 'rejected'],
      default: 'registered',
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    otpVerifiedAt: Date,

    emergencyContact: {
      name: String,
      phoneNumber: String,
    },

    adminNotes: String,
  },
  {
    timestamps: true,
  }
);

/**
 * Auto calculate visit duration (backup logic)
 */
visitorSchema.pre('save', function () {
  try {
    if (this.checkInTime && this.checkOutTime) {
      const diff =
        (this.checkOutTime - this.checkInTime) / (1000 * 60);

      this.visitDuration = Math.round(diff);
    }
  } catch (err) {
    console.error('Visitor pre-save error:', err);
  }
});

/**
 * Get full name
 */
visitorSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * QR expiry check
 */
visitorSchema.methods.isQRExpired = function () {
  if (!this.qrExpiresAt) return false;
  return new Date() > this.qrExpiresAt;
};

/**
 * ✅ FIX: This was missing (causing your error)
 */
visitorSchema.methods.calculateVisitDuration = function () {
  if (this.checkInTime && this.checkOutTime) {
    const diff =
      (this.checkOutTime - this.checkInTime) / (1000 * 60);

    this.visitDuration = Math.round(diff);
  }
};

// Indexes
visitorSchema.index({ phoneNumber: 1 });
visitorSchema.index({ aadhaarNumber: 1 });
visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ approvalStatus: 1 });
visitorSchema.index({ visitorStatus: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);