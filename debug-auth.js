const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🔍 Debugging Authentication Response\n');
  
  try {
    // Step 1: Register a new user
    console.log('1. Registering a new test user...');
    const registerData = {
      username: 'debuguser',
      email: 'debuguser@devspace.com',
      password: 'TestPass123!'
    };
    
    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, registerData);
      console.log('Register response structure:', JSON.stringify(registerResponse.data, null, 2));
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('✅ User already exists, proceeding with login');
      } else {
        console.log('Register error:', error.response?.data);
      }
    }

    // Step 2: Login and inspect response
    console.log('\n2. Logging in and inspecting response...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    
    console.log('Login response structure:', JSON.stringify(loginResponse.data, null, 2));
    console.log('Login response keys:', Object.keys(loginResponse.data));

  } catch (error) {
    console.error('❌ Debug test failed:', error.response?.data || error.message);
  }
}

testAuth();
