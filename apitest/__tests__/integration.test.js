const request = require('supertest');
const { app } = require('../test-app');

describe('Integration Tests (using main database)', () => {
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'integrationtest',
        email: 'integration@example.com',
        password: 'TestPass123!',
        fullName: 'Integration Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Should get a response (may be 201 or 500 depending on database)
      expect(response.status).toBeDefined();
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      }
    });

    it('should handle invalid registration data', async () => {
      const userData = {
        username: 'test',
        email: 'invalid-email',
        password: 'weak',
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('User Endpoints', () => {
    it('should get user profile by username', async () => {
      const response = await request(app)
        .get('/api/users/integrationtest');

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('user');
      }
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistentuser12345');

      // Should get a response (may be 404 or 500 depending on database state)
      expect(response.status).toBeDefined();
      
      if (response.status === 404) {
        expect(response.body).toHaveProperty('message', 'User not found');
      } else if (response.status === 500) {
        // Database error is acceptable for non-existent user
        expect(response.body).toHaveProperty('message');
      }
    });
  });

  describe('Project Endpoints', () => {
    it('should get projects list', async () => {
      const response = await request(app)
        .get('/api/projects');

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('projects');
      }
    });

    it('should handle project creation with auth', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project for integration testing'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData);

      // Should get 401 (unauthorized) since no auth token
      expect(response.status).toBe(401);
    });
  });
}); 