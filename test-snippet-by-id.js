const { default: fetch } = require('node-fetch');

async function testSnippetById() {
  const baseURL = 'http://localhost:5000/api';
  const snippetId = 16;
  
  try {
    console.log(`Testing snippet ID ${snippetId}...`);
    
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
      console.log('Login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken || loginData.token;
    
    // Try to get the specific snippet
    console.log('\n=== Testing getSnippet by ID ===');
    const snippetResponse = await fetch(`${baseURL}/code/${snippetId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Response status:', snippetResponse.status);
    
    if (snippetResponse.ok) {
      const snippetData = await snippetResponse.json();
      console.log('Snippet found:');
      console.log('- ID:', snippetData.snippet?.id || snippetData.id);
      console.log('- Title:', snippetData.snippet?.title || snippetData.title);
      console.log('- Content length:', (snippetData.snippet?.content || snippetData.content)?.length || 0);
      console.log('- Language:', snippetData.snippet?.language || snippetData.language);
    } else {
      const errorText = await snippetResponse.text();
      console.log('Snippet not found:', errorText);
    }
    
    // Let's also check what snippets exist
    console.log('\n=== Checking all public snippets ===');
    const publicResponse = await fetch(`${baseURL}/code/public/all`);
    
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log(`Found ${publicData.total} public snippets:`);
      (publicData.snippets || []).forEach(snippet => {
        console.log(`- ID: ${snippet.id}, Title: ${snippet.title}`);
      });
    }
    
    // Check user's owned snippets
    console.log('\n=== Checking user owned snippets ===');
    const ownedResponse = await fetch(`${baseURL}/code/user/owned`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (ownedResponse.ok) {
      const ownedData = await ownedResponse.json();
      console.log(`Found ${ownedData.total} owned snippets:`);
      (ownedData.snippets || []).forEach(snippet => {
        console.log(`- ID: ${snippet.id}, Title: ${snippet.title}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSnippetById();
