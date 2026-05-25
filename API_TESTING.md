# API Testing Guide

This document provides cURL examples for testing all API endpoints.

## Setup

Before testing, ensure:
1. Server is running: `npm run dev`
2. MongoDB is connected
3. Port 5000 is available

## Base URL
```
http://localhost:5000/api
```

## 1. Health Check

```bash
curl -X GET http://localhost:5000/health
```

## 2. API Endpoints Documentation

```bash
curl -X GET http://localhost:5000/api/docs
```

---

## Authentication Module

### Send OTP

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210"
  }'
```

### Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "otp": "123456",
    "deviceId": "device-unique-id"
  }'
```

Response includes `token` - save this for authenticated requests.

### Admin Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Visitor Module

### Create Visitor

```bash
curl -X POST http://localhost:5000/api/visitor/create \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "9876543210",
    "visitPurpose": "business_meeting",
    "departmentToVisit": "Sales",
    "personToMeet": "Mr. Smith",
    "emergencyContact": {
      "name": "Jane Doe",
      "phoneNumber": "9876543211"
    }
  }'
```

### Get Visitor Profile

```bash
curl -X GET http://localhost:5000/api/visitor/VISITOR_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Visitor

```bash
curl -X PUT http://localhost:5000/api/visitor/update/VISITOR_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "newemail@example.com"
  }'
```

### Get Visitor History

```bash
curl -X GET "http://localhost:5000/api/visitor/history/9876543210?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Upload Aadhaar

```bash
curl -X POST http://localhost:5000/api/upload/aadhaar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "visitorId=VISITOR_ID" \
  -F "aadhaarFile=@/path/to/aadhaar.jpg"
```

### Upload Selfie

```bash
curl -X POST http://localhost:5000/api/upload/selfie \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "visitorId=VISITOR_ID" \
  -F "selfieFile=@/path/to/selfie.jpg"
```

---

## QR Code Module

### Generate QR Code

```bash
curl -X POST http://localhost:5000/api/qr/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "visitorId": "VISITOR_ID"
  }'
```

### Validate QR Code

```bash
curl -X POST http://localhost:5000/api/qr/validate \
  -H "Content-Type: application/json" \
  -d '{
    "qrUniqueId": "qr-unique-id-here"
  }'
```

### Get QR Details

```bash
curl -X GET http://localhost:5000/api/qr/QR_UNIQUE_ID
```

---

## Entry/Exit Module

### Check-In

```bash
curl -X POST http://localhost:5000/api/entry/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "qrUniqueId": "qr-unique-id",
    "gate": "gate_1",
    "deviceId": "scanner-device-001"
  }'
```

### Check-Out

```bash
curl -X POST http://localhost:5000/api/entry/check-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "qrUniqueId": "qr-unique-id",
    "gate": "main_entrance",
    "deviceId": "scanner-device-001"
  }'
```

### Get Entry Logs

```bash
curl -X GET "http://localhost:5000/api/entry/logs/VISITOR_ID?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Entry Statistics

```bash
curl -X GET http://localhost:5000/api/entry/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Admin Module

### Dashboard Analytics

```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get All Visitors

```bash
# Without filters
curl -X GET http://localhost:5000/api/admin/visitors \
  -H "Authorization: Bearer ADMIN_TOKEN"

# With filters
curl -X GET "http://localhost:5000/api/admin/visitors?page=1&limit=10&approvalStatus=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/admin/visitors?search=John" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# With date range
curl -X GET "http://localhost:5000/api/admin/visitors?dateFrom=2024-05-01&dateTo=2024-05-31" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Approve Visitor

```bash
curl -X PUT http://localhost:5000/api/admin/approve/VISITOR_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "adminNotes": "Approved after verification"
  }'
```

### Reject Visitor

```bash
curl -X PUT http://localhost:5000/api/admin/reject/VISITOR_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "rejectionReason": "Invalid documentation"
  }'
```

### Get Daily Report

```bash
curl -X GET "http://localhost:5000/api/admin/reports/daily?date=2024-05-24" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Complete Workflow Example

### Step 1: Send OTP to Phone
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210"
  }' | jq -r '.data.token')

echo "OTP sent. Enter OTP when prompted."
read OTP
```

### Step 2: Verify OTP and Get Token
```bash
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{
    \"phoneNumber\": \"9876543210\",
    \"otp\": \"$OTP\",
    \"deviceId\": \"device-001\"
  }")

TOKEN=$(echo $RESPONSE | jq -r '.data.token')
VISITOR_ID=$(echo $RESPONSE | jq -r '.data.visitor._id')

echo "Token: $TOKEN"
echo "Visitor ID: $VISITOR_ID"
```

### Step 3: Create Visitor Registration
```bash
curl -X POST http://localhost:5000/api/visitor/create \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "9876543210",
    "visitPurpose": "business_meeting",
    "departmentToVisit": "Sales",
    "personToMeet": "Mr. Smith"
  }'
```

### Step 4: Admin Login and Approve
```bash
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')

curl -X PUT http://localhost:5000/api/admin/approve/$VISITOR_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"adminNotes": "Approved"}'
```

### Step 5: Generate QR Code
```bash
QR_RESPONSE=$(curl -s -X POST http://localhost:5000/api/qr/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"visitorId\": \"$VISITOR_ID\"}")

QR_ID=$(echo $QR_RESPONSE | jq -r '.data.qrUniqueId')
echo "QR Code ID: $QR_ID"
```

### Step 6: Check-In
```bash
curl -X POST http://localhost:5000/api/entry/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"qrUniqueId\": \"$QR_ID\",
    \"gate\": \"gate_1\",
    \"deviceId\": \"scanner-001\"
  }"
```

### Step 7: Check-Out
```bash
curl -X POST http://localhost:5000/api/entry/check-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"qrUniqueId\": \"$QR_ID\",
    \"gate\": \"main_entrance\",
    \"deviceId\": \"scanner-001\"
  }"
```

---

## Common Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?approvalStatus=pending
?status=checked_in
?search=keyword
```

### Date Range
```
?dateFrom=2024-05-01&dateTo=2024-05-31
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-05-24T10:30:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "pageSize": 10,
    "totalItems": 50
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": { ... },
  "timestamp": "2024-05-24T10:30:00Z"
}
```

---

## Testing Tips

1. **Save Token to Variable**
   ```bash
   TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. **Use jq for JSON Parsing**
   ```bash
   curl ... | jq '.'
   curl ... | jq '.data'
   curl ... | jq -r '.data.token'
   ```

3. **Test with Postman**
   - Import the API endpoints
   - Set authorization header with Bearer token
   - Use environment variables for base URL and token

4. **Monitor Logs**
   ```bash
   # In another terminal
   tail -f server.log
   ```

---

## Troubleshooting

### 401 Unauthorized
- Token expired: Refresh using refresh-token endpoint
- Invalid token: Verify token format and JWT_SECRET

### 403 Forbidden
- Missing admin role
- Check user role in token

### 404 Not Found
- Resource doesn't exist
- Check resource ID

### 400 Bad Request
- Invalid input data
- Missing required fields
- Check request body format

---

**Last Updated:** May 24, 2024
