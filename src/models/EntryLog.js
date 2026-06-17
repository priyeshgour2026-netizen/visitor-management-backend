/**
 * Entry Log Model
 * Records entry and exit events for visitors
 */

const mongoose = require('mongoose');

const entryLogSchema = new mongoose.Schema(
  {
    // References
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    qrUniqueId: {
      type: String,
      required: true,
    },

    // Entry Information
    entryTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    entryScannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    entryGate: {
      type: String,
      enum: ['gate_1', 'gate_2', 'main_entrance', 'side_entrance'],
      required: true,
    },
    entryDeviceId: {
      type: String,
    },
    entryIPAddress: {
      type: String,
    },

    // Exit Information
    exitTime: {
      type: Date,
      default: null,
    },
    exitScannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    exitGate: {
      type: String,
      enum: ['gate_1', 'gate_2', 'main_entrance', 'side_entrance'],
      default: null,
    },
    exitDeviceId: {
      type: String,
    },
    exitIPAddress: {
      type: String,
    },

    // Duration and Status
    totalDuration: {
      // in minutes
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['checked_in', 'checked_out', 'exit_pending'],
      default: 'checked_in',
    },

    // QR Validation
    qrValid: {
      type: Boolean,
      default: true,
    },

    // Alerts and Issues
    anomalies: [
      {
        type: String,
        enum: ['qr_expired', 'multiple_entries', 'unusual_time'],
      },
    ],
    adminNotes: {
      type: String,
    },

    // Visitor Details Snapshot (for reporting)
    visitorSnapshot: {
      firstName: String,
      lastName: String,
      phoneNumber: String,
      aadhaarNumber: String,
      visitPurpose: String,
      departmentToVisit: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculate total duration on checkout
 */
entryLogSchema.methods.calculateDuration = function () {
  if (this.entryTime && this.exitTime) {
    const duration = (this.exitTime - this.entryTime) / (1000 * 60); // in minutes
    this.totalDuration = Math.round(duration);
    this.status = 'checked_out';
  }
};

/**
 * Pre-save hook to calculate duration
 */
entryLogSchema.pre('save', function () {
  if (this.exitTime && !this.totalDuration) {
    this.calculateDuration();
  }
});

// Indexes for better query performance
entryLogSchema.index({ visitor: 1, createdAt: -1 });
entryLogSchema.index({ qrUniqueId: 1 });
entryLogSchema.index({ entryTime: -1 });
entryLogSchema.index({ status: 1 });
entryLogSchema.index({ entryGate: 1 });

module.exports = mongoose.model('EntryLog', entryLogSchema);
