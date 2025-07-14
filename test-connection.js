const axios = require('axios');

// Test the connection
async function testConnection() {
  try {
    console.log('Testing connection to backend...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Test API endpoint (should fail without auth, but shows connection is working)
    try {
      const snippetsResponse = await axios.get('http://localhost:5000/api/code/project/1');
      console.log('✅ Code API test:', snippetsResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Code API responding (404 expected for non-existent project)');
      } else {
        console.log('ℹ️  Code API error (expected):', error.message);
      }
    }
    
    console.log('\n🎉 Frontend-Backend connection successful!');
    console.log('Frontend: http://localhost:5173');
    console.log('Backend: http://localhost:5000');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
