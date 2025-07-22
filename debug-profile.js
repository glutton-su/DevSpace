const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function debugProfileData() {
  console.log('🔍 Debugging Profile Snippet Display\n');
  
  try {
    // Step 1: Login as testuser123 (the user in the screenshot)
    console.log('1. Trying to login as testuser123...');
    
    // First try to find what user is actually logged in
    const users = [
      { email: 'testuser123@devspace.com', username: 'testuser123' },
      { email: 'debuguser@devspace.com', username: 'debuguser' },
      { email: 'navtester@devspace.com', username: 'navtester' }
    ];
    
    let loggedInUser = null;
    let token = null;
    
    for (const userAttempt of users) {
      try {
        console.log(`Trying to login as ${userAttempt.username}...`);
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: userAttempt.email,
          password: 'TestPass123!'
        });
        
        if (loginResponse.data.success) {
          token = loginResponse.data.token;
          loggedInUser = loginResponse.data.user;
          console.log(`✅ Successfully logged in as ${loggedInUser.username} (ID: ${loggedInUser.id})`);
          break;
        }
      } catch (error) {
        console.log(`❌ Failed to login as ${userAttempt.username}`);
      }
    }
    
    if (!loggedInUser) {
      console.log('❌ Could not login as any test user');
      return;
    }

    // Step 2: Get all public snippets and see which ones belong to this user
    console.log('\n2. Checking all public snippets...');
    const publicSnippetsResponse = await axios.get(`${baseURL}/code`);
    const allSnippets = publicSnippetsResponse.data.snippets || publicSnippetsResponse.data.data || publicSnippetsResponse.data;
    
    console.log(`✅ Found ${allSnippets.length} total public snippets:`);
    
    allSnippets.forEach((snippet, index) => {
      const belongsToUser = snippet.author?.id === loggedInUser.id;
      console.log(`   ${index + 1}. ID: ${snippet.id}, Title: "${snippet.title}"`);
      console.log(`      Author: ${snippet.author?.username} (ID: ${snippet.author?.id})`);
      console.log(`      Belongs to ${loggedInUser.username}: ${belongsToUser ? '✅ YES' : '❌ NO'}`);
    });

    // Step 3: Filter snippets that belong to the logged-in user
    const userSnippets = allSnippets.filter(snippet => snippet.author?.id === loggedInUser.id);
    console.log(`\n3. Snippets that belong to ${loggedInUser.username}: ${userSnippets.length}`);
    
    if (userSnippets.length > 0) {
      userSnippets.forEach((snippet, index) => {
        console.log(`   ${index + 1}. "${snippet.title}" (ID: ${snippet.id})`);
      });
    } else {
      console.log('   No snippets found for this user in public listings');
      
      // Check if the user has any projects that might contain snippets
      console.log('\n4. Checking user projects...');
      try {
        const userProjectsResponse = await axios.get(`${baseURL}/users/${loggedInUser.username}/projects`);
        const userProjects = userProjectsResponse.data.projects || userProjectsResponse.data.data || userProjectsResponse.data;
        console.log(`   Found ${userProjects.length} projects for this user`);
        
        userProjects.forEach((project, index) => {
          console.log(`   ${index + 1}. Project: "${project.title}" (ID: ${project.id})`);
        });
      } catch (error) {
        console.log('   ❌ Could not fetch user projects:', error.response?.status);
      }
    }

    // Step 4: Try to create a snippet as this user to test
    console.log(`\n5. Creating a test snippet as ${loggedInUser.username}...`);
    try {
      // Create project first
      const projectData = {
        title: `${loggedInUser.username}'s Test Project`,
        description: 'Testing profile snippet display',
        isPublic: true,
        isCollaborative: false
      };

      const createProjectResponse = await axios.post(`${baseURL}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const projectId = createProjectResponse.data.project.id;
      console.log(`   ✅ Created project ID: ${projectId}`);

      // Create snippet
      const snippetData = {
        projectId: projectId,
        title: 'Profile Test Snippet',
        content: 'console.log("This should show in profile!");',
        language: 'javascript',
        filePath: 'profile-test.js'
      };

      const createSnippetResponse = await axios.post(`${baseURL}/code`, snippetData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newSnippet = createSnippetResponse.data.codeSnippet;
      console.log(`   ✅ Created snippet ID: ${newSnippet.id}`);
      console.log(`   isPublic: ${newSnippet.isPublic}`);

      // Check if it appears in public listings now
      console.log('\n6. Checking if new snippet appears in public listings...');
      const updatedSnippetsResponse = await axios.get(`${baseURL}/code`);
      const updatedSnippets = updatedSnippetsResponse.data.snippets || updatedSnippetsResponse.data.data || updatedSnippetsResponse.data;
      
      const foundSnippet = updatedSnippets.find(s => s.id === newSnippet.id);
      if (foundSnippet) {
        console.log('   ✅ New snippet found in public listings!');
        console.log(`   Author: ${foundSnippet.author?.username} (ID: ${foundSnippet.author?.id})`);
        console.log(`   Should match user ID: ${loggedInUser.id}`);
      } else {
        console.log('   ❌ New snippet not found in public listings');
      }

    } catch (error) {
      console.log('   ❌ Error creating test snippet:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugProfileData();
