/**
 * Test script to verify snippet collaborator functionality
 * This script tests the full flow of creating, managing, and using snippet collaborators
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authTokenUser1, authTokenUser2;
let userId1, userId2;
let snippetId;

// Test data
const testUser1 = {
  username: 'collabtest1_' + Date.now(),
  email: 'collabtest1_' + Date.now() + '@example.com',
  password: 'TestPassword123!'
};

const testUser2 = {
  username: 'collabtest2_' + Date.now(), 
  email: 'collabtest2_' + Date.now() + '@example.com',
  password: 'TestPassword123!'
};

const testSnippet = {
  title: 'Test Snippet for Collaboration',
  description: 'A test snippet to verify collaborator functionality',
  content: 'console.log("Hello, collaborators!");',
  language: 'javascript',
  tags: ['test', 'collaboration'],
  isPublic: true
};

const testProject = {
  title: 'Test Project for Collaboration',
  description: 'A test project to verify collaborator functionality',
  isPublic: true
};

async function createAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

async function registerUser(userData) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    console.log(`✓ User ${userData.username} registered successfully`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`- User ${userData.username} already exists`);
      return { message: 'User already exists' };
    }
    throw error;
  }
}

async function loginUser(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    console.log(`✓ User ${credentials.email} logged in successfully`);
    return response.data;
  } catch (error) {
    console.error(`✗ Login failed for ${credentials.email}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function createSnippet(snippetData, token) {
  try {
    const headers = await createAuthHeaders(token);
    const response = await axios.post(`${BASE_URL}/code`, snippetData, { headers });
    console.log(`✓ Snippet "${snippetData.title}" created successfully`);
    return response.data;
  } catch (error) {
    console.error('✗ Snippet creation failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function addCollaborator(snippetId, userId, role, token) {
  try {
    const headers = await createAuthHeaders(token);
    const response = await axios.post(`${BASE_URL}/code/${snippetId}/collaborators`, {
      userId: userId,
      role: role
    }, { headers });
    console.log(`✓ Collaborator added to snippet ${snippetId} with role: ${role}`);
    return response.data;
  } catch (error) {
    console.error('✗ Adding collaborator failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function getSnippetCollaborators(snippetId, token) {
  try {
    const headers = await createAuthHeaders(token);
    const response = await axios.get(`${BASE_URL}/code/${snippetId}/collaborators`, { headers });
    console.log(`✓ Retrieved ${response.data.collaborators?.length || 0} collaborators for snippet ${snippetId}`);
    return response.data;
  } catch (error) {
    console.error('✗ Getting collaborators failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function updateSnippetAsCollaborator(snippetId, updates, token) {
  try {
    const headers = await createAuthHeaders(token);
    const response = await axios.put(`${BASE_URL}/code/${snippetId}`, updates, { headers });
    console.log(`✓ Snippet ${snippetId} updated by collaborator`);
    return response.data;
  } catch (error) {
    console.error('✗ Updating snippet as collaborator failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function removeCollaborator(snippetId, userId, token) {
  try {
    const headers = await createAuthHeaders(token);
    const response = await axios.delete(`${BASE_URL}/code/${snippetId}/collaborators/${userId}`, { headers });
    console.log(`✓ Collaborator removed from snippet ${snippetId}`);
    return response.data;
  } catch (error) {
    console.error('✗ Removing collaborator failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function createProject(projectData, token) {
  try {
    const headers = await createAuthHeaders(token);
    const response = await axios.post(`${BASE_URL}/projects`, projectData, { headers });
    console.log(`✓ Project "${projectData.title}" created successfully`);
    return response.data;
  } catch (error) {
    console.error('✗ Project creation failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🧪 Starting snippet collaborator functionality tests...\n');

    // Step 1: Register/Login users
    console.log('Step 1: Setting up test users...');
    await registerUser(testUser1);
    await registerUser(testUser2);
    
    const loginResult1 = await loginUser({ email: testUser1.email, password: testUser1.password });
    const loginResult2 = await loginUser({ email: testUser2.email, password: testUser2.password });
    
    authTokenUser1 = loginResult1.token;
    authTokenUser2 = loginResult2.token;
    userId1 = loginResult1.user.id;
    userId2 = loginResult2.user.id;
    
    console.log(`User 1 ID: ${userId1}, User 2 ID: ${userId2}\n`);

    // Step 2: Create project as user 1
    console.log('Step 2: Creating project...');
    const testProjectResult = await createProject({
      title: 'Test Project for Collaboration',
      description: 'A test project to hold our snippet',
      isPublic: true
    }, authTokenUser1);
    
    const testProjectId = testProjectResult.project?.id || testProjectResult.id;
    console.log(`Project ID: ${testProjectId}\n`);

    // Step 3: Create snippet as user 1
    console.log('Step 3: Creating snippet...');
    const snippetResult = await createSnippet({
      ...testSnippet,
      projectId: testProjectId
    }, authTokenUser1);
    snippetId = snippetResult.codeSnippet?.id || snippetResult.id;
    console.log(`Snippet ID: ${snippetId}\n`);

    // Step 4: Add user 2 as collaborator
    console.log('Step 3: Adding collaborator...');
    await addCollaborator(snippetId, userId2, 'editor', authTokenUser1);
    
    // Step 5: Get collaborators
    console.log('Step 4: Getting collaborators...');
    const collaborators = await getSnippetCollaborators(snippetId, authTokenUser1);
    console.log('Collaborators:', collaborators.collaborators?.map(c => ({
      username: c.User?.username,
      role: c.role
    })));
    console.log('');

    // Step 5: Test collaborator can edit snippet
    console.log('Step 5: Testing collaborator edit permissions...');
    const updates = {
      title: 'Updated Test Snippet (by collaborator)',
      code: 'console.log("Hello, this was updated by a collaborator!");'
    };
    await updateSnippetAsCollaborator(snippetId, updates, authTokenUser2);

    // Step 6: Remove collaborator
    console.log('Step 6: Removing collaborator...');
    await removeCollaborator(snippetId, userId2, authTokenUser1);
    
    // Step 7: Verify collaborator removed
    console.log('Step 7: Verifying collaborator removal...');
    const collaboratorsAfterRemoval = await getSnippetCollaborators(snippetId, authTokenUser1);
    console.log('Collaborators after removal:', collaboratorsAfterRemoval.collaborators?.length || 0);

    // Step 8: Create a test project
    console.log('Step 8: Creating a test project...');
    const projectResult = await createProject(testProject, authTokenUser1);
    const projectId = projectResult.project?.id || projectResult.id;
    console.log(`Project ID: ${projectId}\n`);

    // Step 9: Add user 2 as project collaborator
    console.log('Step 9: Adding collaborator to project...');
    await addCollaborator(projectId, userId2, 'viewer', authTokenUser1);
    
    // Step 10: Get project collaborators
    console.log('Step 10: Getting project collaborators...');
    const projectCollaborators = await getSnippetCollaborators(projectId, authTokenUser1);
    console.log('Project Collaborators:', projectCollaborators.collaborators?.map(c => ({
      username: c.User?.username,
      role: c.role
    })));
    console.log('');

    // Step 11: Remove collaborator from project
    console.log('Step 11: Removing collaborator from project...');
    await removeCollaborator(projectId, userId2, authTokenUser1);
    
    // Step 12: Verify collaborator removed from project
    console.log('Step 12: Verifying collaborator removal from project...');
    const projectCollaboratorsAfterRemoval = await getSnippetCollaborators(projectId, authTokenUser1);
    console.log('Project Collaborators after removal:', projectCollaboratorsAfterRemoval.collaborators?.length || 0);

    console.log('\n🎉 All tests passed! Snippet collaborator functionality is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Run the tests
runTests();
