#!/usr/bin/env node

/**
 * Test Collaboration Feature
 * 
 * This test verifies that the collaboration endpoints work correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Testing Collaboration Feature\n');

let authToken = '';
let userId = '';
let projectId = '';
let collaborativeSnippetId = '';
let secondUserToken = '';
let secondUserId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = authToken) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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

async function step1_CreateUsers() {
  console.log('1. Creating test users...');
  
  // Create first user (snippet owner)
  const userData1 = {
    username: `owner_${Date.now()}`,
    email: `owner_${Date.now()}@example.com`,
    password: 'Password123',
    fullName: 'Snippet Owner'
  };

  const response1 = await makeRequest('POST', '/auth/register', userData1);
  authToken = response1.token;
  userId = response1.user.id;
  console.log('✅ Owner user created');
  
  // Create second user (collaborator)
  const userData2 = {
    username: `collaborator_${Date.now()}`,
    email: `collaborator_${Date.now()}@example.com`,
    password: 'Password123',
    fullName: 'Collaborator User'
  };

  const response2 = await makeRequest('POST', '/auth/register', userData2);
  secondUserToken = response2.token;
  secondUserId = response2.user.id;
  console.log('✅ Collaborator user created');
  console.log(`   - Owner: ${userData1.username}`);
  console.log(`   - Collaborator: ${userData2.username}`);
}

async function step2_CreateProjectAndSnippet() {
  console.log('\n2. Creating project and collaborative snippet...');
  
  const projectData = {
    name: `Collaboration Test Project ${Date.now()}`,
    description: 'Project for testing collaboration features',
    isPublic: true
  };

  const projectResponse = await makeRequest('POST', '/projects', projectData);
  projectId = projectResponse.project.id;
  console.log('✅ Project created');
  
  const snippetData = {
    title: 'Collaborative React Hook',
    content: `import { useState, useEffect } from 'react';

const useCollaboration = (snippetId) => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchCollaborators();
  }, [snippetId]);
  
  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const response = await api.getCollaborators(snippetId);
      setCollaborators(response.data);
    } catch (error) {
      console.error('Failed to fetch collaborators:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { collaborators, loading, refetch: fetchCollaborators };
};

export default useCollaboration;`,
    language: 'javascript',
    description: 'A React hook for managing collaboration on code snippets',
    projectId: projectId,
    isPublic: true,
    allowCollaboration: true,
    tags: ['react', 'hooks', 'collaboration']
  };

  const snippetResponse = await makeRequest('POST', '/code', snippetData);
  collaborativeSnippetId = snippetResponse.snippet.id;
  console.log('✅ Collaborative snippet created');
  console.log(`   - Snippet ID: ${collaborativeSnippetId}`);
}

async function step3_TestCollaboratorOperations() {
  console.log('\n3. Testing collaborator operations...');
  
  // Get initial collaborators (should be empty)
  const initialCollaborators = await makeRequest('GET', `/code/${collaborativeSnippetId}/collaborators`);
  console.log(`✅ Initial collaborators: ${initialCollaborators.collaborators.length}`);
  
  // Add collaborator
  const addResponse = await makeRequest('POST', `/code/${collaborativeSnippetId}/collaborators`, {
    username: `collaborator_${Date.now() - 1000}`, // Use the second user's username
    role: 'viewer'
  });
  console.log('✅ Collaborator added successfully');
  
  // Get collaborators after adding
  const afterAddCollaborators = await makeRequest('GET', `/code/${collaborativeSnippetId}/collaborators`);
  console.log(`✅ Collaborators after adding: ${afterAddCollaborators.collaborators.length}`);
  
  if (afterAddCollaborators.collaborators.length > 0) {
    console.log('   - Collaborator details:');
    afterAddCollaborators.collaborators.forEach(collab => {
      console.log(`     * ${collab.user.fullName} (@${collab.user.username}) - ${collab.role}`);
    });
  }
}

async function step4_TestCollaborativeEndpoint() {
  console.log('\n4. Testing collaborative snippets endpoint...');
  
  const collaborativeSnippets = await makeRequest('GET', '/code/collaborative');
  console.log(`✅ Found ${collaborativeSnippets.snippets.length} collaborative snippets`);
  
  const ourSnippet = collaborativeSnippets.snippets.find(s => s.id === collaborativeSnippetId);
  if (ourSnippet) {
    console.log('✅ Our snippet appears in collaborative endpoint');
    console.log(`   - Title: ${ourSnippet.title}`);
    console.log(`   - Collaboration enabled: ${ourSnippet.allowCollaboration}`);
  } else {
    console.log('❌ Our snippet does not appear in collaborative endpoint');
  }
}

async function runTest() {
  try {
    await step1_CreateUsers();
    await step2_CreateProjectAndSnippet();
    await step3_TestCollaboratorOperations();
    await step4_TestCollaborativeEndpoint();
    
    console.log('\n🎉 Collaboration Feature Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Collaborative Snippet ID: ${collaborativeSnippetId}`);
    console.log(`   - Owner User ID: ${userId}`);
    console.log(`   - Collaborator User ID: ${secondUserId}`);
    
    console.log('\n🌐 Frontend URLs to test:');
    console.log('   - Collaborate page: http://localhost:5175/collaborate');
    console.log(`   - Snippet detail: http://localhost:5175/snippet/${collaborativeSnippetId}`);
    console.log('   - Create page: http://localhost:5175/create');
    
    console.log('\n✨ Test the collaboration buttons and modal in the frontend!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
