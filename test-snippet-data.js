const { default: fetch } = require('node-fetch');

async function testSnippetEndpoints() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Testing snippet endpoints...\n');
    
    // Login to get a token
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'debuguser@devspace.com',
        password: 'TestPass123!'
      }),
    });
    
    if (!loginResponse.ok) {
      const loginError = await loginResponse.text();
      console.log('Login failed with status:', loginResponse.status);
      console.log('Login error:', loginError);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    if (!token) {
      console.error('No token received');
      return;
    }
    
    console.log('Login successful, got token');
    
    // Test getUserOwnedSnippets endpoint
    console.log('\n=== Testing getUserOwnedSnippets ===');
    const ownedResponse = await fetch(`${baseURL}/code/user/owned`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (ownedResponse.ok) {
      const ownedData = await ownedResponse.json();
      console.log('User owned snippets response:');
      console.log(`Total: ${ownedData.total}`);
      console.log(`Snippets count: ${ownedData.snippets?.length || 0}`);
      
      if (ownedData.snippets && ownedData.snippets.length > 0) {
        const snippet = ownedData.snippets[0];
        console.log('\nFirst snippet structure:');
        console.log('- ID:', snippet.id);
        console.log('- Title:', snippet.title);
        console.log('- Content length:', snippet.content?.length || 0);
        console.log('- Language:', snippet.language);
        console.log('- Project ID:', snippet.projectId);
        console.log('- Project owner:', snippet.project?.owner?.username);
        console.log('- Star count:', snippet.starCount);
        console.log('- Is starred:', snippet.isStarred);
        console.log('- Created at:', snippet.createdAt || snippet.created_at);
      }
    } else {
      const errorText = await ownedResponse.text();
      console.error('getUserOwnedSnippets failed:', errorText);
    }
    
    // Test getPublicSnippets endpoint
    console.log('\n=== Testing getPublicSnippets ===');
    const publicResponse = await fetch(`${baseURL}/code/public/all`);
    
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log('Public snippets response:');
      console.log(`Total: ${publicData.total}`);
      console.log(`Snippets count: ${publicData.snippets?.length || 0}`);
      
      if (publicData.snippets && publicData.snippets.length > 0) {
        const snippet = publicData.snippets[0];
        console.log('\nFirst snippet structure:');
        console.log('- ID:', snippet.id);
        console.log('- Title:', snippet.title);
        console.log('- Content length:', snippet.content?.length || 0);
        console.log('- Language:', snippet.language);
        console.log('- Project ID:', snippet.projectId);
        console.log('- Project owner:', snippet.project?.owner?.username);
        console.log('- Star count:', snippet.starCount);
        console.log('- Is starred:', snippet.isStarred);
        console.log('- Created at:', snippet.createdAt || snippet.created_at);
      }
    } else {
      const errorText = await publicResponse.text();
      console.error('getPublicSnippets failed:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSnippetEndpoints();
