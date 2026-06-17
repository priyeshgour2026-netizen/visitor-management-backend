#!/usr/bin/env node

/**
 * Test Script for Aadhaar PDF Extraction API
 * 
 * This script tests various scenarios for the improved Aadhaar PDF verification API
 * 
 * Usage:
 *   node test-aadhaar-api.js
 * 
 * Note: Update BASE_URL to match your server configuration
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const FormData = require('form-data');

// Configuration
const BASE_URL = 'http://localhost:5000'; // Update based on your server
const EXTRACT_AADHAAR_ENDPOINT = '/api/visitor/extract-aadhaar';

// Test data
const tests = [];
let passCount = 0;
let failCount = 0;

/**
 * Test result formatter
 */
function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status}: ${name}`;
  
  if (details) {
    console.log(`${message}\n   Details: ${details}\n`);
  } else {
    console.log(message);
  }
  
  if (passed) {
    passCount++;
  } else {
    failCount++;
  }
}

/**
 * Make HTTP request to API
 */
function makeRequest(endpoint, file, fileName) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const form = new FormData();
    form.append('aadhaarFile', file, fileName);
    
    const options = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: form.getHeaders(),
      timeout: 10000,
    };
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers,
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            error: 'Failed to parse response as JSON',
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    form.pipe(req);
  });
}

/**
 * Create test PDF with valid Aadhaar content
 */
function createValidAadhaarPDF() {
  // Note: This is a simplified test PDF
  // In production, use actual PDF library like pdfkit or jsPDF
  
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
/F1 12 Tf
50 700 Td
(Government of India) Tj
0 -30 Td
(Unique Identification Authority of India) Tj
0 -30 Td
(AADHAAR) Tj
0 -50 Td
(Name: John Doe) Tj
0 -20 Td
(DOB: 15/05/1990) Tj
0 -20 Td
(Gender: MALE) Tj
0 -20 Td
(Aadhaar Number: 1234 5678 9012) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000797 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
876
%%EOF`;

  return Buffer.from(pdfContent);
}

/**
 * Create test PDF without Aadhaar keywords
 */
function createInvalidAadhaarPDF() {
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 300 >>
stream
BT
/F1 12 Tf
50 700 Td
(Random Document) Tj
0 -30 Td
(This is not an Aadhaar) Tj
0 -30 Td
(Just a regular PDF) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000597 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
676
%%EOF`;

  return Buffer.from(pdfContent);
}

/**
 * Create empty PDF
 */
function createEmptyPDF() {
  return Buffer.from('%PDF-1.4\n');
}

/**
 * Create bank statement PDF
 */
function createBankStatementPDF() {
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 400 >>
stream
BT
/F1 12 Tf
50 700 Td
(BANK STATEMENT) Tj
0 -30 Td
(Account Number: 1234567890) Tj
0 -20 Td
(IFSC Code: BANK0001) Tj
0 -20 Td
(MICR Code: 123456) Tj
0 -30 Td
(Balance: Rs. 50000) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000697 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
776
%%EOF`;

  return Buffer.from(pdfContent);
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Aadhaar PDF Extraction API - Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: Valid Aadhaar PDF
  try {
    console.log('Test 1: Valid Aadhaar PDF');
    const validPDF = createValidAadhaarPDF();
    const response = await makeRequest(BASE_URL + EXTRACT_AADHAAR_ENDPOINT, validPDF, 'aadhaar.pdf');
    
    const passed = response.statusCode === 200 && response.data.success === true;
    logTest(
      'Valid Aadhaar PDF should return 200 and extract data',
      passed,
      passed ? 'Status: ' + response.statusCode : 'Status: ' + response.statusCode + ', Data: ' + JSON.stringify(response.data)
    );
  } catch (err) {
    logTest('Valid Aadhaar PDF', false, err.message);
  }

  // Test 2: Invalid Aadhaar PDF (no keywords)
  try {
    console.log('Test 2: PDF without Aadhaar keywords');
    const invalidPDF = createInvalidAadhaarPDF();
    const response = await makeRequest(BASE_URL + EXTRACT_AADHAAR_ENDPOINT, invalidPDF, 'invalid.pdf');
    
    const passed = response.statusCode === 422;
    logTest(
      'Non-Aadhaar PDF should return 422',
      passed,
      'Status: ' + response.statusCode + ', Code: ' + response.data.errorCode
    );
  } catch (err) {
    logTest('Non-Aadhaar PDF', false, err.message);
  }

  // Test 3: Empty PDF
  try {
    console.log('Test 3: Empty PDF');
    const emptyPDF = createEmptyPDF();
    const response = await makeRequest(BASE_URL + EXTRACT_AADHAAR_ENDPOINT, emptyPDF, 'empty.pdf');
    
    const passed = response.statusCode === 400;
    logTest(
      'Empty PDF should return 400',
      passed,
      'Status: ' + response.statusCode + ', Code: ' + response.data.errorCode
    );
  } catch (err) {
    logTest('Empty PDF', false, err.message);
  }

  // Test 4: Bank Statement PDF (should be rejected)
  try {
    console.log('Test 4: Bank Statement PDF');
    const bankPDF = createBankStatementPDF();
    const response = await makeRequest(BASE_URL + EXTRACT_AADHAAR_ENDPOINT, bankPDF, 'bank.pdf');
    
    const passed = response.statusCode === 422;
    logTest(
      'Bank statement should be rejected with 422',
      passed,
      'Status: ' + response.statusCode + ', Code: ' + response.data.errorCode
    );
  } catch (err) {
    logTest('Bank statement rejection', false, err.message);
  }

  // Test 5: No file uploaded
  try {
    console.log('Test 5: No file uploaded');
    const form = new FormData();
    const url = new URL(EXTRACT_AADHAAR_ENDPOINT, BASE_URL);
    
    // Manual request without file
    const response = await new Promise((resolve, reject) => {
      const protocol = url.protocol === 'https:' ? https : http;
      const options = {
        method: 'POST',
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        headers: form.getHeaders(),
      };
      
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              data: JSON.parse(data),
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data: data,
            });
          }
        });
      });
      
      req.on('error', reject);
      form.pipe(req);
    });
    
    const passed = response.statusCode === 400;
    logTest(
      'Missing file should return 400',
      passed,
      'Status: ' + response.statusCode
    );
  } catch (err) {
    logTest('Missing file validation', false, err.message);
  }

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`Test Summary: ${passCount} Passed, ${failCount} Failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failCount === 0) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check the output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});

/**
 * Usage Instructions:
 * 
 * 1. Start your server: npm start
 * 2. Install form-data if not already installed: npm install form-data
 * 3. Run this test script: node test-aadhaar-api.js
 * 
 * The tests will verify:
 * - Valid Aadhaar PDF extraction
 * - Rejection of non-Aadhaar documents
 * - Rejection of empty PDFs
 * - Rejection of bank statements
 * - Error handling for missing files
 */
