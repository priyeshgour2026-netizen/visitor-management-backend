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
 * File filter for Aadhaar PDF (strict - PDF only)
 */
const aadhaarPdfFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    // Validate file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file extension. Only .pdf files are allowed for Aadhaar.'));
    }
  } else {
    cb(new Error('Invalid file format. Only PDF files are allowed for Aadhaar extraction.'));
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
 * Multer instance for Aadhaar PDF uploads (PDF only, max 5MB)
 */
const uploadAadhaarPDF = multer({
  storage: aadhaarStorage,
  fileFilter: aadhaarPdfFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Multer instance for Aadhaar uploads (all document types)
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
  uploadAadhaarPDF,
  uploadAadhaar,
  uploadProfile,
};
