const { default: fetch } = require('node-fetch');

async function createTestUser() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Creating test user...');
    
    // Register the test user
    const registerResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'debuguser',
        email: 'debuguser@devspace.com',
        password: 'TestPass123!'
      }),
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('Test user created successfully:', registerData);
    } else {
      const registerError = await registerResponse.text();
      console.log('Registration failed with status:', registerResponse.status);
      console.log('Registration error:', registerError);
      
      // If user already exists, try to login
      if (registerResponse.status === 400) {
        console.log('\nUser might already exist, trying login...');
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
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log('Login successful:', loginData.success);
        } else {
          const loginError = await loginResponse.text();
          console.log('Login also failed:', loginError);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
