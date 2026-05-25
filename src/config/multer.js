/**
 * Multer Configuration
 * Handles file upload configurations for Aadhaar and profile pictures
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const aadhaarDir = path.join(__dirname, '../uploads/aadhaar');
const profileDir = path.join(__dirname, '../uploads/profile');

if (!fs.existsSync(aadhaarDir)) {
  fs.mkdirSync(aadhaarDir, { recursive: true });
}

if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

/**
 * Storage configuration for Aadhaar files
 */
const aadhaarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, aadhaarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `aadhaar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

/**
 * Storage configuration for profile pictures
 */
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

/**
 * File filter for documents (Aadhaar, ID proofs)
 */
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, PDF, WebP are allowed.'));
  }
};

/**
 * File filter for images (Profile pictures, selfies)
 */
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WebP are allowed.'));
  }
};

/**
 * Multer instance for Aadhaar uploads (max 5MB)
 */
const uploadAadhaar = multer({
  storage: aadhaarStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Multer instance for profile picture uploads (max 3MB)
 */
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

module.exports = {
  uploadAadhaar,
  uploadProfile,
};
