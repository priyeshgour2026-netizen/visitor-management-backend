#!/usr/bin/env node

/**
 * Test Script: Password-Protected Aadhaar PDF Extraction
 * Tests the new password support for encrypted Aadhaar PDFs
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

const BASE_URL = 'http://localhost:8000';
const API_ENDPOINT = '/api/visitor/extract-aadhaar';

/**
 * Test Case: Upload unencrypted Aadhaar PDF
 */
const testUnencryptedPDF = async (pdfPath) => {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Unencrypted Aadhaar PDF');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(pdfPath)) {
    console.log(`❌ Test PDF not found: ${pdfPath}`);
    return;
  }

  const form = new FormData();
  form.append('aadhaarFile', fs.createReadStream(pdfPath));

  try {
    const response = await makeRequest(form, 'POST', API_ENDPOINT);
    console.log('\nResponse Status:', response.statusCode);
    console.log('Response Body:');
    console.log(JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ SUCCESS: Unencrypted PDF extracted successfully');
    } else {
      console.log('❌ FAILED: Expected status 200');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
};

/**
 * Test Case: Upload encrypted PDF without password
 */
const testEncryptedPDFNoPassword = async (encryptedPdfPath) => {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Encrypted PDF Without Password');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(encryptedPdfPath)) {
    console.log(`❌ Encrypted test PDF not found: ${encryptedPdfPath}`);
    console.log('ℹ️  Note: Create an encrypted PDF to test this scenario');
    return;
  }

  const form = new FormData();
  form.append('aadhaarFile', fs.createReadStream(encryptedPdfPath));
  // No password provided

  try {
    const response = await makeRequest(form, 'POST', API_ENDPOINT);
    console.log('\nResponse Status:', response.statusCode);
    console.log('Response Body:');
    console.log(JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 400) {
      const body = response.body;
      if (body.code === 'PDF_PASSWORD_REQUIRED') {
        console.log('✅ SUCCESS: Correctly detected encrypted PDF and requested password');
      } else {
        console.log('❌ FAILED: Expected code "PDF_PASSWORD_REQUIRED"');
      }
    } else {
      console.log(`❌ FAILED: Expected status 400, got ${response.statusCode}`);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
};

/**
 * Test Case: Upload encrypted PDF with correct password
 */
const testEncryptedPDFWithCorrectPassword = async (encryptedPdfPath, password) => {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Encrypted PDF With Correct Password');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(encryptedPdfPath)) {
    console.log(`❌ Encrypted test PDF not found: ${encryptedPdfPath}`);
    console.log('ℹ️  Note: Create an encrypted PDF to test this scenario');
    return;
  }

  const form = new FormData();
  form.append('aadhaarFile', fs.createReadStream(encryptedPdfPath));
  form.append('password', password);

  try {
    const response = await makeRequest(form, 'POST', API_ENDPOINT);
    console.log('\nResponse Status:', response.statusCode);
    console.log('Response Body:');
    console.log(JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200) {
      const body = response.body;
      if (body.data && body.data.aadhaarNumber) {
        console.log('✅ SUCCESS: Encrypted PDF unlocked and Aadhaar extracted');
        console.log(`   Aadhaar Number: ${body.data.aadhaarNumber}`);
        console.log(`   Name: ${body.data.name}`);
        console.log(`   DOB: ${body.data.dob}`);
        console.log(`   Gender: ${body.data.gender}`);
      } else {
        console.log('❌ FAILED: Missing Aadhaar data in response');
      }
    } else {
      console.log(`❌ FAILED: Expected status 200, got ${response.statusCode}`);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
};

/**
 * Test Case: Upload encrypted PDF with wrong password
 */
const testEncryptedPDFWithWrongPassword = async (encryptedPdfPath) => {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Encrypted PDF With Wrong Password');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(encryptedPdfPath)) {
    console.log(`❌ Encrypted test PDF not found: ${encryptedPdfPath}`);
    console.log('ℹ️  Note: Create an encrypted PDF to test this scenario');
    return;
  }

  const form = new FormData();
  form.append('aadhaarFile', fs.createReadStream(encryptedPdfPath));
  form.append('password', 'wrongpassword');

  try {
    const response = await makeRequest(form, 'POST', API_ENDPOINT);
    console.log('\nResponse Status:', response.statusCode);
    console.log('Response Body:');
    console.log(JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 400) {
      const body = response.body;
      if (body.code === 'INVALID_PDF_PASSWORD') {
        console.log('✅ SUCCESS: Correctly rejected invalid password');
      } else {
        console.log('❌ FAILED: Expected code "INVALID_PDF_PASSWORD"');
      }
    } else {
      console.log(`❌ FAILED: Expected status 400, got ${response.statusCode}`);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
};

/**
 * Make HTTP request with FormData
 */
const makeRequest = (form, method = 'POST', endpoint = API_ENDPOINT) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + endpoint);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 8000,
      path: url.pathname + url.search,
      method: method,
      headers: form.getHeaders(),
      timeout: 30000,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    form.pipe(req);
  });
};

/**
 * Main test runner
 */
const runTests = async () => {
  console.log('\n' + '█'.repeat(60));
  console.log('🧪 Aadhaar PDF Password Support - Test Suite');
  console.log('█'.repeat(60));

  console.log('\nServer URL:', BASE_URL);
  console.log('API Endpoint:', API_ENDPOINT);

  // Test 1: Unencrypted PDF (if available)
  const unencryptedPdf = path.join(__dirname, 'test-aadhaar.pdf');
  await testUnencryptedPDF(unencryptedPdf);

  // Test 2-4: Encrypted PDF tests (if available)
  const encryptedPdf = path.join(__dirname, 'test-aadhaar-encrypted.pdf');
  
  if (fs.existsSync(encryptedPdf)) {
    await testEncryptedPDFNoPassword(encryptedPdf);
    await testEncryptedPDFWithCorrectPassword(encryptedPdf, 'PRIY2000');
    await testEncryptedPDFWithWrongPassword(encryptedPdf);
  } else {
    console.log('\n' + '⚠️'.repeat(30));
    console.log('ENCRYPTED PDF TESTS SKIPPED');
    console.log('To test encrypted PDF functionality:');
    console.log('1. Create an encrypted Aadhaar PDF with password "PRIY2000"');
    console.log('2. Save it as test-aadhaar-encrypted.pdf');
    console.log('⚠️'.repeat(30));
  }

  console.log('\n' + '█'.repeat(60));
  console.log('✅ Test suite completed!');
  console.log('█'.repeat(60) + '\n');
};

// Run tests
runTests().catch(console.error);
