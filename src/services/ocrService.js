/**
 * Aadhaar OCR Service
 * Uses pdf-parse package internals and the embedded pdf.js build to support
 * encrypted Aadhaar PDFs with correct password handling.
 */

const fs = require('fs');
const path = require('path');

const normalizePassword = (password) => {
  if (typeof password !== 'string') return undefined;
  const trimmed = password.trim();
  return trimmed.length ? trimmed : undefined;
};

const cleanText = (text) => {
  return String(text || '')
    .replace(/\r\n|\r|\n|\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const isEncryptedPDF = (buffer) => {
  if (!Buffer.isBuffer(buffer)) return false;
  return buffer.includes(Buffer.from('/Encrypt'));
};

const buildError = (code, message, details = null) => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});

const parseXmlAttributes = (text, tagName) => {
  if (!text) return null;

  const regex = new RegExp(`<\\s*${tagName}([\\s\\S]*?)\\/?\\s*>`, 'i');
  const match = text.match(regex);
  if (!match) return null;

  const attrs = {};
  const attrRegex = /([A-Za-z_:][A-Za-z0-9_.:-]*)=(?:"([^"]*)"|'([^']*)')/g;
  let attrMatch;

  while ((attrMatch = attrRegex.exec(match[1]))) {
    attrs[attrMatch[1]] = attrMatch[2] || attrMatch[3] || '';
  }

  return Object.keys(attrs).length ? attrs : null;
};

const buildAddressFromXml = (attrs) => {
  const addressFields = [
    'house',
    'street',
    'lm',
    'loc',
    'vtc',
    'po',
    'subdist',
    'dist',
    'state',
    'pc',
  ];

  return addressFields
    .map((field) => attrs[field])
    .filter(Boolean)
    .map((value) => value.trim())
    .filter(Boolean)
    .join(', ');
};

const textLines = (text) =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const extractValueFromLabels = (lines, patterns) => {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }
  return '';
};

const extractAddressFromText = (lines) => {
  const startIndex = lines.findIndex((line) =>
    /\b(ADDRESS|पता|ADDRESS DETAILS)\b/i.test(line)
  );

  if (startIndex === -1) return '';

  const addressLines = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const nextLine = lines[i];
    if (/\b(DOB|DATE OF BIRTH|जन्मतिथि|GENDER|SEX|लिंग|UIDAI|AADHAAR|UID|VID|VIDE|Name|नाम|Father|पिता)\b/i.test(nextLine)) {
      break;
    }
    addressLines.push(nextLine);
  }

  return addressLines.join(', ').trim();
};

const parseFatherName = (text) => {
  const match = text.match(/(?:S\/?O|SON OF|DAUGHTER OF|C\/?O|CO)\s*[:\-]?\s*([A-Z\u0900-\u097F][A-Za-z\u0900-\u097F\s]{2,100})/i);
  return match ? match[1].trim() : '';
};

const hasDigitalSignatureIndicator = (text) =>
  /Digitally Signed|Digital Signature|Signed by UIDAI|UIDAI Digital|डिजिटल रूप से हस्ताक्षरित|डिज़िटल सिग्नेचर/i.test(text);

const getEmbeddedPDFJS = () => {
  const pdfParsePackagePath = path.dirname(require.resolve('pdf-parse'));
  const pdfJsBuildPath = path.join(
    pdfParsePackagePath,
    'lib',
    'pdf.js',
    'v1.9.426',
    'build',
    'pdf.js'
  );

  if (typeof PDFJS === 'undefined') {
    PDFJS = {};
  }

  return require(pdfJsBuildPath);
};

const extractTextFromPdfBuffer = async (buffer, password) => {
  const pdfPassword = normalizePassword(password);
  const PDFJS = getEmbeddedPDFJS();
  PDFJS.disableWorker = true;

  const loadingTask = PDFJS.getDocument({ data: buffer, password: pdfPassword });
  const doc = await loadingTask.promise;

  const numPages = doc.numPages;
  let text = '';

  for (let pageNumber = 1; pageNumber <= numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent({
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    });

    let lastY = null;
    for (const item of content.items) {
      if (lastY === item.transform[5] || lastY === null) {
        text += item.str;
      } else {
        text += '\n' + item.str;
      }
      lastY = item.transform[5];
    }
    text += '\n\n';
  }

  doc.destroy();
  return { text: cleanText(text), numPages };
};

const parsePdfBuffer = async (buffer, password) => {
  const pdfPassword = normalizePassword(password);

  if (isEncryptedPDF(buffer) && !pdfPassword) {
    return buildError('PDF_PASSWORD_REQUIRED', 'Encrypted PDF requires a password', null);
  }

  try {
    const parsed = await extractTextFromPdfBuffer(buffer, pdfPassword);
    if (!parsed.text || parsed.text.length < 20) {
      return buildError('EMPTY_TEXT', 'No extractable text found in PDF', null);
    }

    return {
      success: true,
      text: parsed.text,
      pageCount: parsed.numPages,
    };
  } catch (err) {
    const message = String(err.message || err);

    if (/password/i.test(message)) {
      return buildError(
        pdfPassword ? 'INVALID_PDF_PASSWORD' : 'PDF_PASSWORD_REQUIRED',
        pdfPassword ? 'Invalid PDF password' : 'Encrypted PDF requires a password',
        message
      );
    }

    return buildError('PARSE_ERROR', 'Unable to parse PDF file', message);
  }
};

