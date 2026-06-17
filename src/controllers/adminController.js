const Visitor = require('../models/Visitor');
const EntryLog = require('../models/EntryLog');

/**
 * GET DASHBOARD
 */
exports.getDashboard = async (req, res) => {
    try {

        // Visitor stats
        const stats = await Visitor.aggregate([
            {
                $group: {
                    _id: null,

                    total: { $sum: 1 },

                   pending: {
  $sum: {
    $cond: [
      { $eq: ['$approvalStatus', 'pending'] },
      1,
      0
    ]
  }
},

approved: {
  $sum: {
    $cond: [
      { $eq: ['$approvalStatus', 'approved'] },
      1,
      0
    ]
  }
},

rejected: {
  $sum: {
    $cond: [
      { $eq: ['$approvalStatus', 'rejected'] },
      1,
      0
    ]
  }
}
                }
            }
        ]);

        // Today dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's entries
        const todayEntries = await EntryLog.countDocuments({
            entryTime: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Checked in count
        const checkedIn = await EntryLog.countDocuments({
            entryTime: {
                $exists: true,
                $ne: null
            }
        });

        // Checked out count
        const checkedOut = await EntryLog.countDocuments({
            exitTime: {
                $exists: true,
                $ne: null
            }
        });

        // Recent entries
        const recentEntries = await EntryLog.find()
            .populate('visitor')
            .sort({ createdAt: -1 })
            .limit(10);

        const result = stats[0] || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        };

        console.log('===== DASHBOARD STATS =====');
        console.log('Total:', result.total);
        console.log('Pending:', result.pending);
        console.log('Approved:', result.approved);
        console.log('Rejected:', result.rejected);
        console.log('Checked In:', checkedIn);
        console.log('Checked Out:', checkedOut);

        res.json({
            success: true,

            dashboard: {
                totalVisitors: result.total,
                pending: result.pending,
                approved: result.approved,
                rejected: result.rejected,
                todayEntries,
                checkedIn,
                checkedOut,

                recentEntries: recentEntries.map(entry => ({
                    id: entry._id,

                    visitorName:
                        `${entry.visitor?.firstName || ''} ${entry.visitor?.lastName || ''}`,

                    mobile:
                        entry.visitor?.phoneNumber || '',

                    purpose:
                        entry.visitorSnapshot?.visitPurpose || '',

                    status:
                        entry.status,

                    checkInTime:
                        entry.entryTime,

                    checkOutTime:
                        entry.exitTime,
                }))
            }
        });

    } catch (error) {

        console.error('Dashboard error:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET ALL VISITORS
 */
exports.getAllVisitors = async (req, res) => {
    try {

        const visitors = await Visitor.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            visitors: visitors || []
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET SINGLE VISITOR
 */
exports.getVisitorById = async (req, res) => {
    try {

        const visitor = await Visitor.findById(
            req.params.id
        );

        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Visitor not found'
            });
        }

        res.json({
            success: true,
            visitor
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * APPROVE VISITOR
 */
exports.approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'approved'
      },
      { new: true }
    );

    res.json({
      success: true,
      visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/**
 * REJECT VISITOR
 */
exports.rejectVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'rejected',
        rejectionReason: req.body.reason
      },
      { new: true }
    );

    res.json({
      success: true,
      visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DAILY REPORT
 */
exports.getDailyReport = async (req, res) => {
    try {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const entries = await EntryLog.find({
            entryTime: { $gte: today }
        })
        .populate('visitor')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            report: entries
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};