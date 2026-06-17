/**
 * Entry/Exit Controller
 * Handles visitor check-in and check-out operations
 */

const { sendSuccessResponse, sendErrorResponse } = require('../utils/apiResponse');
const Visitor = require('../models/Visitor');
const EntryLog = require('../models/EntryLog');
const { sendAnomalyAlert } = require('../services/notificationService');

/**
 * POST /api/entry/check-in
 * Record visitor check-in at entry gate
 */
const checkIn = async (req, res) => {
  try {
   
    console.log('🔥 CHECK-IN STARTED');
    console.log('BODY:', req.body);
    console.log('USER:', req.user);
  const qrUniqueId = req.body.qrUniqueId;
const gate = req.body.gate || req.body.gateNumber;
const deviceId = req.body.deviceId;

    // Validate inputs
    if (!qrUniqueId || !gate) {
      return sendErrorResponse(
        res,
        'QR unique ID and gate are required',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Find visitor by QR ID
    const visitor = await Visitor.findOne({ qrUniqueId });

    if (!visitor) {
      return sendErrorResponse(
        res,
        'Invalid QR code',
        404,
        'INVALID_QR'
      );
    }

    // Check if visitor is approved
    if (visitor.approvalStatus !== 'approved') {
      return sendErrorResponse(
        res,
        'Visitor is not approved',
        400,
        'VISITOR_NOT_APPROVED'
      );
    }

    // Check if QR is expired
    if (visitor.isQRExpired()) {
      return sendErrorResponse(
        res,
        'QR code has expired',
        400,
        'QR_EXPIRED'
      );
    }

    // Check for multiple entries (already checked in)
    const existingEntry = await EntryLog.findOne({
      qrUniqueId,
      status: { $in: ['checked_in', 'exit_pending'] },
    });

    const anomalies = [];

    if (existingEntry) {
      anomalies.push('multiple_entries');
    }

    // Create entry log
    const entryLog = new EntryLog({
      visitor: visitor._id,
      qrUniqueId,
      entryTime: new Date(),
      entryScannedBy: req.user?.id || null,
      entryGate: gate,
      entryDeviceId: deviceId,
      status: 'checked_in',
      anomalies,
      visitorSnapshot: {
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        phoneNumber: visitor.phoneNumber,
        aadhaarNumber: visitor.aadhaarNumber,
        visitPurpose: visitor.visitPurpose,
        departmentToVisit: visitor.departmentToVisit,
      },
    });

    await entryLog.save();

    // Update visitor status
    visitor.checkInTime = new Date();
    visitor.visitorStatus = 'checked_in';
    await visitor.save();

    // Send anomaly alert if detected
    if (anomalies.length > 0) {
      await sendAnomalyAlert(entryLog, anomalies);
    }

    return sendSuccessResponse(
      res,
      {
        entryLogId: entryLog._id,
        visitorName: visitor.getFullName(),
        checkInTime: entryLog.entryTime,
        gate,
        department: visitor.departmentToVisit,
        personToMeet: visitor.personToMeet,
      },
      'Visitor checked in successfully',
      200
    );
  } catch (error) {
    console.error('Check-in error:', error);
     console.error('\n====================');
  console.error('CHECK-IN ERROR');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('Full Error:', error);
  console.error('====================\n');
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * POST /api/entry/check-out
 * Record visitor check-out at exit gate
 */
const checkOut = async (req, res) => {
  try {
 const qrUniqueId = req.body.qrUniqueId;
const gate = req.body.gate || req.body.gateNumber;
const deviceId = req.body.deviceId;

    // Validate inputs
    if (!qrUniqueId || !gate) {
      return sendErrorResponse(
        res,
        'QR unique ID and gate are required',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Find entry log
    const entryLog = await EntryLog.findOne({
      qrUniqueId,
      status: { $in: ['checked_in', 'exit_pending'] },
    });

    if (!entryLog) {
      return sendErrorResponse(
        res,
        'No active check-in found for this QR',
        400,
        'NO_ACTIVE_CHECK_IN'
      );
    }

    // Update entry log
    entryLog.exitTime = new Date();
  entryLog.exitScannedBy = req.user?.id || null;
    entryLog.exitGate = gate;
    entryLog.exitDeviceId = deviceId;
    entryLog.calculateDuration();

    await entryLog.save();

    // Update visitor status
    const visitor = await Visitor.findById(entryLog.visitor);
    visitor.checkOutTime = new Date();
    visitor.visitorStatus = 'checked_out';
    visitor.calculateVisitDuration();
    await visitor.save();

    return sendSuccessResponse(
      res,
      {
        entryLogId: entryLog._id,
        visitorName: visitor.getFullName(),
        checkInTime: entryLog.entryTime,
        checkOutTime: entryLog.exitTime,
        totalDuration: entryLog.totalDuration,
        durationFormatted: `${Math.floor(entryLog.totalDuration / 60)}h ${entryLog.totalDuration % 60}m`,
      },
      'Visitor checked out successfully',
      200
    );
  } catch (error) {
    console.error('Check-out error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * GET /api/entry/logs/:visitorId
 * Get entry/exit logs for a visitor
 */
const getEntryLogs = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const logs = await EntryLog.find({ visitor: visitorId })
      .populate('entryScannedBy', 'name email')
      .populate('exitScannedBy', 'name email')
      .sort({ entryTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EntryLog.countDocuments({ visitor: visitorId });

    return res.status(200).json({
      success: true,
      message: 'Entry logs retrieved',
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        pageSize: parseInt(limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get entry logs error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};

/**
 * GET /api/entry/stats
 * Get entry/exit statistics
 */
const getEntryStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get stats for today
    const todayCheckIns = await EntryLog.countDocuments({
      entryTime: { $gte: today, $lt: tomorrow },
      status: { $in: ['checked_in', 'checked_out'] },
    });

    const todayCheckOuts = await EntryLog.countDocuments({
      exitTime: { $gte: today, $lt: tomorrow },
      status: 'checked_out',
    });

    const activeVisitors = await EntryLog.countDocuments({
      entryTime: { $gte: today, $lt: tomorrow },
      status: 'checked_in',
    });

    // Get average visit duration
    const avgDuration = await EntryLog.aggregate([
      {
        $match: {
          exitTime: { $gte: today, $lt: tomorrow },
          status: 'checked_out',
          totalDuration: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$totalDuration' },
        },
      },
    ]);

    return sendSuccessResponse(
      res,
      {
        todayCheckIns,
        todayCheckOuts,
        activeVisitors,
        averageVisitDuration: avgDuration[0]?.avgDuration || 0,
      },
      'Entry statistics retrieved',
      200
    );
  } catch (error) {
    console.error('Get entry stats error:', error);
    sendErrorResponse(res, error.message, 500, 'SERVER_ERROR');
  }
};


/**
 * GET /api/entry/live-monitoring
 * Get all visitors currently inside premises
 */
const getLiveMonitoring = async (req, res) => {
  try {
    const activeEntries = await EntryLog.find({
      status: 'checked_in',
    })
      .populate('visitor')
      .sort({ entryTime: -1 });

    const visitors = activeEntries.map((entry) => {
      const minutesInside = Math.floor(
        (Date.now() - new Date(entry.entryTime)) /
        (1000 * 60)
      );

      return {
        entryLogId: entry._id,
        visitorId: entry.visitor?._id,

        visitorName: entry.visitor
          ? `${entry.visitor.firstName} ${entry.visitor.lastName}`
          : 'Unknown',

        phoneNumber: entry.visitor?.phoneNumber || '',

        purpose:
          entry.visitor?.visitPurpose ||
          entry.visitorSnapshot?.visitPurpose ||
          '',

        department:
          entry.visitor?.departmentToVisit ||
          entry.visitorSnapshot?.departmentToVisit ||
          '',

        personToMeet:
          entry.visitor?.personToMeet || '',

        entryGate: entry.entryGate,

        entryTime: entry.entryTime,

        minutesInside,

        durationFormatted: `${Math.floor(
          minutesInside / 60
        )}h ${minutesInside % 60}m`,

        status: entry.status,

        qrUniqueId: entry.qrUniqueId,
      };
    });

    return sendSuccessResponse(
      res,
      {
        activeVisitors: visitors.length,
        visitors,
      },
      'Live monitoring data retrieved',
      200
    );
  } catch (error) {
    console.error('Live monitoring error:', error);

    return sendErrorResponse(
      res,
      error.message,
      500,
      'SERVER_ERROR'
    );
  }
};

module.exports = {
  checkIn,
  checkOut,
  getEntryLogs,
  getEntryStats,
  getLiveMonitoring,
};
