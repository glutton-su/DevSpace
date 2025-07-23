const { default: fetch } = require('node-fetch');

async function testForkAndAccess() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Testing fork and access functionality...\n');
    
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
    
    // Get a public snippet to fork
    console.log('=== Getting public snippets ===');
    const publicResponse = await fetch(`${baseURL}/code/public/all`);
    
    if (!publicResponse.ok) {
      console.log('Failed to get public snippets');
      return;
    }
    
    const publicData = await publicResponse.json();
    
    if (!publicData.snippets || publicData.snippets.length === 0) {
      console.log('No public snippets available to fork');
      return;
    }
    
    const snippetToFork = publicData.snippets[0];
    console.log(`Found snippet to fork: ID ${snippetToFork.id}, Title: "${snippetToFork.title}"`);
    
    // Fork the snippet
    console.log('\n=== Forking snippet ===');
    const forkResponse = await fetch(`${baseURL}/code/${snippetToFork.id}/fork`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!forkResponse.ok) {
      const forkError = await forkResponse.text();
      console.log('Fork failed:', forkError);
      return;
    }
    
    const forkData = await forkResponse.json();
    const forkedSnippetId = forkData.snippet.id;
    console.log(`Snippet forked successfully! New snippet ID: ${forkedSnippetId}`);
    
    // Now try to access the forked snippet
    console.log('\n=== Testing access to forked snippet ===');
    const accessResponse = await fetch(`${baseURL}/code/${forkedSnippetId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Access response status:', accessResponse.status);
    
    if (accessResponse.ok) {
      const accessData = await accessResponse.json();
      console.log('✅ Successfully accessed forked snippet!');
      console.log('- ID:', accessData.codeSnippet.id);
      console.log('- Title:', accessData.codeSnippet.title);
      console.log('- Content length:', accessData.codeSnippet.content?.length || 0);
      console.log('- Project ID:', accessData.codeSnippet.projectId);
      console.log('- Project title:', accessData.codeSnippet.project?.title);
      console.log('- Forked from:', accessData.codeSnippet.forkedFromSnippet);
    } else {
      const accessError = await accessResponse.text();
      console.log('❌ Failed to access forked snippet:', accessError);
    }
    
    // Test access without authentication (should fail for private forked snippet)
    console.log('\n=== Testing access without auth (should fail) ===');
    const noAuthResponse = await fetch(`${baseURL}/code/${forkedSnippetId}`);
    console.log('No auth response status:', noAuthResponse.status);
    
    if (noAuthResponse.ok) {
      console.log('⚠️  Unexpected: Accessed private forked snippet without auth');
    } else {
      console.log('✅ Correctly blocked access without auth');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testForkAndAccess();
