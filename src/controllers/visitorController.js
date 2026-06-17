const Visitor = require('../models/Visitor');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { execSync } = require('child_process');



const getVisitorById = async (req, res) => {
  try {

    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: visitor
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


/**
 * =========================
 * CREATE VISITOR
 * =========================
 */
const createVisitor = async (req, res) => {
  try {
    console.log('🔥 createVisitor hit');
    console.log('Body:', req.body);

    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      visitPurpose,
      departmentToVisit,
      personToMeet,
      company,
      aadhaarNumber,
      dob,
      gender,
      address
    } = req.body;

    if (!firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }

    const visitor = await Visitor.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      visitPurpose,
      departmentToVisit,
      personToMeet,
      company,
      aadhaarNumber,
      aadhaarData: {
        name: `${firstName} ${lastName}`,
        dob,
        gender,
        address
      },
      approvalStatus: 'pending',
      visitorStatus: 'registered',
      otpVerified: false
    });

    return res.status(201).json({
      success: true,
      message: 'Visitor created successfully',
      data: visitor
    });

  } catch (error) {
    console.log('❌ createVisitor error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * =========================
 * EXTRACT AADHAAR PDF (FIXED)
 * =========================
 */


const extractAadhaar = async (req, res) => {
  try {
    console.log('🔥 extractAadhaar hit');

    const file = req.file;
    const password = req.body?.password;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const inputPath = file.path;

    let buffer;

    try {
      buffer = fs.readFileSync(inputPath);
      await pdfParse(buffer);
    } catch (err) {
      console.log('⚠️ PDF encrypted');

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password required for this PDF'
        });
      }

      const outputPath = inputPath + '-decrypted.pdf';

      execSync(
        `qpdf --password=${password} --decrypt "${inputPath}" "${outputPath}"`
      );

      buffer = fs.readFileSync(outputPath);
    }

    const data = await pdfParse(buffer);

    return res.status(200).json({
      success: true,
      text: data.text
    });

  } catch (error) {
    console.log('❌ error:', error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createVisitor,
  extractAadhaar,
  getVisitorById
};