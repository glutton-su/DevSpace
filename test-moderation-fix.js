const express = require('express');
const cors = require('cors');

// Create a simple test server to verify moderation functionality
const app = express();
app.use(cors());
app.use(express.json());

// Mock admin middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 1, username: 'suwalsubeg', role: 'admin' };
  next();
};

// Mock users data
const mockUsers = [
  {
    id: 1,
    username: 'suwalsubeg',
    email: 'suwalsubeg@gmail.com',
    fullName: 'Subeg Suwal',
    role: 'admin',
    isSuspended: false,
    createdAt: new Date(),
    lastLogin: new Date()
  },
  {
    id: 2,
    username: 'testuser1',
    email: 'test1@example.com',
    fullName: 'Test User 1',
    role: 'user',
    isSuspended: false,
    createdAt: new Date(),
    lastLogin: new Date()
  },
  {
    id: 3,
    username: 'testuser2',
    email: 'test2@example.com',
    fullName: 'Test User 2',
    role: 'user',
    isSuspended: true,
    createdAt: new Date(),
    lastLogin: new Date()
  }
];

// Test moderation endpoints
app.get('/api/moderation/users', mockAuth, (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  
  let filteredUsers = mockUsers;
  if (search) {
    filteredUsers = mockUsers.filter(user => 
      user.username.includes(search) || 
      user.email.includes(search) ||
      user.fullName.includes(search)
    );
  }
  
  res.json({
    users: filteredUsers,
    total: filteredUsers.length,
    page: parseInt(page),
    totalPages: Math.ceil(filteredUsers.length / limit)
  });
});

app.put('/api/moderation/users/:id/suspend', mockAuth, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.isSuspended = true;
  res.json({ message: 'User suspended successfully' });
});

app.put('/api/moderation/users/:id/unsuspend', mockAuth, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.isSuspended = false;
  res.json({ message: 'User unsuspended successfully' });
});

app.delete('/api/moderation/users/:id', mockAuth, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (userId === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  
  mockUsers.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
});

app.put('/api/moderation/users/:id/role', mockAuth, (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (!['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  user.role = role;
  res.json({ message: `User role updated to ${role}` });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Test moderation server running on port ${port}`);
  console.log('Test endpoints:');
  console.log(`GET http://localhost:${port}/api/moderation/users`);
  console.log(`PUT http://localhost:${port}/api/moderation/users/2/suspend`);
  console.log(`PUT http://localhost:${port}/api/moderation/users/2/unsuspend`);
  console.log(`DELETE http://localhost:${port}/api/moderation/users/2`);
});
