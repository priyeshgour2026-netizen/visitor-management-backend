const express = require('express');
const router = express.Router();

const {
  createVisitor,
  getVisitorById,
  extractAadhaar
} = require('../controllers/visitorController');

const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// CREATE VISITOR
router.post('/create', createVisitor);
router.get('/:id', getVisitorById);

// AADHAAR EXTRACT
router.post(
  '/extract-aadhaar',
  upload.single('aadhaarFile'),
  extractAadhaar
  
);

module.exports = router;