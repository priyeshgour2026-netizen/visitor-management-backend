/**
 * Notification Model
 * Stores notifications for visitors and admins
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientPhoneNumber: {
      type: String,
    },

    // Related Entity
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
    },
    entryLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EntryLog',
    },

    // Notification Content
    type: {
      type: String,
      enum: [
        'otp_sent',
        'approval_approved',
        'approval_rejected',
        'check_in_reminder',
        'check_out_reminder',
        'visitor_arrived',
        'anomaly_detected',
        'daily_summary',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    content: {
      type: Object, // Store additional data
      default: {},
    },

    // Delivery Channels
    channels: {
      sms: {
        type: Boolean,
        default: false,
      },
      push: {
        type: Boolean,
        default: false,
      },
      email: {
        type: Boolean,
        default: false,
      },
      inApp: {
        type: Boolean,
        default: true,
      },
    },

    // Delivery Status
    deliveryStatus: {
      sms: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'not_configured'],
        default: 'pending',
      },
      push: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'not_configured'],
        default: 'pending',
      },
      email: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'not_configured'],
        default: 'pending',
      },
    },

    // Read Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // Retry Information
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    lastRetryAt: {
      type: Date,
    },

    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // Expiry
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Mark notification as read
 */
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

/**
 * Check if notification has expired
 */
notificationSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ visitor: 1 });
notificationSchema.index({ expiresAt: 1 });

// TTL index to automatically delete expired notifications after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Notification', notificationSchema);
