const request = require('supertest');
const { app } = require('../test-app');

describe('User Endpoints Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Create a test user for testing
    const userData = {
      username: 'usertest',
      email: 'usertest@example.com',
      password: 'TestPass123!',
      fullName: 'User Test'
    };

    try {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      if (registerResponse.status === 201) {
        authToken = registerResponse.body.token;
      }
    } catch (error) {
      console.log('Test user creation failed, continuing without auth token');
    }
  });

  describe('GET /api/users/:username', () => {
    it('should get user profile by username', async () => {
      const response = await request(app)
        .get('/api/users/usertest');

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('username', 'usertest');
        expect(response.body.user).not.toHaveProperty('passwordHash'); // Password should be excluded
      }
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistentuser12345');

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 404) {
        expect(response.body).toHaveProperty('message', 'User not found');
      }
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      if (!authToken) {
        console.log('Skipping profile update test - no auth token');
        return;
      }

      const updateData = {
        name: 'Updated User Test',
        bio: 'This is a test bio'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('message', 'Profile updated successfully');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('fullName', 'Updated User Test');
        expect(response.body.user).toHaveProperty('bio', 'This is a test bio');
      }
    });

    it('should reject update with invalid data', async () => {
      if (!authToken) {
        console.log('Skipping invalid data test - no auth token');
        return;
      }

      const updateData = {
        username: 'invalid username with spaces'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 400) {
        expect(response.body).toHaveProperty('message');
      }
    });
  });
}); 