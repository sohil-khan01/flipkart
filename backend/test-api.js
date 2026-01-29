// Simple test file for the backend API
// Run with: node test-api.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

async function testAdminLogin(pin) {
  try {
    console.log('Testing Admin Login endpoint...');
    const response = await axios.post(`${API_URL}/login`, { pin });
    
    console.log('✓ Login Success:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('✗ Login Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

async function testAdminMe(token) {
  try {
    console.log('Testing Admin Me endpoint...');
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✓ GetMe Success:', response.data);
  } catch (error) {
    console.error('✗ GetMe Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

async function runTests() {
  try {
    console.log('Starting API tests...\n');

    // User APIs are disabled. Only admin PIN is supported.
    const adminPin = process.env.ADMIN_PIN || '1234';
    const token = await testAdminLogin(adminPin);
    console.log('\n');
    await testAdminMe(token);
    
    console.log('\n✓ All tests completed!');
  } catch (error) {
    console.error('\n✗ Tests failed');
    process.exit(1);
  }
}

runTests();
