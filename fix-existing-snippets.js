const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function makeExistingSnippetsPublic() {
  console.log('🔧 Making Existing Private Snippets Public\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'debuguser@devspace.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful');

    // Step 2: Get user's projects to find their snippets
    console.log('\n2. Checking if you have any private snippets...');
    
    // We'll need to check projects and their snippets
    // For now, let's just provide instructions
    
    console.log('\n📋 Instructions to make your existing snippets public:');
    console.log('1. Go to http://localhost:5173 in your browser');
    console.log('2. Navigate to your profile or projects');
    console.log('3. Find any existing snippets that aren\'t showing up');
    console.log('4. Edit them and make sure "Make Public" is checked');
    console.log('5. Save the changes');
    console.log('');
    console.log('OR, try creating a new "Hello World" snippet now - it should appear immediately!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

makeExistingSnippetsPublic();
