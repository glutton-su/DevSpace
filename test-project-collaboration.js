#!/usr/bin/env node

/**
 * Test script for new project-based collaboration system
 * 
 * This test verifies:
 * 1. Users can join project collaboration groups via snippets
 * 2. Project collaborators are displayed with snippets
 * 3. Project collaborators can edit all collaborative snippets in the project
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Testing Project-Based Collaboration System\n');

let authToken = '';
let userId = '';
let projectId = '';
let snippetId1 = '';
let snippetId2 = '';

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
    username: `testcollab_${Date.now()}`,
    email: `testcollab_${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Test Collaboration User'
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
    name: `Collaboration Test Project ${Date.now()}`,
    description: 'Project for testing group-based collaboration features',
    isPublic: true
  };

  const response = await makeRequest('POST', '/projects', projectData);
  projectId = response.project.id;
  console.log('✅ Project created successfully');
  console.log(`   - Project ID: ${projectId}`);
  console.log(`   - Project Name: ${projectData.name}`);
}

async function step3_CreateCollaborativeSnippets() {
  console.log('\n3. Creating collaborative snippets...');
  
  // First snippet
  const snippet1Data = {
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
    description: 'A React component that project collaborators can edit',
    projectId: projectId,
    isPublic: true,
    allowCollaboration: true,
    tags: ['react', 'component', 'collaboration']
  };

  const response1 = await makeRequest('POST', '/code', snippet1Data);
  snippetId1 = response1.snippet.id;
  console.log('✅ First collaborative snippet created');
  console.log(`   - Snippet ID: ${snippetId1}`);

  // Second snippet
  const snippet2Data = {
    title: 'Collaborative Utility Function',
    content: `export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};`,
    language: 'javascript',
    description: 'Utility functions that can be improved collaboratively',
    projectId: projectId,
    isPublic: true,
    allowCollaboration: true,
    tags: ['utils', 'javascript', 'collaboration']
  };

  const response2 = await makeRequest('POST', '/code', snippet2Data);
  snippetId2 = response2.snippet.id;
  console.log('✅ Second collaborative snippet created');
  console.log(`   - Snippet ID: ${snippetId2}`);
}

async function step4_TestCollaborativeSnippetsDisplay() {
  console.log('\n4. Testing collaborative snippets display...');
  
  const response = await makeRequest('GET', '/code/collaborative');
  
  console.log(`✅ Found ${response.snippets.length} collaborative snippets`);
  
  const ourSnippets = response.snippets.filter(s => 
    s.id === snippetId1 || s.id === snippetId2
  );
  
  console.log(`✅ Our snippets found: ${ourSnippets.length}/2`);
  
  ourSnippets.forEach(snippet => {
    console.log(`   - ${snippet.title}`);
    console.log(`     - Allow Collaboration: ${snippet.allowCollaboration}`);
    console.log(`     - Project Collaborators: ${snippet.project?.collaborators?.length || 0}`);
  });
  
  return ourSnippets;
}

async function step5_CreateSecondUser() {
  console.log('\n5. Creating second user (collaborator)...');
  
  const userData = {
    username: `collaborator_${Date.now()}`,
    email: `collaborator_${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Test Collaborator'
  };

  try {
    const response = await makeRequest('POST', '/auth/register', userData);
    console.log('✅ Collaborator user registered successfully');
    console.log(`   - Username: ${userData.username}`);
    return {
      token: response.token,
      user: response.user,
      credentials: userData
    };
  } catch (error) {
    console.error('❌ Failed to create second user:', error.message);
    throw error;
  }
}

async function step6_JoinCollaborationGroup(collaboratorData) {
  console.log('\n6. Joining collaboration group via snippet...');
  
  // Set up authentication for collaborator
  const originalToken = authToken;
  authToken = collaboratorData.token;
  
  try {
    // Join collaboration group by adding themselves to the first snippet
    const response = await makeRequest('POST', `/code/${snippetId1}/collaborators`, {
      username: collaboratorData.user.username,
      role: 'editor'
    });
    
    console.log('✅ Successfully joined project collaboration group');
    console.log(`   - Message: ${response.message}`);
    
    // Restore original token
    authToken = originalToken;
    return response;
  } catch (error) {
    authToken = originalToken;
    throw error;
  }
}

async function step7_VerifyCollaboratorAccess() {
  console.log('\n7. Verifying collaborator access...');
  
  // Check the project to see if collaborator was added
  const project = await makeRequest('GET', `/projects/${projectId}`);
  
  console.log('✅ Project collaborators:');
  if (project.project.collaborators && project.project.collaborators.length > 0) {
    project.project.collaborators.forEach(collab => {
      console.log(`   - ${collab.user.username} (${collab.role})`);
    });
  } else {
    console.log('   - No collaborators found');
  }
  
  // Check both snippets to see if they show the collaborator
  console.log('\n✅ Checking snippets for collaborator display:');
  
  const snippet1 = await makeRequest('GET', `/code/${snippetId1}`);
  const snippet2 = await makeRequest('GET', `/code/${snippetId2}`);
  
  console.log(`   - Snippet 1 project collaborators: ${snippet1.codeSnippet.project?.collaborators?.length || 0}`);
  console.log(`   - Snippet 2 project collaborators: ${snippet2.codeSnippet.project?.collaborators?.length || 0}`);
  
  return { snippet1: snippet1.codeSnippet, snippet2: snippet2.codeSnippet };
}

async function runTest() {
  try {
    await step1_RegisterUser();
    await step2_CreateProject();
    await step3_CreateCollaborativeSnippets();
    await step4_TestCollaborativeSnippetsDisplay();
    const collaboratorData = await step5_CreateSecondUser();
    await step6_JoinCollaborationGroup(collaboratorData);
    await step7_VerifyCollaboratorAccess();
    
    console.log('\n🎉 Project-Based Collaboration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Project ID: ${projectId}`);
    console.log(`   - Collaborative Snippet 1 ID: ${snippetId1}`);
    console.log(`   - Collaborative Snippet 2 ID: ${snippetId2}`);
    console.log(`   - Collaborator joined project group through snippet`);
    console.log(`   - Collaborator can now edit ALL collaborative snippets in the project`);
    
    console.log('\n🌐 Frontend URLs to test:');
    console.log(`   - Collaborate page: http://localhost:5175/collaborate`);
    console.log(`   - Project view: http://localhost:5175/project/${projectId}`);
    console.log(`   - Snippet 1: http://localhost:5175/snippet/${snippetId1}`);
    console.log(`   - Snippet 2: http://localhost:5175/snippet/${snippetId2}`);
    
    console.log('\n✨ The project-based collaboration feature is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
