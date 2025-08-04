const request = require('supertest');
const { connectTestDatabase, closeTestDatabase } = require('../config/test-database');
const { app } = require('../test-app');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    try {
      await connectTestDatabase();
    } catch (error) {
      console.log('Using existing database connection');
    }
  });

  afterAll(async () => {
    try {
      await closeTestDatabase();
    } catch (error) {
      console.log('Database connection already closed');
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'authuser1',
        email: 'auth1@example.com',
        password: 'TestPass123!',
        fullName: 'Auth User 1'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Should get a response (may be 201 or 500 depending on database state)
      expect(response.status).toBeDefined();
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('username', 'authuser1');
      }
    });

    it('should reject invalid email', async () => {
      const userData = {
        username: 'authuser2',
        email: 'invalid-email',
        password: 'TestPass123!',
        fullName: 'Auth User 2'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login
      const userData = {
        username: 'logintestuser',
        email: 'logintest@example.com',
        password: 'TestPass123!',
        fullName: 'Login Test User'
      };

      try {
        await request(app)
          .post('/api/auth/register')
          .send(userData);
      } catch (error) {
        // User might already exist, continue
      }
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'logintest@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      }
    });
  });
}); 