const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function debugNewSnippet() {
  console.log('🔍 Debugging New Snippet Creation\n');
  
  try {
    // Step 1: Login first (needed for authenticated endpoints)
    console.log('1. Logging in to get authenticated access...');
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'debuguser@devspace.com',
        password: 'TestPass123!'
      });
      
      if (!loginResponse.data.success) {
        throw new Error(`Login failed: ${loginResponse.data.message}`);
      }
      
      const token = loginResponse.data.token;
      const user = loginResponse.data.user;
      console.log('✅ Login successful, user:', user.username);

      // Step 2: Check all public snippets
      console.log('\n2. Checking all public snippets...');
      const publicSnippetsResponse = await axios.get(`${baseURL}/code`);
      const publicSnippets = publicSnippetsResponse.data.snippets || publicSnippetsResponse.data.data || publicSnippetsResponse.data;
      
      console.log(`✅ Found ${publicSnippets.length} public snippets:`);
      publicSnippets.forEach((snippet, index) => {
        console.log(`   ${index + 1}. ID: ${snippet.id}, Title: "${snippet.title}", Author: ${snippet.author?.username || 'Unknown'}`);
      });

      // Step 3: Check user's specific snippets (if there's an endpoint for it)
      console.log('\n3. Checking user-specific data...');
      try {
        // Try to get user's projects (which might contain snippets)
        const userProjectsResponse = await axios.get(`${baseURL}/users/${user.username}/projects`);
        const userProjects = userProjectsResponse.data.projects || userProjectsResponse.data.data || userProjectsResponse.data;
        console.log(`✅ Found ${userProjects.length} user projects`);
        
        if (userProjects.length > 0) {
          userProjects.forEach((project, index) => {
            console.log(`   Project ${index + 1}: ID: ${project.id}, Title: "${project.title}"`);
          });
        }
      } catch (error) {
        console.log('⚠️ Could not fetch user projects:', error.response?.status);
      }

      // Step 4: Try to create a test snippet to see what happens
      console.log('\n4. Testing snippet creation process...');
      try {
        // First, check if we need a project to create snippets
        const testSnippetData = {
          title: 'Debug Hello World',
          content: 'console.log("Debug Hello World");',
          language: 'javascript',
          description: 'Testing snippet creation for debugging',
          isPublic: true
        };

        const createResponse = await axios.post(`${baseURL}/code`, testSnippetData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Snippet creation successful!');
        console.log('Response:', createResponse.data);
        
      } catch (createError) {
        console.log('❌ Snippet creation failed:');
        console.log('Status:', createError.response?.status);
        console.log('Error:', createError.response?.data);
        
        // If it requires projectId, let's try to create a project first
        if (createError.response?.data?.details?.some(d => d.param === 'projectId')) {
          console.log('\n5. Snippet creation requires projectId. Creating a project first...');
          
          try {
            const projectData = {
              title: 'Debug Project',
              description: 'A project for testing snippet creation',
              isPublic: true
            };

            const createProjectResponse = await axios.post(`${baseURL}/projects`, projectData, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (createProjectResponse.data.success) {
              const project = createProjectResponse.data.data;
              console.log('✅ Project created successfully, ID:', project.id);

              // Now try creating the snippet with projectId
              const snippetWithProject = {
                ...testSnippetData,
                projectId: project.id
              };

              const createSnippetResponse = await axios.post(`${baseURL}/code`, snippetWithProject, {
                headers: { Authorization: `Bearer ${token}` }
              });

              console.log('✅ Snippet with project created successfully!');
              console.log('Snippet response:', createSnippetResponse.data);
            }
          } catch (projectError) {
            console.log('❌ Project creation also failed:', projectError.response?.data);
          }
        }
      }

      // Step 5: Check snippets again after creation attempts
      console.log('\n6. Checking snippets again...');
      const finalSnippetsResponse = await axios.get(`${baseURL}/code`);
      const finalSnippets = finalSnippetsResponse.data.snippets || finalSnippetsResponse.data.data || finalSnippetsResponse.data;
      console.log(`✅ Now found ${finalSnippets.length} public snippets total`);

    } catch (authError) {
      console.log('❌ Authentication failed:', authError.response?.data || authError.message);
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugNewSnippet();
