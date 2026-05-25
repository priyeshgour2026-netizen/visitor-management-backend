# Visitor Management System - Backend API

A production-ready backend for a comprehensive Visitor Management System built with Node.js, Express.js, and MongoDB. This system handles the complete visitor lifecycle from registration to check-out with OTP verification, document uploads, QR code generation, and admin analytics.

## 🌟 Features

### 1. **Authentication Module**
- OTP-based visitor authentication
- Email/password-based admin login
- JWT token generation and refresh
- Role-based access control
- Account lockout after failed attempts

### 2. **Visitor Management**
- Visitor registration with validation
- Profile management and updates
- Visit history tracking
- Emergency contact information

### 3. **Document Processing**
- Aadhaar upload with OCR extraction
- Selfie/profile photo upload
- Document validation and verification
- Secure file storage

### 4. **QR Code System**
- Dynamic QR code generation for visitors
- QR validation and expiry management
- Unique QR ID tracking
- Multiple visitor detection

### 5. **Entry/Exit Management**
- Gate-based check-in/check-out
- Real-time visit duration calculation
- Anomaly detection (multiple entries, unusual times)
- Entry statistics and reporting

### 6. **Admin Dashboard**
- Real-time visitor analytics
- Visitor approval/rejection workflow
- Daily, weekly, and monthly reports
- Department-wise visitor tracking
- Peak hour analysis

### 7. **Notification System**
- SMS notifications (OTP, approvals, alerts)
- Push notifications
- Email notifications
- In-app notifications
- Daily summary reports

## 🛠 Tech Stack

- **Runtime:** Node.js (v16+)
- **Framework:** Express.js v5.x
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **QR Code:** qrcode package
- **Document Validation:** bcryptjs for password hashing
- **Environment:** dotenv

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn
- MongoDB (local or Atlas)
- Git

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/visitor-management-backend.git
cd visitor-management-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Configure MongoDB Connection
Update `.env` with your MongoDB URI:
```env
MONGODB_URI=mongodb://localhost:27017/visitor-management
# Or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/visitor-management
```

### 5. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phoneNumber": "9876543210",
    "expiresIn": 600
  }
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otp": "123456",
  "deviceId": "device-uuid"
}

Response:
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "visitor": { ... }
  }
}
```

#### Admin Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": { ... }
  }
}
```

### Visitor Endpoints

#### Create Visitor
```http
POST /visitor/create
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "9876543210",
  "visitPurpose": "business_meeting",
  "departmentToVisit": "Sales",
  "personToMeet": "Manager Name",
  "emergencyContact": {
    "name": "Jane Doe",
    "phoneNumber": "9876543211"
  }
}

Response:
{
  "success": true,
  "message": "Visitor registration created successfully",
  "data": { ... }
}
```

#### Get Visitor Profile
```http
GET /visitor/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Visitor profile retrieved",
  "data": { ... }
}
```

#### Upload Aadhaar
```http
POST /upload/aadhaar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- visitorId: "visitor-id"
- aadhaarFile: <file>

Response:
{
  "success": true,
  "message": "Aadhaar uploaded and verified successfully",
  "data": {
    "visitorId": "...",
    "aadhaarFile": "/uploads/aadhaar/...",
    "aadhaarData": { ... },
    "confidence": 0.95
  }
}
```

### QR Code Endpoints

#### Generate QR Code
```http
POST /qr/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitorId": "visitor-id"
}

Response:
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "visitorId": "...",
    "visitorName": "John Doe",
    "qrCode": "data:image/png;base64,...",
    "qrUniqueId": "...",
    "expiresAt": "2024-05-25T10:30:00Z"
  }
}
```

#### Validate QR Code
```http
POST /qr/validate
Content-Type: application/json

{
  "qrUniqueId": "qr-unique-id"
}

Response:
{
  "success": true,
  "message": "QR code is valid",
  "data": {
    "valid": true,
    "visitor": { ... }
  }
}
```

### Entry/Exit Endpoints

#### Check-In
```http
POST /entry/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "qrUniqueId": "qr-unique-id",
  "gate": "gate_1",
  "deviceId": "scanner-device-id"
}

Response:
{
  "success": true,
  "message": "Visitor checked in successfully",
  "data": {
    "entryLogId": "...",
    "visitorName": "John Doe",
    "checkInTime": "2024-05-24T10:30:00Z",
    "department": "Sales"
  }
}
```

#### Check-Out
```http
POST /entry/check-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "qrUniqueId": "qr-unique-id",
  "gate": "main_entrance",
  "deviceId": "scanner-device-id"
}

Response:
{
  "success": true,
  "message": "Visitor checked out successfully",
  "data": {
    "entryLogId": "...",
    "visitorName": "John Doe",
    "checkInTime": "...",
    "checkOutTime": "...",
    "totalDuration": 45,
    "durationFormatted": "0h 45m"
  }
}
```

### Admin Endpoints

#### Dashboard
```http
GET /admin/dashboard
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": {
    "overview": {
      "totalVisitors": 245,
      "todayVisitors": 18,
      "pendingApprovals": 5,
      "activeVisitors": 12,
      "rejectedToday": 2
    },
    "today": {
      "checkIns": 18,
      "checkOuts": 12,
      "averageVisitDuration": 45
    },
    "distribution": { ... }
  }
}
```

