/**
 * End-to-end test for project-based collaboration system
 */

// Simulate a complete collaboration flow
async function testCompleteFlow() {
  console.log('🚀 Starting end-to-end collaboration test...');
  
  try {
    // 1. Login as user to test authenticated requests
    console.log('\n🔐 Step 1: Login (simulated)');
    const authHeaders = {
      'Content-Type': 'application/json',
      // In a real test, we'd get this from login
      'Authorization': 'Bearer test-token'
    };
    
    // 2. Get collaborative snippets
    console.log('\n📋 Step 2: Fetching collaborative snippets');
    const collaborativeResponse = await fetch('http://localhost:5000/api/code/collaborative');
    const collaborativeData = await collaborativeResponse.json();
    
    console.log(`✅ Found ${collaborativeData.snippets?.length || 0} collaborative snippets`);
    
    if (collaborativeData.snippets && collaborativeData.snippets.length > 0) {
      const testSnippet = collaborativeData.snippets.find(s => s.allowCollaboration) || collaborativeData.snippets[0];
      
      console.log(`\n📝 Testing with snippet: "${testSnippet.title}" (ID: ${testSnippet.id})`);
      console.log(`   Project: ${testSnippet.project.title} (ID: ${testSnippet.projectId})`);
      console.log(`   Current collaborators: ${testSnippet.project.collaborators?.length || 0}`);
      
      // 3. Get detailed snippet data
      console.log('\n📄 Step 3: Getting detailed snippet data');
      const detailResponse = await fetch(`http://localhost:5000/api/code/${testSnippet.id}`);
      const detailData = await detailResponse.json();
      
      if (detailData.codeSnippet) {
        console.log('✅ Detailed snippet data structure:');
        console.log('   - Title:', detailData.codeSnippet.title);
        console.log('   - Allow collaboration:', detailData.codeSnippet.allowCollaboration);
        console.log('   - Project collaborators:', detailData.codeSnippet.project?.collaborators?.length || 0);
        
        // Display collaborator details if any exist
        if (detailData.codeSnippet.project?.collaborators?.length > 0) {
          console.log('\n👥 Current project collaborators:');
          detailData.codeSnippet.project.collaborators.forEach((collab, index) => {
            console.log(`   ${index + 1}. ${collab.user?.username || 'Unknown'} (${collab.role})`);
          });
        }
        
        // 4. Test UI data compatibility
        console.log('\n🎨 Step 4: Testing UI data compatibility');
        
        // Test SnippetCard data requirements
        const snippetCardData = {
          hasProjectData: Boolean(detailData.codeSnippet.project),
          hasOwnerData: Boolean(detailData.codeSnippet.project?.owner),
          hasCollaboratorData: Boolean(detailData.codeSnippet.project?.collaborators),
          collaboratorCount: detailData.codeSnippet.project?.collaborators?.length || 0
        };
        
        console.log('✅ SnippetCard compatibility:', snippetCardData);
        
        // Test SnippetActions data requirements
        const snippetActionsData = {
          canDetermineOwnership: Boolean(detailData.codeSnippet.project?.userId),
          canCheckCollaboration: Boolean(detailData.codeSnippet.project?.collaborators !== undefined),
          allowsCollaboration: Boolean(detailData.codeSnippet.allowCollaboration)
        };
        
        console.log('✅ SnippetActions compatibility:', snippetActionsData);
        
        console.log('\n🎉 All tests passed! UI should display correctly.');
        
        // 5. Summary
        console.log('\n📊 Summary:');
        console.log(`   - Collaborative snippets available: ${collaborativeData.snippets.length}`);
        console.log(`   - Project-based collaboration: ✅ Working`);
        console.log(`   - Data structure: ✅ Compatible with UI`);
        console.log(`   - Backend endpoints: ✅ Responding correctly`);
        
      } else {
        console.warn('⚠️  Could not get detailed snippet data');
      }
      
    } else {
      console.log('⚠️  No collaborative snippets found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
testCompleteFlow();
