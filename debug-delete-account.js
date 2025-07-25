const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDeleteAccount() {
  try {
    // Create a test user first
    const testUser = {
      fullName: 'Delete Test User',
      username: 'deletetest' + Date.now(),
      email: 'deletetest' + Date.now() + '@example.com',
      password: 'testpassword123'
    };

    console.log('🧪 Testing account deletion with enhanced error handling...');

    // 1. Register test user
    console.log('1. Registering test user:', testUser.username);
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    
    if (!registerResponse.data.success) {
      throw new Error('Registration failed: ' + JSON.stringify(registerResponse.data));
    }

    const token = registerResponse.data.token;
    console.log('✅ Test user registered successfully');

    // 2. Create authenticated client
    const authAPI = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // 3. Try to delete the account
    console.log('2. Attempting to delete account...');
    const deleteResponse = await authAPI.delete('/users/account');
    
    console.log('✅ Account deletion successful!');
    console.log('Response status:', deleteResponse.status);
    console.log('Response data:', JSON.stringify(deleteResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed!');
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Headers:', error.response.headers);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data && error.response.data.error) {
        console.log('Specific Error:', error.response.data.error);
      }
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
    
    console.log('Full error object:', error);
  }
}

if (require.main === module) {
  testDeleteAccount();
}

module.exports = { testDeleteAccount };
