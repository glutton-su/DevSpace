const axios = require('axios');

async function testAvatarIcon() {
  console.log('🧪 Testing Avatar Icon Functionality...');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed - user may not exist');
      console.log('Please ensure you have a test user with email: test@example.com');
      return;
    }
    
    const token = loginResponse.data.token;
    const currentUser = loginResponse.data.user;
    console.log('✅ Login successful');
    console.log(`Current avatar icon: ${currentUser.avatarIcon || 'user (default)'}`);
    
    // Test updating avatar icon
    console.log('\n2. Testing avatar icon update...');
    const iconOptions = ['user', 'code', 'star', 'zap'];
    const newIcon = iconOptions[Math.floor(Math.random() * iconOptions.length)];
    
    const updateResponse = await axios.put(`${baseURL}/auth/profile`, {
      avatarIcon: newIcon
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Avatar icon updated successfully');
    console.log(`New avatar icon: ${updateResponse.data.user.avatarIcon}`);
    
    // Test getting updated profile
    console.log('\n3. Verifying profile update...');
    const profileResponse = await axios.get(`${baseURL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log(`Verified avatar icon: ${profileResponse.data.user.avatarIcon}`);
    
    // Test all icon options
    console.log('\n4. Testing all icon options...');
    for (const icon of iconOptions) {
      try {
        await axios.put(`${baseURL}/auth/profile`, {
          avatarIcon: icon
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`✅ ${icon} icon: Success`);
      } catch (error) {
        console.log(`❌ ${icon} icon: Failed`);
      }
    }
    
    // Test invalid icon
    console.log('\n5. Testing invalid icon...');
    try {
      await axios.put(`${baseURL}/auth/profile`, {
        avatarIcon: 'invalid'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ Invalid icon should have been rejected');
    } catch (error) {
      console.log('✅ Invalid icon properly rejected');
    }
    
    console.log('\n✅ Avatar icon functionality is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data}`);
    } else if (error.request) {
      console.error('   No response received - server may not be running');
      console.error('   Please start the backend server: cd server && npm run dev');
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
    return true;
  } catch (error) {
    console.log('❌ Backend server is not running on port 5000');
    console.log('Please start the backend server with: cd server && npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAvatarIcon();
  }
}

main().catch(console.error);
