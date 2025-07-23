#!/usr/bin/env node

/**
 * Test Snippet Creation with Tags
 * This test checks if tags are properly saved and returned when creating snippets
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Testing Snippet Creation with Tags\n');

let authToken = '';
let userId = '';
let projectId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error making ${method} request to ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

async function step1_LoginUser() {
  console.log('1. Logging in with existing user...');
  
  try {
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: 'test@example.com',
      password: 'Password123'
    });
    authToken = loginResponse.token;
    userId = loginResponse.user.id;
    console.log('✅ User logged in successfully');
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Token: ${authToken ? 'Present' : 'Missing'}`);
  } catch (loginError) {
    console.error('❌ Failed to login user');
    throw loginError;
  }
}

async function step2_CreateProject() {
  console.log('\n2. Creating test project...');
  
  const projectData = {
    title: `Tag Test Project ${Date.now()}`,
    description: 'Project for testing tag functionality',
    isPublic: true
  };

  const response = await makeRequest('POST', '/projects', projectData);
  projectId = response.project.id;
  console.log('✅ Project created successfully');
  console.log(`   - Project ID: ${projectId}`);
}

async function step3_CreateSnippetWithTags() {
  console.log('\n3. Creating snippet with tags...');
  
  const snippetData = {
    projectId: projectId,
    title: 'Test Snippet with Tags',
    content: 'console.log("Testing tags functionality");',
    language: 'javascript',
    tags: ['test', 'javascript', 'debugging', 'console'],
    isPublic: true,
    allowCollaboration: false
  };

  console.log('📤 Sending snippet data:');
  console.log('   - Tags:', snippetData.tags);

  const response = await makeRequest('POST', '/code', snippetData);
  
  console.log('📥 Response received:');
  console.log('   - Snippet ID:', response.codeSnippet.id);
  console.log('   - Title:', response.codeSnippet.title);
  console.log('   - Tags in response:', response.codeSnippet.tags);
  
  if (response.codeSnippet.tags && response.codeSnippet.tags.length > 0) {
    console.log('✅ Tags saved successfully!');
    response.codeSnippet.tags.forEach((tag, index) => {
      console.log(`   - Tag ${index + 1}: ${tag.name || tag}`);
    });
  } else {
    console.log('❌ No tags found in response');
  }
  
  return response.codeSnippet;
}

async function step4_FetchSnippetToVerifyTags(snippetId) {
  console.log('\n4. Fetching snippet to verify tags...');
  
  const response = await makeRequest('GET', `/code/${snippetId}`);
  
  console.log('📥 Fetched snippet:');
  console.log('   - ID:', response.codeSnippet.id);
  console.log('   - Title:', response.codeSnippet.title);
  console.log('   - Tags:', response.codeSnippet.tags);
  
  if (response.codeSnippet.tags && response.codeSnippet.tags.length > 0) {
    console.log('✅ Tags retrieved successfully!');
    response.codeSnippet.tags.forEach((tag, index) => {
      console.log(`   - Tag ${index + 1}: ${tag.name || tag}`);
    });
  } else {
    console.log('❌ No tags found when fetching snippet');
  }
}

async function runTest() {
  try {
    await step1_LoginUser();
    await step2_CreateProject();
    const snippet = await step3_CreateSnippetWithTags();
    await step4_FetchSnippetToVerifyTags(snippet.id);
    
    console.log('\n🎉 Tag functionality test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
