const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testForkedSnippetsAPI() {
    try {
        console.log('Testing forked snippets API...');
        
        // Login as test user
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password'
        });
        
        console.log('Login successful');
        const token = loginRes.data.token;
        
        // Get forked snippets
        const response = await axios.get(`${API_BASE_URL}/code/user/forked`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n=== FORKED SNIPPETS API RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Data structure:');
        console.log('- snippets array length:', response.data.snippets?.length || 0);
        console.log('- total:', response.data.total);
        
        if (response.data.snippets && response.data.snippets.length > 0) {
            console.log('\n=== FIRST SNIPPET DETAILS ===');
            const snippet = response.data.snippets[0];
            console.log('- id:', snippet.id);
            console.log('- title:', snippet.title);
            console.log('- forkCount:', snippet.forkCount);
            console.log('- starCount:', snippet.starCount);
            console.log('- tags:', snippet.tags);
            console.log('- createdAt:', snippet.createdAt);
            console.log('- author:', snippet.author);
            
            console.log('\n=== ALL SNIPPET FORK COUNTS ===');
            response.data.snippets.forEach((s, i) => {
                console.log(`Snippet ${i + 1}: "${s.title}" - forkCount: ${s.forkCount}`);
            });
        } else {
            console.log('No forked snippets found');
        }
        
    } catch (error) {
        console.error('Error testing forked snippets API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
}

testForkedSnippetsAPI();
