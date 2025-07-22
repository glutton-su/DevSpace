const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testUserData() {
  console.log('🔍 Testing User Data and Projects\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'debuguser@devspace.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Check user's projects
    console.log('\n2. Getting user projects...');
    const userProjectsResponse = await axios.get(`${baseURL}/users/debuguser/projects`);
    console.log('User projects:', userProjectsResponse.data);

    // Step 3: Check if we can create a project first
    console.log('\n3. Attempting to create a project...');
    const projectData = {
      title: 'Test Navigation Project',
      description: 'A project for testing snippet navigation',
      isPublic: true
    };

    const createProjectResponse = await axios.post(`${baseURL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Project creation response:', createProjectResponse.data);

    if (createProjectResponse.data.success) {
      const project = createProjectResponse.data.data;
      console.log('✅ Project created with ID:', project.id);

      // Step 4: Now try to create a snippet with the project ID
      console.log('\n4. Creating snippet with project ID...');
      const snippetData = {
        projectId: project.id,
        title: 'Navigation Test Snippet',
        content: 'console.log("Testing navigation to snippet detail page");',
        language: 'javascript',
        filePath: 'test-navigation.js'
      };

      const createSnippetResponse = await axios.post(`${baseURL}/code`, snippetData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Snippet creation response:', createSnippetResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserData();
