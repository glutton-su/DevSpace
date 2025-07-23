const axios = require('axios');

async function testCollaborationFlow() {
  try {
    const baseURL = 'http://localhost:5000/api';
    
    console.log('🧪 Testing Complete Collaboration Flow\n');
    
    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const testUser = {
      username: 'collabtest_' + Date.now(),
      email: 'collabtest_' + Date.now() + '@example.com',
      password: 'TestPassword123',
      fullName: 'Collaboration Tester'
    };
    
    const registerRes = await axios.post(`${baseURL}/auth/register`, testUser);
    const token = registerRes.data.accessToken;
    console.log('✅ User registered successfully');
    
    // Step 2: Create a project
    console.log('\n2. Creating test project...');
    const projectData = {
      title: 'Collaboration Test Project',
      description: 'A project for testing collaboration features',
      isPublic: true,
      isCollaborative: false
    };
    
    const projectRes = await axios.post(`${baseURL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projectId = projectRes.data.project.id;
    console.log(`✅ Project created with ID: ${projectId}`);
    
    // Step 3: Create a snippet WITHOUT collaboration
    console.log('\n3. Creating snippet without collaboration...');
    const snippetData1 = {
      projectId: projectId,
      title: 'Regular Snippet',
      content: 'console.log("This is a regular snippet");',
      language: 'javascript',
      tags: ['test', 'regular'],
      allowCollaboration: false,
      isPublic: true
    };
    
    const snippetRes1 = await axios.post(`${baseURL}/code`, snippetData1, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Regular snippet created');
    
    // Step 4: Create a snippet WITH collaboration
    console.log('\n4. Creating snippet with collaboration enabled...');
    const snippetData2 = {
      projectId: projectId,
      title: 'Collaborative Snippet',
      content: 'console.log("This snippet allows collaboration!");',
      language: 'javascript',
      tags: ['test', 'collaboration'],
      allowCollaboration: true,
      isPublic: true
    };
    
    const snippetRes2 = await axios.post(`${baseURL}/code`, snippetData2, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Collaborative snippet created');
    
    // Step 5: Test collaborative snippets endpoint
    console.log('\n5. Testing collaborative snippets endpoint...');
    const collabRes = await axios.get(`${baseURL}/code/collaborative`);
    console.log(`✅ Found ${collabRes.data.snippets.length} collaborative snippets`);
    
    if (collabRes.data.snippets.length > 0) {
      const collabSnippet = collabRes.data.snippets.find(s => s.title === 'Collaborative Snippet');
      if (collabSnippet) {
        console.log('✅ Our collaborative snippet appears in the endpoint');
        console.log(`   - Title: ${collabSnippet.title}`);
        console.log(`   - Allow Collaboration: ${collabSnippet.allowCollaboration}`);
        console.log(`   - Tags: ${collabSnippet.tags?.join(', ') || 'none'}`);
      } else {
        console.log('❌ Our collaborative snippet does not appear in the endpoint');
      }
    }
    
    // Step 6: Test public snippets endpoint (should show both)
    console.log('\n6. Testing public snippets endpoint...');
    const publicRes = await axios.get(`${baseURL}/code/public/all`);
    console.log(`✅ Found ${publicRes.data.snippets.length} public snippets total`);
    
    const regularSnippet = publicRes.data.snippets.find(s => s.title === 'Regular Snippet');
    const collaborativeSnippet = publicRes.data.snippets.find(s => s.title === 'Collaborative Snippet');
    
    console.log(`   - Regular snippet found: ${!!regularSnippet}`);
    console.log(`   - Collaborative snippet found: ${!!collaborativeSnippet}`);
    
    if (collaborativeSnippet) {
      console.log(`   - Collaborative snippet allowCollaboration: ${collaborativeSnippet.allowCollaboration}`);
    }
    
    console.log('\n🎉 Collaboration flow test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to http://localhost:5175/collaborate to see collaborative snippets');
    console.log('   2. Go to http://localhost:5175/create to create snippets with collaboration toggle');
    console.log('   3. The collaboration toggle should appear in the Privacy & Sharing section');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCollaborationFlow();
