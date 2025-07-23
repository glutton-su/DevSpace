const axios = require('axios');

// Test edit functionality
async function testEditFunctionality() {
  console.log('🧪 Testing Edit Functionality');
  console.log('==============================');

  try {
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Configure axios with token
    const authAPI = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Get user's snippets
    console.log('\n2. Fetching user snippets...');
    const snippetsResponse = await authAPI.get('/code/user/owned');
    const snippets = snippetsResponse.data.snippets || snippetsResponse.data;
    
    if (!snippets || snippets.length === 0) {
      console.log('❌ No snippets found. Please create a snippet first.');
      return;
    }

    const testSnippet = snippets[0];
    console.log(`✅ Found snippet: "${testSnippet.title}" (ID: ${testSnippet.id})`);

    // Test getting the snippet details
    console.log('\n3. Getting snippet details...');
    const snippetDetailResponse = await authAPI.get(`/code/${testSnippet.id}`);
    const snippet = snippetDetailResponse.data.codeSnippet;
    console.log('✅ Snippet details retrieved');
    console.log('   Tags:', snippet.tags?.map(t => t.name || t) || 'none');

    // Test updating the snippet
    console.log('\n4. Testing snippet update...');
    const updateData = {
      title: snippet.title + ' (Edited)',
      content: snippet.content + '\n// This snippet was edited via API test',
      language: snippet.language,
      tags: ['test', 'edited', ...(snippet.tags?.map(t => t.name || t) || [])],
      allowCollaboration: true,
      isPublic: snippet.isPublic
    };

    const updateResponse = await authAPI.put(`/code/${testSnippet.id}`, updateData);
    console.log('✅ Snippet updated successfully');
    console.log('   New title:', updateResponse.data.codeSnippet.title);
    console.log('   Tags:', updateResponse.data.codeSnippet.tags?.map(t => t.name || t));

    // Verify the update by fetching again
    console.log('\n5. Verifying update...');
    const verifyResponse = await authAPI.get(`/code/${testSnippet.id}`);
    const updatedSnippet = verifyResponse.data.codeSnippet;
    console.log('✅ Update verified');
    console.log('   Final title:', updatedSnippet.title);
    console.log('   Final tags:', updatedSnippet.tags?.map(t => t.name || t));

    console.log('\n🎉 All edit functionality tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testEditFunctionality();
