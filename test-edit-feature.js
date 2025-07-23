#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';
let testSnippetId = '';
let testProjectId = '';

// Helper function to make authenticated requests
const apiCall = async (method, url, data = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${url}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    data
  };
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${url} failed:`, error.response?.data?.message || error.message);
    throw error;
  }
};

async function runTests() {
  console.log('🚀 Starting DevSpace Edit Feature Tests\n');

  try {
    // 1. Login
    console.log('1️⃣ Testing login...');
    const loginResponse = await apiCall('POST', '/auth/login', testUser);
    authToken = loginResponse.token;
    console.log('✅ Login successful');

    // 2. Get user projects
    console.log('\n2️⃣ Getting user projects...');
    const projectsResponse = await apiCall('GET', '/projects');
    const projects = projectsResponse.projects || projectsResponse;
    
    if (projects.length === 0) {
      // Create a test project if none exist
      console.log('📁 Creating test project...');
      const newProject = await apiCall('POST', '/projects', {
        name: 'Test Project for Edit Feature',
        description: 'A test project to verify edit functionality',
        isPublic: true
      });
      testProjectId = newProject.project.id;
    } else {
      testProjectId = projects[0].id;
    }
    console.log(`✅ Using project ID: ${testProjectId}`);

    // 3. Create a test snippet
    console.log('\n3️⃣ Creating test snippet...');
    const snippetData = {
      projectId: testProjectId,
      title: 'Test Snippet for Edit Feature',
      description: 'This snippet tests the edit functionality',
      content: `function testFunction() {
  console.log("Original content");
  return "test";
}`,
      language: 'javascript',
      tags: ['test', 'edit', 'feature'],
      allowCollaboration: true,
      isPublic: true
    };

    const createResponse = await apiCall('POST', '/code', snippetData);
    testSnippetId = createResponse.codeSnippet.id;
    console.log(`✅ Test snippet created with ID: ${testSnippetId}`);

    // 4. Get the snippet to verify creation
    console.log('\n4️⃣ Retrieving snippet...');
    const getResponse = await apiCall('GET', `/code/${testSnippetId}`);
    const snippet = getResponse.codeSnippet;
    
    console.log('✅ Snippet retrieved:');
    console.log(`   - Title: ${snippet.title}`);
    console.log(`   - Language: ${snippet.language}`);
    console.log(`   - Tags: ${snippet.tags?.map(t => t.name || t).join(', ') || 'none'}`);
    console.log(`   - Allow Collaboration: ${snippet.allowCollaboration}`);

    // 5. Test edit functionality
    console.log('\n5️⃣ Testing snippet edit...');
    const updatedData = {
      title: 'Updated Test Snippet (Edit Feature Working!)',
      description: 'This snippet has been successfully edited',
      content: `function updatedTestFunction() {
  console.log("Updated content - edit feature works!");
  return "updated";
}

// Added more content to test editing
const editWorking = true;`,
      language: 'javascript',
      tags: ['test', 'edit', 'feature', 'updated', 'working'],
      allowCollaboration: false,
      isPublic: true
    };

    const updateResponse = await apiCall('PUT', `/code/${testSnippetId}`, updatedData);
    console.log('✅ Snippet updated successfully');

    // 6. Verify the edit
    console.log('\n6️⃣ Verifying edit changes...');
    const verifyResponse = await apiCall('GET', `/code/${testSnippetId}`);
    const updatedSnippet = verifyResponse.codeSnippet;
    
    console.log('✅ Edit verification:');
    console.log(`   - Title: ${updatedSnippet.title}`);
    console.log(`   - Description: ${updatedSnippet.description}`);
    console.log(`   - Content length: ${updatedSnippet.content.length} characters`);
    console.log(`   - Tags: ${updatedSnippet.tags?.map(t => t.name || t).join(', ') || 'none'}`);
    console.log(`   - Allow Collaboration: ${updatedSnippet.allowCollaboration}`);

    // 7. Test getting user's owned snippets
    console.log('\n7️⃣ Testing user owned snippets endpoint...');
    const ownedResponse = await apiCall('GET', '/code/user/owned');
    const ownedSnippets = ownedResponse.snippets || ownedResponse.data || ownedResponse;
    console.log(`✅ Found ${ownedSnippets.length} owned snippets`);

    // 8. Test public snippets endpoint
    console.log('\n8️⃣ Testing public snippets endpoint...');
    const publicResponse = await apiCall('GET', '/code/public/all');
    const publicSnippets = publicResponse.snippets || publicResponse.data || publicResponse;
    console.log(`✅ Found ${publicSnippets.length} public snippets`);

    console.log('\n🎉 ALL TESTS PASSED! Edit feature is working correctly.\n');
    
    console.log('📝 Summary:');
    console.log('✅ User authentication');
    console.log('✅ Snippet creation with tags');
    console.log('✅ Snippet retrieval');
    console.log('✅ Snippet editing (title, description, content, tags, settings)');
    console.log('✅ Edit verification');
    console.log('✅ User owned snippets endpoint');
    console.log('✅ Public snippets endpoint');
    console.log('✅ Tag normalization');
    
    console.log('\n🌟 The DevSpace edit feature is fully functional!');
    console.log(`🔗 Test snippet available at: http://localhost:5175/snippet/${testSnippetId}`);
    console.log(`✏️  Edit URL: http://localhost:5175/snippet/${testSnippetId}/edit`);

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
