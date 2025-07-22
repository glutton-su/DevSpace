const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testCollaborationFeature() {
  console.log('🔍 Testing Collaboration Feature\n');
  
  try {
    // Step 1: Test collaborative snippets endpoint
    console.log('1. Testing collaborative snippets endpoint...');
    try {
      const response = await axios.get(`${baseURL}/code/collaborative`);
      console.log('✅ Collaborative snippets endpoint accessible');
      
      const snippets = response.data.snippets || response.data.data || response.data;
      
      if (Array.isArray(snippets)) {
        console.log(`   - Found ${snippets.length} collaborative snippets`);
        
        if (snippets.length > 0) {
          const firstSnippet = snippets[0];
          console.log(`   - First snippet: "${firstSnippet.title}"`);
          console.log(`   - Allow Collaboration: ${firstSnippet.allowCollaboration}`);
          console.log(`   - Is Public: ${firstSnippet.isPublic}`);
          console.log(`   - Language: ${firstSnippet.language}`);
          console.log(`   - Author: ${firstSnippet.User?.username || firstSnippet.author?.username || 'Unknown'}`);
        } else {
          console.log('   ⚠️ No collaborative snippets found');
          console.log('   💡 Create a snippet with "Allow Collaboration" enabled to test');
        }
      } else {
        console.log('   ⚠️ Unexpected response format:', typeof snippets);
      }
    } catch (error) {
      console.log('❌ Collaborative snippets endpoint error:', error.response?.status, error.response?.statusText);
      if (error.response?.status === 404) {
        console.log('   💡 The collaborative route may not be added to the backend router yet');
      }
    }

    // Step 2: Test regular snippets endpoint for comparison
    console.log('\n2. Testing regular snippets endpoint...');
    try {
      const response = await axios.get(`${baseURL}/code`);
      const snippets = response.data.snippets || response.data.data || response.data;
      
      if (Array.isArray(snippets)) {
        const collaborativeCount = snippets.filter(s => s.allowCollaboration).length;
        console.log(`   - Total snippets: ${snippets.length}`);
        console.log(`   - Collaborative snippets: ${collaborativeCount}`);
        console.log(`   - Non-collaborative snippets: ${snippets.length - collaborativeCount}`);
      }
    } catch (error) {
      console.log('❌ Regular snippets endpoint error:', error.response?.status, error.response?.statusText);
    }

    console.log('\n📋 Collaboration Feature Test Summary:');
    console.log('   1. Collaborative snippets should only show snippets with allowCollaboration: true');
    console.log('   2. Regular snippets endpoint shows all public snippets');
    console.log('   3. Create page should have "Allow Collaboration" toggle');
    console.log('   4. Collaborate page should display collaborative snippets with collaboration badge');
    console.log('');
    console.log('🔧 To test the full flow:');
    console.log('   1. Go to /create and create a snippet with "Allow Collaboration" enabled');
    console.log('   2. Go to /collaborate and verify the snippet appears there');
    console.log('   3. Toggle "Allow Collaboration" off and verify it disappears from /collaborate');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCollaborationFeature();
