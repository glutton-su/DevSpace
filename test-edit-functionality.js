#!/usr/bin/env node
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testEditFunctionality() {
  try {
    console.log('🚀 Testing Edit Functionality...\n');

    // Login to get authentication token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const authHeaders = {
      headers: { Authorization: `Bearer ${token}` }
    };

    console.log('✅ Login successful\n');

    // Get user's snippets
    console.log('2. Fetching user\'s snippets...');
    const snippetsResponse = await axios.get(`${API_BASE_URL}/code/user/owned`, authHeaders);
    
    if (snippetsResponse.data.data.length === 0) {
      console.log('❌ No snippets found. Please create a snippet first.');
      return;
    }

    const snippet = snippetsResponse.data.data[0];
    console.log(`✅ Found snippet: "${snippet.title}" (ID: ${snippet.id})\n`);

    // Get snippet details
    console.log('3. Fetching snippet details...');
    const detailResponse = await axios.get(`${API_BASE_URL}/code/${snippet.id}`, authHeaders);
    const snippetData = detailResponse.data.codeSnippet;
    
    console.log('Original snippet data:');
    console.log(`- Title: ${snippetData.title}`);
    console.log(`- Language: ${snippetData.language}`);
    console.log(`- Tags: ${snippetData.tags ? snippetData.tags.map(t => t.name || t).join(', ') : 'None'}`);
    console.log(`- Collaboration: ${snippetData.allowCollaboration}`);
    console.log(`- Public: ${snippetData.isPublic}\n`);

    // Update the snippet
    console.log('4. Updating snippet...');
    const updateData = {
      title: `${snippetData.title} (Updated)`,
      content: `${snippetData.content}\n\n// This snippet was updated via API test`,
      language: snippetData.language,
      tags: ['updated', 'test', 'api'],
      allowCollaboration: !snippetData.allowCollaboration,
      isPublic: !snippetData.isPublic
    };

    const updateResponse = await axios.put(`${API_BASE_URL}/code/${snippet.id}`, updateData, authHeaders);
    console.log('✅ Snippet updated successfully\n');

    // Verify the update
    console.log('5. Verifying update...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/code/${snippet.id}`, authHeaders);
    const updatedSnippet = verifyResponse.data.codeSnippet;

    console.log('Updated snippet data:');
    console.log(`- Title: ${updatedSnippet.title}`);
    console.log(`- Language: ${updatedSnippet.language}`);
    console.log(`- Tags: ${updatedSnippet.tags ? updatedSnippet.tags.map(t => t.name || t).join(', ') : 'None'}`);
    console.log(`- Collaboration: ${updatedSnippet.allowCollaboration}`);
    console.log(`- Public: ${updatedSnippet.isPublic}\n`);

    // Restore original values (optional cleanup)
    console.log('6. Restoring original values...');
    const restoreData = {
      title: snippetData.title,
      content: snippetData.content,
      language: snippetData.language,
      tags: snippetData.tags ? snippetData.tags.map(t => t.name || t) : [],
      allowCollaboration: snippetData.allowCollaboration,
      isPublic: snippetData.isPublic
    };

    await axios.put(`${API_BASE_URL}/code/${snippet.id}`, restoreData, authHeaders);
    console.log('✅ Original values restored\n');

    console.log('🎉 Edit functionality test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have the correct login credentials.');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Tip: Make sure you own the snippet you\'re trying to edit.');
    }
  }
}

// Run the test
testEditFunctionality();
