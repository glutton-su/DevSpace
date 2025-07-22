const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testPublicSnippetsOnly() {
  console.log('🔍 Testing Public Snippets API\n');
  
  try {
    // Step 1: Get all public snippets and analyze the structure
    console.log('1. Getting all public snippets...');
    const publicSnippetsResponse = await axios.get(`${baseURL}/code`);
    const publicSnippets = publicSnippetsResponse.data.snippets || publicSnippetsResponse.data.data || publicSnippetsResponse.data;
    
    console.log(`✅ Found ${publicSnippets.length} public snippets:`);
    
    publicSnippets.forEach((snippet, index) => {
      console.log(`\n   Snippet ${index + 1}:`);
      console.log(`   - ID: ${snippet.id}`);
      console.log(`   - Title: "${snippet.title}"`);
      console.log(`   - Language: ${snippet.language}`);
      console.log(`   - isPublic: ${snippet.isPublic}`);
      console.log(`   - Author: ${snippet.author?.username || 'Unknown'} (ID: ${snippet.author?.id || 'N/A'})`);
      console.log(`   - CreatedAt: ${snippet.createdAt}`);
    });

    // Step 2: Test if we can get a specific snippet that we know exists
    if (publicSnippets.length > 0) {
      const firstSnippetId = publicSnippets[0].id;
      console.log(`\n2. Testing individual snippet access (ID: ${firstSnippetId})...`);
      
      try {
        const individualSnippetResponse = await axios.get(`${baseURL}/code/${firstSnippetId}`);
        const individualSnippet = individualSnippetResponse.data.codeSnippet || individualSnippetResponse.data.data || individualSnippetResponse.data;
        
        console.log('✅ Individual snippet accessible');
        console.log('   - Structure keys:', Object.keys(individualSnippet));
        console.log('   - Has project info:', !!individualSnippet.project);
        console.log('   - isPublic:', individualSnippet.isPublic);
        
      } catch (error) {
        console.log('❌ Could not access individual snippet:', error.response?.status);
      }
    }

    // Step 3: Check the database directly by creating a minimal snippet
    console.log('\n3. Testing fresh snippet creation...');
    
    // Login first
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'debuguser@devspace.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.token;
    
    // Create project
    const projectData = {
      title: 'Test Public Project',
      description: 'Testing public visibility',
      isPublic: true,
      isCollaborative: false
    };

    const createProjectResponse = await axios.post(`${baseURL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const projectId = createProjectResponse.data.project.id;
    console.log('✅ Created public project, ID:', projectId);

    // Create snippet
    const snippetData = {
      projectId: projectId,
      title: 'Fresh Test Snippet',
      content: 'console.log("This should be public!");',
      language: 'javascript',
      filePath: 'test.js'
    };

    const createSnippetResponse = await axios.post(`${baseURL}/code`, snippetData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const newSnippet = createSnippetResponse.data.codeSnippet;
    console.log('✅ Created snippet, ID:', newSnippet.id, 'isPublic:', newSnippet.isPublic);

    // Step 4: Wait a moment and check if it appears
    console.log('\n4. Checking if new snippet appears immediately...');
    const updatedPublicSnippetsResponse = await axios.get(`${baseURL}/code`);
    const updatedPublicSnippets = updatedPublicSnippetsResponse.data.snippets || updatedPublicSnippetsResponse.data.data || updatedPublicSnippetsResponse.data;
    
    const foundNewSnippet = updatedPublicSnippets.find(s => s.id === newSnippet.id);
    
    if (foundNewSnippet) {
      console.log('✅ NEW SNIPPET FOUND in public listings!');
      console.log('   - Title:', foundNewSnippet.title);
      console.log('   - Author:', foundNewSnippet.author?.username);
    } else {
      console.log('❌ New snippet NOT found in public listings');
      console.log('Total snippets in listing:', updatedPublicSnippets.length);
      console.log('Snippet IDs in listing:', updatedPublicSnippets.map(s => s.id));
      console.log('Looking for snippet ID:', newSnippet.id);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPublicSnippetsOnly();
