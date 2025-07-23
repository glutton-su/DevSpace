// Test the fixed API calls
const testAPIFix = async () => {
  console.log('🧪 Testing API fixes...');
  
  try {
    // Test the collaborative snippets endpoint
    console.log('\n📋 Testing collaborative snippets (should work without auth)...');
    const response = await fetch('http://localhost:5000/api/code/collaborative');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Collaborative snippets API working:', data.snippets?.length || 0, 'snippets');
    } else {
      console.log('❌ Collaborative snippets API failed:', response.status, response.statusText);
    }
    
    // Test public snippets endpoint  
    console.log('\n📋 Testing public snippets (should work without auth)...');
    const publicResponse = await fetch('http://localhost:5000/api/code/public/all');
    
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log('✅ Public snippets API working:', publicData.snippets?.length || 0, 'snippets');
    } else {
      console.log('❌ Public snippets API failed:', publicResponse.status, publicResponse.statusText);
    }
    
    // Test individual snippet endpoint (should work with optionalAuth)
    console.log('\n📄 Testing individual snippet (should work without auth)...');
    const snippetResponse = await fetch('http://localhost:5000/api/code/33');
    
    if (snippetResponse.ok) {
      const snippetData = await snippetResponse.json();
      console.log('✅ Individual snippet API working:', snippetData.codeSnippet?.title);
    } else {
      console.log('❌ Individual snippet API failed:', snippetResponse.status, snippetResponse.statusText);
    }
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAPIFix();