const extractAadhaarData = (text) => {
  const cleaned = cleanText(text);
  const lines = textLines(text);

  const xmlAttrs =
    parseXmlAttributes(text, 'PrintLetterBarcodeData') ||
    parseXmlAttributes(text, 'OfflinePaperlessKyc') ||
    parseXmlAttributes(text, 'UidData');

  if (xmlAttrs) {
    let dobValue = xmlAttrs.dob || '';
    if (!dobValue && xmlAttrs.yob) {
      dobValue =
        extractValueFromLabels(lines, [
          /(?:DOB|DATE OF BIRTH|जन्मतिथि)\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
        ]) || xmlAttrs.yob;
    }

    return {
      name: xmlAttrs.name || '',
      fatherName: xmlAttrs.co || xmlAttrs.careof || '',
      dob: dobValue,
      gender: (xmlAttrs.gender || '').toUpperCase(),
      aadhaarNumber: xmlAttrs.uid || '',
      mobileNumber: xmlAttrs.mobl || xmlAttrs.mobile || '',
      address: buildAddressFromXml(xmlAttrs),
      vid: xmlAttrs.vid || '',
      digitallySigned: true,
      extractedFrom: 'XML',
    };
  }

  const aadhaarMatch = cleaned.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
  const dobMatch = cleaned.match(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/);
  const genderMatch = cleaned.match(/\b(MALE|FEMALE|M|F)\b/i);
  const mobileMatch = cleaned.match(/\b[6-9]\d{9}\b/);
  const vidMatch = cleaned.match(/\bVID\s*[:\-]?\s*(\d{12,16})\b/i);

  const nameMatch = extractValueFromLabels(lines, [
    /(?:NAME|नाम)\s*[:\-]?\s*(.+)$/i,
  ]);

  const fatherName =
    extractValueFromLabels(lines, [
      /(?:FATHER\s*NAME|पिता\s*का\s*नाम|S\/?O|SON OF|DAUGHTER OF|C\/?O|CO)\s*[:\-]?\s*(.+)$/i,
    ]) || parseFatherName(cleaned);

  const dobValue =
    extractValueFromLabels(lines, [
      /(?:DOB|DATE OF BIRTH|जन्मतिथि)\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    ]) || (dobMatch ? dobMatch[0] : '');

  const genderValue =
    extractValueFromLabels(lines, [
      /(?:GENDER|SEX|लिंग)\s*[:\-]?\s*(MALE|FEMALE|M|F)/i,
    ]) || (genderMatch ? genderMatch[1].toUpperCase() : '');

  const addressValue =
    extractAddressFromText(lines) ||
    extractValueFromLabels(lines, [
      /(?:ADDRESS|पता)\s*[:\-]?\s*(.+)$/i,
    ]);

  const nameLineFallback = lines.find((line) => {
    return (
      line.length > 3 &&
      !/GOVERNMENT|AADHAAR|UIDAI|DOB|DATE OF BIRTH|जन्मतिथि|FATHER|पिता|GENDER|लिंग|SEX|ADDRESS|पता|VID|UID|ENROLMENT/i.test(line)
    );
  });

  const nameValue = nameMatch || nameLineFallback || '';

  return {
    name: nameValue,
    fatherName: fatherName,
    dob: dobValue,
    gender: genderValue,
    aadhaarNumber: aadhaarMatch ? aadhaarMatch[0].replace(/\s/g, '') : '',
    mobileNumber: mobileMatch ? mobileMatch[0] : '',
    address: addressValue,
    vid: vidMatch ? vidMatch[1] : '',
digitallySigned: true,
  };
};

const validateAadhaarPDF = (text) => {
  const normalized = cleanText(text).toUpperCase();
  const errors = [];
  const xmlAttrs =
    parseXmlAttributes(text, 'PrintLetterBarcodeData') ||
    parseXmlAttributes(text, 'OfflinePaperlessKyc') ||
    parseXmlAttributes(text, 'UidData');

  if (!normalized || normalized.length < 20) {
    errors.push('PDF contains insufficient extractable text.');
  }

  if (!/\b(AADHAAR|AADHAR|UIDAI|UNIQUE IDENTIFICATION AUTHORITY OF INDIA|आधार)\b/i.test(normalized)) {
    errors.push('Aadhaar keywords are missing.');
  }

  if (!/\b\d{4}\s?\d{4}\s?\d{4}\b/.test(normalized) && !xmlAttrs) {
    errors.push('12-digit Aadhaar number not found.');
  }

  if (!/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/.test(normalized) && !xmlAttrs) {
    errors.push('Date of birth is missing.');
  }

  if (!/\b(MALE|FEMALE|M|F|पुरुष|महिला)\b/i.test(normalized) && !xmlAttrs) {
    errors.push('Gender information is missing.');
  }

  if (!xmlAttrs && !/\b(ADDRESS|पता|LOCATION|स्थान)\b/i.test(normalized)) {
    errors.push('Address section is missing.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const extractAadhaarDetails = async (filePath, password = undefined) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const parsed = await parsePdfBuffer(buffer, password);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error,
      };
    }

    const data = extractAadhaarData(parsed.text);

    return {
      success: true,
      data: {
        ...data,
        fullText: parsed.text,
      },
    };
  } catch (err) {
    return buildError('OCR_ERROR', 'Unable to process Aadhaar PDF', String(err.message || err));
  }
};

module.exports = {
  extractAadhaarDetails,
  validateAadhaarPDF,
};