#### Get All Visitors
```http
GET /admin/visitors?page=1&limit=10&approvalStatus=pending&search=John
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "message": "Visitors retrieved",
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Approve Visitor
```http
PUT /admin/approve/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "adminNotes": "Approved after verification"
}

Response:
{
  "success": true,
  "message": "Visitor approved successfully",
  "data": { ... }
}
```

#### Reject Visitor
```http
PUT /admin/reject/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "rejectionReason": "Invalid documentation"
}

Response:
{
  "success": true,
  "message": "Visitor rejected",
  "data": { ... }
}
```

#### Daily Report
```http
GET /admin/reports/daily?date=2024-05-24
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "message": "Daily report retrieved",
  "data": {
    "date": "2024-05-24",
    "summary": { ... },
    "visitPurposeBreakdown": [ ... ]
  }
}
```

## 🗂 Project Structure

```
visitor-management-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js       # MongoDB connection
│   │   ├── jwt.js            # JWT configuration
│   │   └── multer.js         # File upload config
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── visitorController.js
│   │   ├── qrController.js
│   │   ├── entryController.js
│   │   └── adminController.js
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── authorization.js  # Role-based access
│   │   └── errorHandler.js   # Error handling
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Visitor.js
│   │   ├── EntryLog.js
│   │   └── Notification.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── visitorRoutes.js
│   │   ├── qrRoutes.js
│   │   ├── entryRoutes.js
│   │   └── adminRoutes.js
│   ├── services/             # Business logic
│   │   ├── qrService.js      # QR code generation
│   │   ├── ocrService.js     # OCR processing
│   │   └── notificationService.js
│   ├── utils/                # Utility functions
│   │   ├── apiResponse.js    # Response formatting
│   │   └── otp.js            # OTP management
│   ├── uploads/              # File storage
│   │   ├── aadhaar/
│   │   └── profile/
│   └── app.js                # Express app setup
├── server.js                 # Server entry point
├── package.json              # Dependencies
├── .env.example              # Environment template
└── README.md                 # Documentation
```

## 🔐 Security Features

- **Password Hashing:** bcryptjs with salt rounds
- **JWT Authentication:** Stateless token-based auth
- **Rate Limiting:** Prevent brute-force attacks
- **Account Lockout:** After 5 failed login attempts
- **CORS Protection:** Configurable origin whitelist
- **Input Validation:** Server-side validation for all inputs
- **File Upload Security:** Type and size restrictions
- **Role-Based Access Control:** Granular permission management

## 🧪 Testing Endpoints

### Health Check
```http
GET http://localhost:5000/health

Response:
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-05-24T10:30:00Z"
}
```

### API Documentation
```http
GET http://localhost:5000/api/docs
```

### Version Info
```http
GET http://localhost:5000/api/version

Response:
{
  "version": "1.0.0",
  "name": "Visitor Management System API",
  "environment": "development"
}
```

## 📊 Database Models

### User
- Authentication for admins and staff
- Role-based permissions
- Login history and account lockout

### Visitor
- Visitor information and documents
- QR code tracking
- Check-in/out status
- Approval workflow

### EntryLog
- Entry and exit records
- Duration tracking
- Anomaly detection

### Notification
- Multi-channel notifications
- Delivery tracking
- Read status

## 🚦 Error Handling

All API errors follow a standardized format:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": { }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ERROR` - Resource already exists
- `SERVER_ERROR` - Internal server error

## 🔄 Visitor Workflow

1. **Registration:** Visitor creates account via OTP
2. **Form Submission:** Fill registration details
3. **Document Upload:** Upload Aadhaar and selfie
4. **OCR Processing:** Automatic document verification
5. **Admin Review:** Admin approves/rejects
6. **QR Generation:** Auto-generated after approval
7. **Check-In:** Scan QR at entry gate
8. **Check-Out:** Scan QR at exit gate
9. **Report:** Analytics and records stored

## 🔗 Integration Points

### Optional Integrations
- **SMS:** Twilio, AWS SNS, Firebase
- **Email:** SendGrid, AWS SES, Gmail
- **OCR:** Google Cloud Vision, AWS Textract
- **Face Recognition:** AWS Rekognition, Azure Face API
- **Push Notifications:** Firebase Cloud Messaging

## 📱 Environment Variables

Refer to `.env.example` for all configuration options.

## 🚢 Deployment

### Docker (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src
COPY server.js .

EXPOSE 5000

CMD ["npm", "start"]
```

### Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=<your-mongodb-uri>
git push heroku main
```

## 📈 Performance Optimization

- MongoDB indexing on frequently queried fields
- Pagination for large datasets
- Caching (implement Redis for production)
- Efficient database queries with aggregation pipeline
- File compression for uploads

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed
- Check MongoDB is running
- Verify connection string in .env
- Check firewall/security groups

### JWT Token Errors
- Ensure JWT_SECRET is set in .env
- Token may have expired, request new one
- Check token format in Authorization header

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review error logs
3. Verify .env configuration
4. Check MongoDB connection

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow the code style and add tests for new features.

## 🎯 Future Enhancements

- [ ] Real-time WebSocket notifications
- [ ] Advanced analytics dashboard
- [ ] Bulk visitor import
- [ ] API rate limiting middleware
- [ ] Request logging and monitoring
- [ ] Email notification templates
- [ ] SMS template management
- [ ] Visitor blacklist feature
- [ ] Integration with HR systems
- [ ] Mobile app support

---

**Version:** 1.0.0  
**Last Updated:** May 24, 2024
