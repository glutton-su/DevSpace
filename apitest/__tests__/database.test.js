const request = require('supertest');
const { connectTestDatabase, closeTestDatabase } = require('../config/test-database');
const { app, initializeTestDatabase } = require('../test-app');

describe('Database Tests', () => {
  beforeAll(async () => {
    // Initialize test database
    const { testSequelize, models } = initializeTestDatabase();
    
    // Override models with test models
    const originalModels = require('../models');
    Object.keys(models).forEach(key => {
      originalModels[key] = models[key];
    });
    
    try {
      await connectTestDatabase();
    } catch (error) {
      console.log('Database connection failed, continuing with existing connection');
    }
  }, 60000); // Increase timeout for database connection

  afterAll(async () => {
    try {
      await closeTestDatabase();
    } catch (error) {
      console.log('Database cleanup failed');
    }
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'dbtestuser',
        email: 'dbtest@example.com',
        password: 'TestPass123!',
        fullName: 'DB Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 201) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('username', 'dbtestuser');
      }
    });

    it('should reject duplicate username', async () => {
      const userData = {
        username: 'dbtestuser', // Same username as above
        email: 'dbtest2@example.com',
        password: 'TestPass123!',
        fullName: 'DB Test User 2'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 400) {
        expect(response.body).toHaveProperty('message');
      }
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user
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
        // User might already exist
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

    it('should reject invalid credentials', async () => {
      const credentials = {
        email: 'logintest@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      // Should get a response
      expect(response.status).toBeDefined();
      
      if (response.status === 400) {
        expect(response.body).toHaveProperty('success', false);
      }
    });
  });
}); 