const axios = require('axios');

const baseURL = 'http://localhost:5000/api';
const frontendURL = 'http://localhost:5173';

async function testSimpleNavigation() {
  console.log('🔍 Testing Simple Navigation Flow\n');
  
  try {
    // Step 1: Test that the frontend is running and we can access it
    console.log('1. Testing frontend access...');
    try {
      const frontendResponse = await axios.get(frontendURL, { timeout: 5000 });
      console.log('✅ Frontend is accessible at', frontendURL);
    } catch (error) {
      console.log('⚠️ Frontend might be on different port or not running');
      console.log('Please make sure the frontend is running with: npm run dev (in client folder)');
      return;
    }

    // Step 2: Test backend snippet endpoint
    console.log('\n2. Testing backend snippet endpoints...');
    try {
      const publicSnippetsResponse = await axios.get(`${baseURL}/code`);
      console.log('✅ Backend /code endpoint accessible');
      
      const snippets = publicSnippetsResponse.data.snippets || publicSnippetsResponse.data.data || publicSnippetsResponse.data;
      
      if (Array.isArray(snippets) && snippets.length > 0) {
        const firstSnippet = snippets[0];
        console.log('✅ Found snippets in backend:', snippets.length, 'snippets');
        console.log('   - First snippet ID:', firstSnippet.id);
        console.log('   - Title:', firstSnippet.title);
        console.log('   - Expected frontend URL: http://localhost:5173/snippet/' + firstSnippet.id);
        
        // Test if individual snippet can be accessed
        const snippetDetailResponse = await axios.get(`${baseURL}/code/${firstSnippet.id}`);
        console.log('✅ Individual snippet accessible via backend');
      } else {
        console.log('⚠️ No snippets found in backend. You may need to create some snippets first.');
      }
    } catch (error) {
      console.log('❌ Backend snippet endpoint error:', error.response?.status, error.response?.statusText);
    }

    console.log('\n📋 Navigation Check Summary:');
    console.log('   1. Frontend should be running at: http://localhost:5173');
    console.log('   2. When you click a snippet card, it should navigate to: /snippet/{id}');
    console.log('   3. The URL in the browser should show: http://localhost:5173/snippet/{id}');
    console.log('   4. NOT: http://localhost:5173/project/{id}');
    console.log('');
    console.log('🔧 If you\'re seeing /project/{id} URLs:');
    console.log('   - Check if there are any old cached components');
    console.log('   - Refresh the browser hard (Ctrl+F5 or Cmd+Shift+R)');
    console.log('   - Check the browser console for any JavaScript errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleNavigation();
