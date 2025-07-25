const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDeleteAccount() {
  try {
    // First, we need to register a test user and get a token
    const testUser = {
      fullName: 'Test Delete User',
      username: 'testdeleteuser',
      email: 'testdelete@example.com',
      password: 'testpassword123'
    };

    console.log('🧪 Testing account deletion flow...');

    // Register the test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    
    if (!registerResponse.data.success) {
      throw new Error('Registration failed');
    }

    const token = registerResponse.data.token;
    console.log('✅ Test user registered successfully');

    // Create authenticated API client
    const authAPI = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Test delete account
    console.log('2. Attempting to delete account...');
    const deleteResponse = await authAPI.delete('/users/account');
    
    console.log('✅ Account deletion successful!');
    console.log('Response status:', deleteResponse.status);
    console.log('Response data:', JSON.stringify(deleteResponse.data, null, 2));

    // Try to use the token again (should fail)
    console.log('3. Verifying token is invalidated...');
    try {
      await authAPI.get('/auth/profile');
      console.log('❌ Token still valid (this should not happen)');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.log('✅ Token properly invalidated');
      } else {
        console.log('❓ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Test failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function testDeleteAccountWithoutAuth() {
  try {
    console.log('\n🧪 Testing delete account without authentication...');
    const response = await axios.delete(`${API_BASE_URL}/users/account`);
    console.log('❌ This should have failed but succeeded:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Properly rejected unauthenticated request');
    } else {
      console.log('❓ Unexpected error:', error.response?.status, error.response?.data);
    }
  }
}

async function runTests() {
  await testDeleteAccount();
  await testDeleteAccountWithoutAuth();
}

if (require.main === module) {
  runTests();
}

module.exports = { testDeleteAccount, testDeleteAccountWithoutAuth };
