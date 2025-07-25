const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Login Functionality...');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test server connection first
    console.log('1. Checking server connection...');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`, { timeout: 5000 });
      console.log('✅ Server is responding');
    } catch (error) {
      console.log('❌ Server not responding on port 5000');
      console.log('Please start the backend server: cd server && npm run dev');
      return;
    }
    
    // Test login with common credentials
    console.log('\n2. Testing login...');
    const testCredentials = [
      { email: 'test@example.com', password: 'password123' },
      { email: 'admin@devspace.com', password: 'admin123' },
      { email: 'user@test.com', password: 'password' }
    ];
    
    for (const creds of testCredentials) {
      try {
        console.log(`Trying login with ${creds.email}...`);
        const response = await axios.post(`${baseURL}/auth/login`, creds);
        
        if (response.data.success) {
          console.log('✅ Login successful!');
          console.log(`User: ${response.data.user.username}`);
          console.log(`Token: ${response.data.token ? 'Present' : 'Missing'}`);
          return;
        } else {
          console.log('❌ Login failed:', response.data.message);
        }
      } catch (error) {
        if (error.response) {
          console.log(`❌ Login failed for ${creds.email}:`, error.response.data.message);
        } else {
          console.log(`❌ Network error for ${creds.email}:`, error.message);
        }
      }
    }
    
    console.log('\n❌ All login attempts failed. This might be due to:');
    console.log('1. Database connection issues');
    console.log('2. No test users in database');
    console.log('3. Database migration needed for new avatarIcon field');
    console.log('4. Backend server errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin().catch(console.error);
