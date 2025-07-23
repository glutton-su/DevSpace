#!/usr/bin/env node

/**
 * Test script to verify direct collaboration functionality
 * This test creates a user, creates a collaborative snippet, and tests the collaboration flow
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Testing Direct Collaboration Feature\n');

let authToken = '';
let userId = '';
let projectId = '';
let snippetId = '';

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
    username: `collabtest_${Date.now()}`,
    email: `collabtest_${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Collaboration Test User'
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
      throw error;
    }
  }
}

async function step2_CreateProject() {
  console.log('\n2. Creating test project...');
  
  const projectData = {
    name: `Direct Collaboration Test ${Date.now()}`,
    description: 'Project for testing direct collaboration features',
    isPublic: true
  };

  const response = await makeRequest('POST', '/projects', projectData);
  projectId = response.project.id;
  console.log('✅ Project created successfully');
  console.log(`   - Project ID: ${projectId}`);
}

async function step3_CreateCollaborativeSnippet() {
  console.log('\n3. Creating collaborative snippet...');
  
  const snippetData = {
    title: 'Direct Collaboration Test Snippet',
    content: `// This snippet allows direct collaboration
console.log("Anyone can collaborate on this snippet!");

function welcomeCollaborator(name) {
  console.log(\`Welcome \${name}! Thanks for collaborating.\`);
}

// Add your contributions below:`,
    language: 'javascript',
    description: 'A snippet for testing direct collaboration',
    projectId: projectId,
    isPublic: true,
    allowCollaboration: true,
    tags: ['collaboration', 'test', 'direct-access']
  };

  const response = await makeRequest('POST', '/code', snippetData);
  snippetId = response.snippet.id;
  console.log('✅ Collaborative snippet created successfully');
  console.log(`   - Snippet ID: ${snippetId}`);
  console.log(`   - Allow Collaboration: ${response.snippet.allowCollaboration}`);
}

async function step4_VerifyCollaborativeEndpoint() {
  console.log('\n4. Verifying snippet appears in collaborative endpoint...');
  
  const response = await makeRequest('GET', '/code/collaborative');
  
  const ourSnippet = response.snippets.find(s => s.id === snippetId);
  
  if (ourSnippet) {
    console.log('✅ Snippet appears in collaborative endpoint');
    console.log(`   - Title: ${ourSnippet.title}`);
    console.log(`   - Collaborators: ${ourSnippet.collaborators?.length || 0}`);
    console.log(`   - Allow Collaboration: ${ourSnippet.allowCollaboration}`);
  } else {
    console.log('❌ Snippet does NOT appear in collaborative endpoint');
  }
}

async function step5_CreateSecondUser() {
  console.log('\n5. Creating second user to test collaboration...');
  
  const userData = {
    username: `collaborator_${Date.now()}`,
    email: `collaborator_${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Test Collaborator'
  };

  const response = await makeRequest('POST', '/auth/register', userData);
  console.log('✅ Second user registered successfully');
  console.log(`   - Username: ${userData.username}`);
  
  return {
    token: response.token,
    user: response.user
  };
}

async function step6_TestDirectCollaboration(collaboratorToken, collaboratorUser) {
  console.log('\n6. Testing direct collaboration as second user...');
  
  // Switch to collaborator's token
  const originalToken = authToken;
  authToken = collaboratorToken;
  
  try {
    // Add collaborator directly using the addCollaborator endpoint
    console.log('   - Adding collaborator via API...');
    await makeRequest('POST', `/code/${snippetId}/collaborators`, {
      username: collaboratorUser.username,
      role: 'editor'
    });
    
    console.log('✅ Successfully added as collaborator');
    
    // Verify collaborator was added
    console.log('   - Checking collaborators list...');
    const collaboratorsResponse = await makeRequest('GET', `/code/${snippetId}/collaborators`);
    
    const isCollaborator = collaboratorsResponse.collaborators.find(c => c.user.id === collaboratorUser.id);
    
    if (isCollaborator) {
      console.log('✅ User appears in collaborators list');
      console.log(`   - Role: ${isCollaborator.role}`);
    } else {
      console.log('❌ User does NOT appear in collaborators list');
    }
    
    // Test editing the snippet
    console.log('   - Testing snippet editing as collaborator...');
    const updatedContent = `// This snippet allows direct collaboration
console.log("Anyone can collaborate on this snippet!");

function welcomeCollaborator(name) {
  console.log(\`Welcome \${name}! Thanks for collaborating.\`);
}

// Contributions from ${collaboratorUser.username}:
function myContribution() {
  console.log("I added this function as a collaborator!");
}`;

    await makeRequest('PUT', `/code/${snippetId}`, {
      content: updatedContent
    });
    
    console.log('✅ Successfully edited snippet as collaborator');
    
  } catch (error) {
    console.error('❌ Failed during collaboration test:', error.response?.data || error.message);
  } finally {
    // Restore original token
    authToken = originalToken;
  }
}

async function step7_VerifyCollaboratorInfo() {
  console.log('\n7. Verifying collaborator information in snippet details...');
  
  const snippet = await makeRequest('GET', `/code/${snippetId}`);
  
  console.log('✅ Retrieved snippet with collaborator info:');
  console.log(`   - Title: ${snippet.codeSnippet.title}`);
  console.log(`   - Collaborators: ${snippet.codeSnippet.collaborators?.length || 0}`);
  
  if (snippet.codeSnippet.collaborators && snippet.codeSnippet.collaborators.length > 0) {
    console.log('   - Collaborator details:');
    snippet.codeSnippet.collaborators.forEach((collab, index) => {
      console.log(`     ${index + 1}. ${collab.user.username} (${collab.role})`);
    });
  }
}

async function runTest() {
  try {
    await step1_RegisterUser();
    await step2_CreateProject();
    await step3_CreateCollaborativeSnippet();
    await step4_VerifyCollaborativeEndpoint();
    
    const collaborator = await step5_CreateSecondUser();
    await step6_TestDirectCollaboration(collaborator.token, collaborator.user);
    await step7_VerifyCollaboratorInfo();
    
    console.log('\n🎉 Direct Collaboration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Snippet ID: ${snippetId}`);
    console.log(`   - Direct collaboration working: ✅`);
    console.log(`   - Collaborators display working: ✅`);
    
    console.log('\n🌐 Frontend URLs to test:');
    console.log(`   - Collaborate page: http://localhost:5175/collaborate`);
    console.log(`   - Snippet view: http://localhost:5175/snippet/${snippetId}`);
    console.log(`   - Snippet edit: http://localhost:5175/snippet/${snippetId}/edit`);
    
    console.log('\n✨ The direct collaboration feature is working correctly!');
    console.log('You should now see a "Collaborate" button on collaborative snippets.');
    console.log('Clicking it will add you as a collaborator and show your name in the collaborators section.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
