#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testProfileAPI() {
  console.log('Testing Profile API endpoints...\n');

  try {
    // First, let's login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'suwalsubeg@gmail.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✓ Login successful, user:', user.username);

    const authHeaders = {
      Authorization: `Bearer ${token}`
    };

    // Test getting user profile
    console.log('\n2. Testing getUserProfile...');
    try {
      const profileResponse = await axios.get(`${API_BASE}/users/${user.username}`, {
        headers: authHeaders
      });
      console.log('✓ Profile data:', JSON.stringify(profileResponse.data, null, 2));
    } catch (error) {
      console.log('✗ Profile API error:', error.response?.data || error.message);
    }

    // Test getting user owned snippets
    console.log('\n3. Testing getUserOwnedSnippets...');
    try {
      const ownedResponse = await axios.get(`${API_BASE}/code/user/owned`, {
        headers: authHeaders
      });
      console.log('✓ Owned snippets:', ownedResponse.data.snippets?.length || 0, 'snippets found');
      console.log('Sample snippet:', ownedResponse.data.snippets?.[0] ? {
        id: ownedResponse.data.snippets[0].id,
        title: ownedResponse.data.snippets[0].title,
        starCount: ownedResponse.data.snippets[0].starCount,
        isStarred: ownedResponse.data.snippets[0].isStarred
      } : 'None');
    } catch (error) {
      console.log('✗ Owned snippets API error:', error.response?.data || error.message);
    }

    // Test getting user starred snippets
    console.log('\n4. Testing getUserStarredSnippets...');
    try {
      const starredResponse = await axios.get(`${API_BASE}/code/user/starred`, {
        headers: authHeaders
      });
      console.log('✓ Starred snippets:', starredResponse.data.snippets?.length || 0, 'snippets found');
    } catch (error) {
      console.log('✗ Starred snippets API error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testProfileAPI().catch(console.error);
