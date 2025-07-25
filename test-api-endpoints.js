const axios = require('axios');

async function testSnippetAPIs() {
  console.log('🔍 Testing Snippet View APIs...\n');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test public snippets (Dashboard)
    console.log('📊 Testing Dashboard - Public Snippets...');
    const publicResponse = await axios.get(`${baseURL}/code/public`, { timeout: 5000 });
    console.log(`✅ Public snippets: ${publicResponse.data.snippets?.length || 0} found`);
    
    // Test collaborative snippets (Collaborate page)
    console.log('\n🤝 Testing Collaborate - Collaborative Snippets...');
    const collabResponse = await axios.get(`${baseURL}/code/collaborative`, { timeout: 5000 });
    console.log(`✅ Collaborative snippets: ${collabResponse.data.snippets?.length || 0} found`);
    
    // Test user profile snippets (requires username)
    console.log('\n👤 Testing Profile - Public user snippets...');
    try {
      const profileResponse = await axios.get(`${baseURL}/code/public/user/testuser`, { timeout: 5000 });
      console.log(`✅ User public snippets: ${profileResponse.data.snippets?.length || 0} found`);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log('ℹ️  Test user not found (expected if no test data)');
      } else {
        console.log('⚠️  User public snippets endpoint may have issues');
      }
    }
    
    console.log('\n✨ API tests completed!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on port 5000');
      console.log('Please start the backend server with: cd server && npm run dev');
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Main execution
testSnippetAPIs().catch(console.error);
