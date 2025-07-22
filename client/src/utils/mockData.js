// Mock data for development when backend is not available
export const mockSnippets = [
  {
    id: 1,
    title: "React useState Hook Example",
    description: "A simple example of using React's useState hook for state management",
    code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;`,
    language: "javascript",
    views: 245,
    starCount: 12,
    createdAt: "2024-01-15T10:30:00Z",
    allowCollaboration: true,
    User: {
      id: 1,
      username: "john_doe",
      name: "John Doe",
      avatar: "/default-avatar.svg"
    }
  },
  {
    id: 2,
    title: "Python List Comprehension",
    description: "Examples of Python list comprehensions for data processing",
    code: `# Basic list comprehension
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(squares)  # [1, 4, 9, 16, 25]

# Conditional list comprehension
even_squares = [x**2 for x in numbers if x % 2 == 0]
print(even_squares)  # [4, 16]

# Nested list comprehension
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print(flattened)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]`,
    language: "python",
    views: 189,
    starCount: 8,
    createdAt: "2024-01-10T14:20:00Z",
    allowCollaboration: false,
    User: {
      id: 2,
      username: "jane_smith",
      name: "Jane Smith",
      avatar: "/default-avatar.svg"
    }
  },
  {
    id: 3,
    title: "CSS Flexbox Layout",
    description: "A responsive flexbox layout example with navigation and content",
    code: `.container {
  display: flex;
  min-height: 100vh;
}

.nav {
  background: #333;
  color: white;
  padding: 1rem;
  flex: 0 0 200px;
}

.content {
  flex: 1;
  padding: 1rem;
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .nav {
    flex: 0 0 auto;
  }
}`,
    language: "css",
    views: 156,
    starCount: 6,
    createdAt: "2024-01-08T09:15:00Z",
    allowCollaboration: true,
    User: {
      id: 3,
      username: "css_master",
      name: "CSS Master",
      avatar: "/default-avatar.svg"
    }
  }
];

export default mockSnippets;
