const { default: fetch } = require('node-fetch');

async function createTestSnippets() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Creating test snippets and starred snippets...');
    
    // Login to get a token
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
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken || loginData.token;
    
    if (!token) {
      console.error('No token received');
      return;
    }
    
    console.log('Login successful');
    
    // First, let's create a project for our snippets
    console.log('\n=== Creating a test project ===');
    const projectResponse = await fetch(`${baseURL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Project',
        description: 'A project for testing snippets',
        isPublic: true
      }),
    });
    
    if (!projectResponse.ok) {
      const projectError = await projectResponse.text();
      console.log('Project creation failed:', projectError);
      return;
    }
    
    const projectData = await projectResponse.json();
    const projectId = projectData.project.id;
    console.log('Project created with ID:', projectId);
    
    // Create some test snippets
    console.log('\n=== Creating test snippets ===');
    
    const snippets = [
      {
        title: 'React Component',
        content: `import React from 'react';

const MyComponent = () => {
  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a React component</p>
    </div>
  );
};

export default MyComponent;`,
        language: 'javascript',
        description: 'A simple React component',
        isPublic: true,
        projectId: projectId
      },
      {
        title: 'Python Function',
        content: `def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    
    return fib

# Example usage
print(fibonacci(10))`,
        language: 'python',
        description: 'Fibonacci sequence generator',
        isPublic: true,
        projectId: projectId
      },
      {
        title: 'CSS Animation',
        content: `.bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

/* Usage: Add 'bounce' class to any element */`,
        language: 'css',
        description: 'Bouncing animation effect',
        isPublic: false,
        projectId: projectId
      }
    ];
    
    const createdSnippets = [];
    
    for (const snippet of snippets) {
      const snippetResponse = await fetch(`${baseURL}/code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snippet),
      });
      
      if (snippetResponse.ok) {
        const snippetData = await snippetResponse.json();
        createdSnippets.push(snippetData.snippet);
        console.log(`Created snippet: ${snippet.title} (ID: ${snippetData.snippet.id})`);
      } else {
        const snippetError = await snippetResponse.text();
        console.log(`Failed to create snippet ${snippet.title}:`, snippetError);
      }
    }
    
    // Star one of the public snippets (snippet ID 10 from earlier test)
    console.log('\n=== Starring a public snippet ===');
    const starResponse = await fetch(`${baseURL}/code/10/star`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (starResponse.ok) {
      console.log('Successfully starred snippet ID 10');
    } else {
      const starError = await starResponse.text();
      console.log('Failed to star snippet:', starError);
    }
    
    // Also star one of our own snippets if we created any
    if (createdSnippets.length > 0) {
      const ownSnippetId = createdSnippets[0].id;
      const starOwnResponse = await fetch(`${baseURL}/code/${ownSnippetId}/star`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (starOwnResponse.ok) {
        console.log(`Successfully starred own snippet ID ${ownSnippetId}`);
      } else {
        const starOwnError = await starOwnResponse.text();
        console.log('Failed to star own snippet:', starOwnError);
      }
    }
    
    console.log('\n=== Test data creation complete ===');
    console.log(`Created ${createdSnippets.length} snippets in project ${projectId}`);
    console.log('Starred at least one snippet');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestSnippets();
