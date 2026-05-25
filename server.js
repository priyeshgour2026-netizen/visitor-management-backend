require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ================= MIDDLEWARE =================

app.use(express.json());
app.use(cors());

// ================= ROUTES IMPORT =================

const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const visitorRoutes = require('./src/routes/visitorRoutes');

// ================= DATABASE CONNECTION =================

const MONGODB_URI = process.env.MONGODB_URI;

console.log('📡 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
    })
    .catch((error) => {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    });

// ================= API ROUTES =================

// Health Check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: 'Server is running'
    });
});

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/visitor', visitorRoutes);

// ================= API DOCS =================

app.get('/api/docs', (req, res) => {
    res.json({
        name: 'Visitor Management System API',
        version: '2.0.0',

        endpoints: {

            // Auth
            sendOtp: {
                method: 'POST',
                path: '/api/auth/send-otp'
            },

            verifyOtp: {
                method: 'POST',
                path: '/api/auth/verify-otp'
            },

            adminLogin: {
                method: 'POST',
                path: '/api/auth/login'
            },

            // Visitors
            createVisitor: {
                method: 'POST',
                path: '/api/visitor/create'
            },

            getVisitor: {
                method: 'GET',
                path: '/api/visitor/:id'
            },

            getHistory: {
                method: 'GET',
                path: '/api/visitor/history/:phoneNumber'
            },

            // Admin
            dashboard: {
                method: 'GET',
                path: '/api/admin/dashboard'
            },

            allVisitors: {
                method: 'GET',
                path: '/api/admin/visitors'
            },

            approveVisitor: {
                method: 'PUT',
                path: '/api/admin/approve/:id'
            },

            rejectVisitor: {
                method: 'PUT',
                path: '/api/admin/reject/:id'
            },

            dailyReport: {
                method: 'GET',
                path: '/api/admin/reports/daily'
            }
        }
    });
});

// ================= 404 HANDLER =================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {

    console.error('❌ Server Error:', err);

    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });

});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {

    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs\n`);

});