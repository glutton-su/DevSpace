const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  username: 'uploadtest',
  email: 'uploadtest@example.com',
  password: 'TestPass123!'
};

const testProject = {
  title: 'Test Project',
  description: 'Test project for upload functionality',
  isPublic: true,
  isCollaborative: false
};

const testSnippet = {
  title: 'Test Snippet',
  content: 'console.log("Hello, World!");',
  language: 'javascript',
  filePath: 'test.js'
};

async function testUploadFunctionality() {
  try {
    console.log('🧪 Testing Upload Functionality...\n');

    // 1. Register a new test user
    console.log('1. Registering new test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully');
    console.log('Response:', registerResponse.data);
    const token = registerResponse.data.token || registerResponse.data.accessToken;

    // 2. Create a test project
    console.log('\n2. Creating test project...');
    const projectResponse = await axios.post(`${API_BASE_URL}/projects`, testProject, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Project created successfully');
    const projectId = projectResponse.data.project.id;

    // 3. Create a test snippet
    console.log('\n3. Creating test snippet...');
    const snippetData = {
      ...testSnippet,
      projectId: projectId
    };
    const snippetResponse = await axios.post(`${API_BASE_URL}/code`, snippetData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Snippet created successfully');
    const snippetId = snippetResponse.data.codeSnippet.id;

    // 4. Verify snippet was created
    console.log('\n4. Verifying snippet...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/code/${snippetId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Snippet verified successfully');
    console.log('   Title:', verifyResponse.data.codeSnippet.title);
    console.log('   Language:', verifyResponse.data.codeSnippet.language);
    console.log('   Content length:', verifyResponse.data.codeSnippet.content.length);

    // 5. Test file upload simulation
    console.log('\n5. Testing file upload simulation...');
    const fileSnippetData = {
      projectId: projectId,
      title: 'Uploaded File Test',
      content: 'function test() {\n  return "File upload works!";\n}',
      language: 'javascript',
      filePath: 'uploaded-test.js'
    };
    const fileResponse = await axios.post(`${API_BASE_URL}/code`, fileSnippetData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ File upload simulation successful');

    console.log('\n🎉 All upload tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('   - User registration: ✅');
    console.log('   - Project creation: ✅');
    console.log('   - Snippet creation: ✅');
    console.log('   - Snippet verification: ✅');
    console.log('   - File upload simulation: ✅');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the test
testUploadFunctionality(); 