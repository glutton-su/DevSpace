const fetch = require('node-fetch');

async function testForkCounts() {
  try {
    console.log('Testing fork counts...');
    
    // Get all public snippets to see fork counts
    const response = await fetch('http://localhost:5000/api/code/public?limit=10');
    
    if (!response.ok) {
      console.error('Failed to fetch snippets:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log(`Found ${data.snippets.length} snippets`);
    
    data.snippets.forEach(snippet => {
      console.log(`\nSnippet: "${snippet.title}"`);
      console.log(`  ID: ${snippet.id}`);
      console.log(`  Star Count: ${snippet.starCount || 0}`);
      console.log(`  Fork Count: ${snippet.forkCount || 0}`);
      console.log(`  Forked From: ${snippet.forkedFromSnippet || 'Original'}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testForkCounts();
