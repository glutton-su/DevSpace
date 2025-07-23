const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test Dashboard snippets loading
async function testDashboardSnippets() {
  try {
    console.log('🏠 Testing Dashboard snippets loading...\n');
    
    // 1. Test public snippets endpoint (unauthenticated)
    console.log('1. Testing public snippets (unauthenticated)...');
    const publicResponse = await axios.get(`${API_BASE_URL}/code/public/all`);
    console.log(`✅ Public snippets: ${publicResponse.data.snippets?.length || 0} found`);
    
    if (publicResponse.data.snippets && publicResponse.data.snippets.length > 0) {
      const snippet = publicResponse.data.snippets[0];
      console.log(`   📝 First snippet: "${snippet.title}"`);
      console.log(`   ⭐ Stars: ${snippet.starCount}, isStarred: ${snippet.isStarred}`);
      console.log(`   ❤️ Likes: ${snippet.likeCount}, isLiked: ${snippet.isLiked}`);
      console.log(`   👤 Author: ${snippet.project?.owner?.username}`);
    }
    
    // 2. Test with authentication
    console.log('\n2. Testing public snippets (authenticated)...');
    try {
      // Create a test user
      const timestamp = Date.now();
      await axios.post(`${API_BASE_URL}/auth/register`, {
        username: `dashtest${timestamp}`,
        email: `dashtest${timestamp}@example.com`,
        password: 'Password123'
      });
      
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: `dashtest${timestamp}@example.com`,
        password: 'Password123'
      });
      
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      const authPublicResponse = await axios.get(`${API_BASE_URL}/code/public/all`, { headers });
      console.log(`✅ Authenticated public snippets: ${authPublicResponse.data.snippets?.length || 0} found`);
      
      if (authPublicResponse.data.snippets && authPublicResponse.data.snippets.length > 0) {
        const snippet = authPublicResponse.data.snippets[0];
        console.log(`   📝 First snippet: "${snippet.title}"`);
        console.log(`   ⭐ Stars: ${snippet.starCount}, isStarred: ${snippet.isStarred}`);
        console.log(`   ❤️ Likes: ${snippet.likeCount}, isLiked: ${snippet.isLiked}`);
        
        // Test starring functionality
        console.log('\n3. Testing star functionality from Dashboard...');
        const starResponse = await axios.post(`${API_BASE_URL}/code/${snippet.id}/star`, {}, { headers });
        console.log(`   ✅ Star response:`, starResponse.data);
        
        // Check if snippet data is updated
        const updatedResponse = await axios.get(`${API_BASE_URL}/code/public/all`, { headers });
        const updatedSnippet = updatedResponse.data.snippets.find(s => s.id === snippet.id);
        if (updatedSnippet) {
          console.log(`   📊 After starring: Stars: ${updatedSnippet.starCount}, isStarred: ${updatedSnippet.isStarred}`);
        }
      }
      
    } catch (authError) {
      console.log(`⚠️ Authentication test failed: ${authError.response?.data?.message || authError.message}`);
    }
    
    console.log('\n🎉 Dashboard snippets test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDashboardSnippets();
