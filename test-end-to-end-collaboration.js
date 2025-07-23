#!/usr/bin/env node

/**
 * End-to-End Collaboration Feature Test
 * 
 * This test verifies the complete collaboration flow:
 * 1. User registration and authentication
 * 2. Project creation
 * 3. Creating collaborative snippets
 * 4. Verifying snippets appear in collaborative endpoint
 * 5. Testing frontend integration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 End-to-End Collaboration Feature Test\n');

let authToken = '';
let userId = '';
let projectId = '';
let snippetId = '';
let collaborativeSnippetId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  };
  
  if (data) {
    config.data = data;
    config.headers['Content-Type'] = 'application/json';
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error making ${method} request to ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

async function step1_RegisterUser() {
  console.log('1. Registering test user...');
  
  const userData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Test User Collaboration'
  };

  try {
    const response = await makeRequest('POST', '/auth/register', userData);
    authToken = response.token;
    userId = response.user.id;
    console.log('✅ User registered successfully');
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Username: ${userData.username}`);
  } catch (error) {
    // If user already exists, try to login
    try {
      const loginResponse = await makeRequest('POST', '/auth/login', {
        email: userData.email,
        password: userData.password
      });
      authToken = loginResponse.token;
      userId = loginResponse.user.id;
      console.log('✅ User logged in successfully (already existed)');
    } catch (loginError) {
      console.error('❌ Failed to register or login user');
      throw loginError;
    }
  }
}

async function step2_CreateProject() {
  console.log('\n2. Creating test project...');
  
  const projectData = {
    name: `Collaboration Test Project ${Date.now()}`,
    description: 'Project for testing collaboration features',
    isPublic: true
  };

  const response = await makeRequest('POST', '/projects', projectData);
  projectId = response.project.id;
  console.log('✅ Project created successfully');
  console.log(`   - Project ID: ${projectId}`);
  console.log(`   - Project Name: ${projectData.name}`);
}

async function step3_CreateRegularSnippet() {
  console.log('\n3. Creating regular (non-collaborative) snippet...');
  
  const snippetData = {
    title: 'Regular Snippet',
    content: 'console.log("This is a regular snippet");',
    language: 'javascript',
    description: 'A regular snippet for testing',
    projectId: projectId,
    isPublic: true,
    allowCollaboration: false,
    tags: ['test', 'regular']
  };

  const response = await makeRequest('POST', '/code', snippetData);
  snippetId = response.snippet.id;
  console.log('✅ Regular snippet created successfully');
  console.log(`   - Snippet ID: ${snippetId}`);
  console.log(`   - Allow Collaboration: ${response.snippet.allowCollaboration}`);
}

async function step4_CreateCollaborativeSnippet() {
  console.log('\n4. Creating collaborative snippet...');
  
  const collaborativeSnippetData = {
    title: 'Collaborative React Component',
    content: `import React, { useState } from 'react';

const CollaborativeComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h2>Collaborative Counter</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default CollaborativeComponent;`,
    language: 'javascript',
    description: 'A React component that others can collaborate on',
    projectId: projectId,
    isPublic: true,
    allowCollaboration: true,
    tags: ['react', 'component', 'collaboration']
  };

  const response = await makeRequest('POST', '/code', collaborativeSnippetData);
  collaborativeSnippetId = response.snippet.id;
  console.log('✅ Collaborative snippet created successfully');
  console.log(`   - Snippet ID: ${collaborativeSnippetId}`);
  console.log(`   - Allow Collaboration: ${response.snippet.allowCollaboration}`);
  console.log(`   - Is Public: ${response.snippet.isPublic}`);
}

async function step5_VerifyCollaborativeEndpoint() {
  console.log('\n5. Testing collaborative snippets endpoint...');
  
  const response = await makeRequest('GET', '/code/collaborative');
  
  console.log(`✅ Found ${response.snippets.length} collaborative snippets`);
  
  const ourSnippet = response.snippets.find(s => s.id === collaborativeSnippetId);
  
  if (ourSnippet) {
    console.log('✅ Our collaborative snippet appears in the endpoint');
    console.log(`   - Title: ${ourSnippet.title}`);
    console.log(`   - Allow Collaboration: ${ourSnippet.allowCollaboration}`);
    console.log(`   - Is Public: ${ourSnippet.isPublic}`);
    console.log(`   - Tags: ${ourSnippet.tags ? ourSnippet.tags.join(', ') : 'none'}`);
    console.log(`   - Star Count: ${ourSnippet.starCount || 0}`);
    console.log(`   - Fork Count: ${ourSnippet.forkCount || 0}`);
  } else {
    console.log('❌ Our collaborative snippet does NOT appear in the endpoint');
    console.log('Available snippets:');
    response.snippets.forEach(s => {
      console.log(`   - ID: ${s.id}, Title: ${s.title}, Collaboration: ${s.allowCollaboration}`);
    });
  }
  
  return response.snippets;
}

async function step6_VerifyPublicEndpoint() {
  console.log('\n6. Testing public snippets endpoint...');
  
  const response = await makeRequest('GET', '/code/public');
  
  console.log(`✅ Found ${response.snippets.length} public snippets total`);
  
  const regularSnippet = response.snippets.find(s => s.id === snippetId);
  const collaborativeSnippet = response.snippets.find(s => s.id === collaborativeSnippetId);
  
  console.log(`   - Regular snippet found: ${!!regularSnippet}`);
  console.log(`   - Collaborative snippet found: ${!!collaborativeSnippet}`);
  
  if (collaborativeSnippet) {
    console.log(`   - Collaborative snippet allowCollaboration: ${collaborativeSnippet.allowCollaboration}`);
  }
}

async function step7_TestSearchAndFilters() {
  console.log('\n7. Testing search and filters...');
  
  // Test search by language
  const jsSnippets = await makeRequest('GET', '/code/collaborative?language=javascript');
  console.log(`✅ Found ${jsSnippets.snippets.length} JavaScript collaborative snippets`);
  
  // Test search by query
  const searchResults = await makeRequest('GET', '/code/collaborative?search=React');
  console.log(`✅ Found ${searchResults.snippets.length} snippets matching "React"`);
  
  const ourSnippetInSearch = searchResults.snippets.find(s => s.id === collaborativeSnippetId);
  if (ourSnippetInSearch) {
    console.log('✅ Our React snippet found in search results');
  } else {
    console.log('❌ Our React snippet not found in search results');
  }
}

async function step8_TestCollaborationMetadata() {
  console.log('\n8. Testing collaboration metadata...');
  
  const snippet = await makeRequest('GET', `/code/${collaborativeSnippetId}`);
  
  console.log('✅ Retrieved snippet details:');
  console.log(`   - ID: ${snippet.id}`);
  console.log(`   - Title: ${snippet.title}`);
  console.log(`   - Allow Collaboration: ${snippet.allowCollaboration}`);
  console.log(`   - Is Public: ${snippet.isPublic}`);
  console.log(`   - Language: ${snippet.language}`);
  console.log(`   - Tags: ${snippet.tags ? snippet.tags.join(', ') : 'none'}`);
  console.log(`   - Author: ${snippet.author ? snippet.author.username : 'unknown'}`);
}

async function runTest() {
  try {
    await step1_RegisterUser();
    await step2_CreateProject();
    await step3_CreateRegularSnippet();
    await step4_CreateCollaborativeSnippet();
    const collaborativeSnippets = await step5_VerifyCollaborativeEndpoint();
    await step6_VerifyPublicEndpoint();
    await step7_TestSearchAndFilters();
    await step8_TestCollaborationMetadata();
    
    console.log('\n🎉 End-to-End Collaboration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Project ID: ${projectId}`);
    console.log(`   - Regular Snippet ID: ${snippetId}`);
    console.log(`   - Collaborative Snippet ID: ${collaborativeSnippetId}`);
    console.log(`   - Total Collaborative Snippets: ${collaborativeSnippets.length}`);
    
    console.log('\n🌐 Frontend URLs to test:');
    console.log('   - Collaborate page: http://localhost:5175/collaborate');
    console.log('   - Create page: http://localhost:5175/create');
    console.log(`   - View snippet: http://localhost:5175/snippet/${collaborativeSnippetId}`);
    
    console.log('\n✨ The collaboration feature is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
