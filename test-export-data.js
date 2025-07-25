const axios = require('axios');

async function testExportData() {
  console.log('🧪 Testing Data Export Functionality...');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // First, we need to login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed - user may not exist');
      console.log('Please ensure you have a test user with email: test@example.com');
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test export data endpoint
    console.log('2. Testing export data endpoint...');
    const exportResponse = await axios.get(`${baseURL}/users/export-data`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Export endpoint responded successfully');
    console.log('📊 Export data summary:');
    
    const data = exportResponse.data.data;
    console.log(`   - Profile: ${data.user.profile.username} (${data.user.profile.fullName})`);
    console.log(`   - Total Snippets: ${data.summary.totalSnippets}`);
    console.log(`   - Total Projects: ${data.summary.totalProjects}`);
    console.log(`   - Starred Snippets: ${data.summary.totalStarredSnippets}`);
    console.log(`   - Member Since: ${data.summary.memberSince}`);
    console.log(`   - Export Date: ${data.exportDate}`);
    
    // Test file size
    const dataSize = JSON.stringify(data).length;
    console.log(`   - Export Size: ${(dataSize / 1024).toFixed(2)} KB`);
    
    console.log('\n✅ Data export functionality is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data}`);
    } else if (error.request) {
      console.error('   No response received - server may not be running');
      console.error('   Please start the backend server: cd server && npm run dev');
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
    return true;
  } catch (error) {
    console.log('❌ Backend server is not running on port 5000');
    console.log('Please start the backend server with: cd server && npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testExportData();
  }
}

main().catch(console.error);
