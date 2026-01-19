// Simple test file for the backend API
// Run with: node test-api.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

async function testRegister() {
  try {
    console.log('Testing Register endpoint...');
    const response = await axios.post(`${API_URL}/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    });
    
    console.log('✓ Register Success:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('✗ Register Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

async function testLogin(email, password) {
  try {
    console.log('Testing Login endpoint...');
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    
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

async function testGetMe(token) {
  try {
    console.log('Testing GetMe endpoint...');
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
    
    // Test register
    const registerData = await testRegister();
    console.log('\n');
    
    // Test login
    await testLogin('test@example.com', 'password123');
    console.log('\n');
    
    // Test getMe
    // await testGetMe(registerData);
    
    console.log('\n✓ All tests completed!');
  } catch (error) {
    console.error('\n✗ Tests failed');
    process.exit(1);
  }
}

runTests();
