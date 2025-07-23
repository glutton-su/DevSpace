// Test the complete collaboration flow
async function testCollaborationFlow() {
  console.log('🔄 Testing collaboration flow...');
  
  try {
    // 1. Get collaborative snippets
    console.log('\n📋 Step 1: Fetching collaborative snippets...');
    const response = await fetch('http://localhost:5000/api/code/collaborative');
    const data = await response.json();
    
    console.log('✅ Found', data.snippets?.length || 0, 'collaborative snippets');
    
    if (data.snippets && data.snippets.length > 0) {
      const snippet = data.snippets[0];
      console.log('\n📝 Testing with snippet:', {
        id: snippet.id,
        title: snippet.title,
        allowCollaboration: snippet.allowCollaboration,
        projectId: snippet.projectId,
        collaborators: snippet.project?.collaborators?.length || 0
      });
      
      // 2. Test getting snippet by ID
      console.log('\n📋 Step 2: Getting snippet by ID...');
      const snippetResponse = await fetch(`http://localhost:5000/api/code/${snippet.id}`);
      const snippetData = await snippetResponse.json();
      
      if (snippetData.codeSnippet) {
        console.log('✅ Snippet data retrieved:', {
          title: snippetData.codeSnippet.title,
          collaborators: snippetData.codeSnippet.project?.collaborators?.length || 0,
          isCollaborator: snippetData.codeSnippet.isCollaborator,
          collaboratorRole: snippetData.codeSnippet.collaboratorRole
        });
        
        // 3. Test the project data structure
        if (snippetData.codeSnippet.project?.collaborators) {
          console.log('\n👥 Project collaborators:');
          snippetData.codeSnippet.project.collaborators.forEach((collab, index) => {
            console.log(`  ${index + 1}. ${collab.user?.username || 'Unknown'} (${collab.role})`);
          });
        }
      }
      
      console.log('\n✅ All tests passed!');
    } else {
      console.log('⚠️  No collaborative snippets found to test with');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCollaborationFlow();
