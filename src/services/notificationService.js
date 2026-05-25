/**
 * Notification Service
 * Handles sending notifications via SMS, push, and email
 * Note: This is a mock implementation. In production, integrate with actual services.
 */

const Notification = require('../models/Notification');

/**
 * Send OTP via SMS
 * Mock implementation - integrate with Twilio, AWS SNS, etc.
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} otp - OTP to send
 * @returns {Promise<Object>} Send result
 */
const sendOTPviaSMS = async (phoneNumber, otp) => {
  try {
    // TODO: Integrate with SMS API (Twilio, AWS SNS, Firebase, etc.)
    console.log(`[Mock SMS] Sending OTP to ${phoneNumber}: ${otp}`);

    // In production:
    // const response = await twilioClient.messages.create({
    //   body: `Your OTP is: ${otp}. Valid for 10 minutes.`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: `+91${phoneNumber}`,
    // });

    // Simulate SMS sending delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return {
      success: false,
      message: `SMS sending failed: ${error.message}`,
    };
  }
};

/**
 * Send approval notification
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Send result
 */
const sendApprovalNotification = async (notification) => {
  try {
    // Save notification to database
    const savedNotification = await Notification.create(notification);

    // Send via SMS
    if (notification.channels.sms && notification.recipientPhoneNumber) {
      await sendNotificationSMS(
        notification.recipientPhoneNumber,
        notification.message
      );
    }

    // Send via push notification
    if (notification.channels.push) {
      // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
      console.log('[Mock Push]', notification.title, ':', notification.message);
    }

    // Send via email
    if (notification.channels.email) {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      console.log('[Mock Email]', notification.title, ':', notification.message);
    }

    return {
      success: true,
      notificationId: savedNotification._id,
      message: 'Notification sent successfully',
    };
  } catch (error) {
    console.error('Notification sending failed:', error);
    return {
      success: false,
      message: `Notification sending failed: ${error.message}`,
    };
  }
};

/**
 * Send visitor arrival notification
 * @param {Object} visitor - Visitor object
 * @param {string} recipientPhoneNumber - Recipient phone number
 * @returns {Promise<Object>} Send result
 */
const sendVisitorArrivalNotification = async (visitor, recipientPhoneNumber) => {
  try {
    const message = `${visitor.getFullName()} has arrived for ${visitor.visitPurpose}`;

    const notification = await Notification.create({
      recipientPhoneNumber,
      visitor: visitor._id,
      type: 'visitor_arrived',
      title: 'Visitor Arrived',
      message,
      channels: {
        sms: true,
        push: true,
        email: false,
        inApp: true,
      },
    });

    // Send SMS
    await sendNotificationSMS(recipientPhoneNumber, message);

    return {
      success: true,
      notificationId: notification._id,
      message: 'Notification sent',
    };
  } catch (error) {
    console.error('Visitor arrival notification failed:', error);
    return {
      success: false,
      message: `Failed to send notification: ${error.message}`,
    };
  }
};

/**
 * Send generic SMS notification
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Message to send
 * @returns {Promise<Object>} Send result
 */
const sendNotificationSMS = async (phoneNumber, message) => {
  try {
    // TODO: Integrate with SMS API
    console.log(`[Mock SMS] ${phoneNumber}: ${message}`);

    return {
      success: true,
      message: 'SMS sent successfully',
    };
  } catch (error) {
    console.error('SMS notification failed:', error);
    return {
      success: false,
      message: `Failed to send SMS: ${error.message}`,
    };
  }
};

/**
 * Send check-in reminder
 * @param {Object} visitor - Visitor object
 * @param {Object} user - User object
 * @returns {Promise<Object>} Send result
 */
const sendCheckInReminder = async (visitor, user) => {
  try {
    const notification = await Notification.create({
      recipient: user._id,
      recipientPhoneNumber: user.phoneNumber,
      visitor: visitor._id,
      type: 'check_in_reminder',
      title: 'Check-in Reminder',
      message: `Reminder: ${visitor.getFullName()} needs to check in`,
      channels: {
        sms: false,
        push: true,
        email: false,
        inApp: true,
      },
    });

    return {
      success: true,
      notificationId: notification._id,
      message: 'Reminder sent',
    };
  } catch (error) {
    console.error('Check-in reminder failed:', error);
    return {
      success: false,
      message: `Failed to send reminder: ${error.message}`,
    };
  }
};

/**
 * Send daily summary notification
 * @param {Object} summaryData - Summary data
 * @param {Object} user - Admin user object
 * @returns {Promise<Object>} Send result
 */
const sendDailySummary = async (summaryData, user) => {
  try {
    const message = `Daily Summary: ${summaryData.totalVisitors} visitors, ${summaryData.pendingApprovals} pending approvals`;

    const notification = await Notification.create({
      recipient: user._id,
      type: 'daily_summary',
      title: 'Daily Visitor Summary',
      message,
      content: summaryData,
      channels: {
        sms: false,
        push: true,
        email: true,
        inApp: true,
      },
    });

    return {
      success: true,
      notificationId: notification._id,
      message: 'Daily summary sent',
    };
  } catch (error) {
    console.error('Daily summary failed:', error);
    return {
      success: false,
      message: `Failed to send summary: ${error.message}`,
    };
  }
};

/**
 * Detect anomalies and send alert
 * @param {Object} entryLog - Entry log object
 * @param {Array} anomalies - Detected anomalies
 * @returns {Promise<Object>} Send result
 */
const sendAnomalyAlert = async (entryLog, anomalies) => {
  try {
    const anomalyList = anomalies.join(', ');
    const message = `Anomaly detected: ${anomalyList}`;

    // Get admin users to notify
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });

    const notifications = [];

    for (const admin of admins) {
      const notification = await Notification.create({
        recipient: admin._id,
        entryLog: entryLog._id,
        type: 'anomaly_detected',
        title: 'Anomaly Detected',
        message,
        priority: 'high',
        channels: {
          sms: true,
          push: true,
          email: false,
          inApp: true,
        },
      });

      notifications.push(notification);
    }

    return {
      success: true,
      notificationsSent: notifications.length,
      message: 'Anomaly alerts sent',
    };
  } catch (error) {
    console.error('Anomaly alert failed:', error);
    return {
      success: false,
      message: `Failed to send anomaly alert: ${error.message}`,
    };
  }
};

module.exports = {
  sendOTPviaSMS,
  sendApprovalNotification,
  sendVisitorArrivalNotification,
  sendNotificationSMS,
  sendCheckInReminder,
  sendDailySummary,
  sendAnomalyAlert,
};
