/**
 * Express Application Configuration
 * Initializes middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const qrRoutes = require('./routes/qrRoutes');
const entryRoutes = require('./routes/entryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

/**
 * Middleware Configuration
 */

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Static files middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * API Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API version
app.get('/api/version', (req, res) => {
  res.status(200).json({
    version: '1.0.0',
    name: 'Visitor Management System API',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes with prefix
app.use('/api/auth', authRoutes);
app.use('/api/visitor', visitorRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/entry', entryRoutes);
app.use('/api/admin', adminRoutes);

/**
 * API Documentation/Swagger endpoint (optional)
 */
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    message: 'API Documentation',
    endpoints: {
      auth: {
        'POST /api/auth/send-otp': 'Send OTP to phone number',
        'POST /api/auth/verify-otp': 'Verify OTP and get JWT token',
        'POST /api/auth/login': 'Admin/Staff login',
        'POST /api/auth/refresh-token': 'Refresh JWT token',
        'POST /api/auth/logout': 'Logout user',
      },
      visitor: {
        'POST /api/visitor/create': 'Create visitor registration',
        'GET /api/visitor/:id': 'Get visitor profile',
        'PUT /api/visitor/update/:id': 'Update visitor profile',
        'GET /api/visitor/history/:phoneNumber': 'Get visitor history',
        'POST /api/upload/aadhaar': 'Upload Aadhaar with OCR',
        'POST /api/upload/selfie': 'Upload selfie photo',
      },
      qr: {
        'POST /api/qr/generate': 'Generate QR code',
        'POST /api/qr/validate': 'Validate QR code',
        'GET /api/qr/:qrUniqueId': 'Get QR details',
      },
      entry: {
        'POST /api/entry/check-in': 'Record check-in',
        'POST /api/entry/check-out': 'Record check-out',
        'GET /api/entry/logs/:visitorId': 'Get entry logs',
        'GET /api/entry/stats': 'Get entry statistics',
      },
      admin: {
        'GET /api/admin/dashboard': 'Admin dashboard analytics',
        'GET /api/admin/visitors': 'Get all visitors',
        'PUT /api/admin/approve/:id': 'Approve visitor',
        'PUT /api/admin/reject/:id': 'Reject visitor',
        'GET /api/admin/reports/daily': 'Get daily report',
      },
    },
  });
});

/**
 * Error Handling Middleware
 */

// 404 Not Found middleware (must be before error handler)
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
