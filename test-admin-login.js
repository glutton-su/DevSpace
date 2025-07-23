const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Login with admin user
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'suwalsubeg@gmail.com',
        password: 'Suwal1234'
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('Login failed:', loginResponse.status, errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful!');
    console.log('User role:', loginData.user?.role);
    console.log('Token:', loginData.token);
    
    // Test moderation endpoint
    console.log('\nTesting moderation endpoint...');
    const moderationResponse = await fetch('http://localhost:5000/api/moderation/users?page=1&limit=20', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    console.log('Moderation response status:', moderationResponse.status);
    const responseText = await moderationResponse.text();
    console.log('Raw response:', responseText);
    
    if (moderationResponse.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed data:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.error('Failed to parse JSON:', e.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminLogin();
