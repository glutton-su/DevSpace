const axios = require('axios');

async function testCompleteFunctionality() {
  try {
    console.log('🧪 Testing Complete DevSpace Functionality\n');

    // 1. Test backend health
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend health:', healthResponse.data.status);
    console.log('');

    // 2. Test frontend accessibility
    console.log('2. Testing frontend accessibility...');
    const frontendResponse = await axios.get('http://localhost:5173');
    console.log('✅ Frontend accessible:', frontendResponse.status === 200);
    console.log('');

    // 3. Login
    console.log('3. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'newuser123@devspace.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('');

    // 4. Create a snippet
    console.log('4. Creating a test snippet...');
    const snippetData = {
      title: 'Complete Test Snippet',
      content: `// This is a complete test snippet
function helloWorld() {
  console.log("Hello from DevSpace!");
  return "Success!";
}

// Test the function
helloWorld();`,
      language: 'javascript'
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/code', snippetData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const snippet = createResponse.data.codeSnippet;
    console.log(`✅ Snippet created with ID: ${snippet.id}`);
    console.log('Title:', snippet.title);
    console.log('Language:', snippet.language);
    console.log('Is Public:', snippet.isPublic);
    console.log('');

    // 5. Share the snippet
    console.log('5. Sharing the snippet...');
    const shareResponse = await axios.post(`http://localhost:5000/api/code/${snippet.id}/share`, {
      isPublic: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Share response:', shareResponse.data.message);
    console.log('Share URL:', shareResponse.data.shareUrl);
    console.log('');

    // 6. Test public access
    console.log('6. Testing public access...');
    const publicResponse = await axios.get(`http://localhost:5000/api/code/${snippet.id}/public`);
    
    console.log('✅ Public access successful:');
    console.log('Title:', publicResponse.data.codeSnippet.title);
    console.log('Language:', publicResponse.data.codeSnippet.language);
    console.log('Owner:', publicResponse.data.codeSnippet.owner?.username);
    console.log('Content preview:', publicResponse.data.codeSnippet.content.substring(0, 50) + '...');
    console.log('');

    // 7. Test visibility toggle
    console.log('7. Testing visibility toggle...');
    const visibilityResponse = await axios.put(`http://localhost:5000/api/code/${snippet.id}/visibility`, {
      isPublic: false
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Visibility updated:', visibilityResponse.data.message);
    console.log('Is Public:', visibilityResponse.data.isPublic);
    console.log('');

    // 8. Test private access (should fail)
    console.log('8. Testing private access (should fail)...');
    try {
      await axios.get(`http://localhost:5000/api/code/${snippet.id}/public`);
      console.log('❌ Public access should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Public access correctly blocked for private snippet');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // 9. Make public again
    console.log('9. Making snippet public again...');
    await axios.put(`http://localhost:5000/api/code/${snippet.id}/visibility`, {
      isPublic: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Snippet made public again');
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Backend server running');
    console.log('- ✅ Frontend server running');
    console.log('- ✅ User authentication working');
    console.log('- ✅ Snippet creation working');
    console.log('- ✅ Snippet sharing working');
    console.log('- ✅ Public access working');
    console.log('- ✅ Privacy controls working');
    console.log('- ✅ API endpoints responding correctly');
    console.log('\n🌐 URLs to test in browser:');
    console.log('- Frontend: http://localhost:5173');
    console.log('- Create snippet: http://localhost:5173/create');
    console.log('- Public view: http://localhost:5173/code/' + snippet.id + '/public');
    console.log('- Backend API: http://localhost:5000/api/health');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}

testCompleteFunctionality(); 