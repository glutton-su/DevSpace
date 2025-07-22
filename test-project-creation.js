const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testProjectCreation() {
  console.log('🔍 Testing Project Creation Flow\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'debuguser@devspace.com',
      password: 'TestPass123!'
    });
    
    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful, user:', user.username);

    // Step 2: Test project creation (what the frontend should do)
    console.log('\n2. Testing project creation...');
    const projectData = {
      title: 'My Snippets',
      description: 'Personal code snippets collection',
      isPublic: true,
      isCollaborative: false
    };

    try {
      const createProjectResponse = await axios.post(`${baseURL}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Project creation successful!');
      console.log('Project response structure:', Object.keys(createProjectResponse.data));
      console.log('Project data:', createProjectResponse.data);

      // Extract project ID for snippet creation
      const project = createProjectResponse.data.project || createProjectResponse.data.data || createProjectResponse.data;
      const projectId = project.id;
      console.log('✅ Project ID:', projectId);

      // Step 3: Test snippet creation with this project ID
      console.log('\n3. Testing snippet creation with project ID...');
      const snippetData = {
        projectId: projectId,
        title: 'Hello World Test',
        content: 'console.log("Hello World!");',
        language: 'javascript',
        filePath: 'hello-world.js'
      };

      const createSnippetResponse = await axios.post(`${baseURL}/code`, snippetData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Snippet creation successful!');
      console.log('Snippet response:', createSnippetResponse.data);

      const createdSnippet = createSnippetResponse.data.data || createSnippetResponse.data.snippet || createSnippetResponse.data;
      console.log('✅ Created snippet ID:', createdSnippet.id);

      // Step 4: Verify the snippet appears in public listings
      console.log('\n4. Checking if snippet appears in public listings...');
      const publicSnippetsResponse = await axios.get(`${baseURL}/code`);
      const publicSnippets = publicSnippetsResponse.data.snippets || publicSnippetsResponse.data.data || publicSnippetsResponse.data;
      
      const ourSnippet = publicSnippets.find(s => s.id === createdSnippet.id);
      if (ourSnippet) {
        console.log('✅ New snippet found in public listings!');
        console.log('   - Title:', ourSnippet.title);
        console.log('   - Author:', ourSnippet.author?.username || 'Unknown');
      } else {
        console.log('❌ New snippet NOT found in public listings');
      }

    } catch (projectError) {
      console.log('❌ Project creation failed:');
      console.log('Status:', projectError.response?.status);
      console.log('Error:', projectError.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testProjectCreation();
