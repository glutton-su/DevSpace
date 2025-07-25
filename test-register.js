const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testRegister() {
  try {
    const testUser = {
      fullName: 'Test User Full Name',
      username: 'testuser123',
      email: 'testuser123@example.com',
      password: 'testpassword123'
    };

    console.log('🧪 Testing user registration...');
    console.log('Request data:', testUser);

    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if fullName was properly saved
    if (response.data.user && response.data.user.fullName === testUser.fullName) {
      console.log('✅ fullName field correctly saved and returned');
    } else {
      console.log('❌ fullName field not properly handled');
    }

    // Check if name field exists for frontend compatibility
    if (response.data.user && response.data.user.name === testUser.fullName) {
      console.log('✅ name field correctly mapped for frontend compatibility');
    } else {
      console.log('❌ name field not properly mapped');
    }

  } catch (error) {
    console.error('❌ Registration failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function testLogin() {
  try {
    const loginData = {
      email: 'testuser123@example.com',
      password: 'testpassword123'
    };

    console.log('\n🧪 Testing user login...');
    console.log('Request data:', loginData);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function cleanup() {
  // Note: You would need a delete user endpoint for cleanup
  console.log('\n🧹 Cleanup would require a delete user endpoint');
}

async function runTests() {
  await testRegister();
  await testLogin();
  await cleanup();
}

if (require.main === module) {
  runTests();
}

module.exports = { testRegister, testLogin };
