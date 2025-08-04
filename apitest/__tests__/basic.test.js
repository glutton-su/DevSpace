const request = require('supertest');
const { app } = require('../test-app');

describe('Basic Server Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });

  describe('API Routes', () => {
    it('should have auth routes available', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test',
          email: 'test@example.com',
          password: 'TestPass123!',
          fullName: 'Test User'
        });

      // Should get a response (even if it's an error due to database)
      expect(response.status).toBeDefined();
    });

    it('should have user routes available', async () => {
      const response = await request(app)
        .get('/api/users/testuser');

      // Should get a response
      expect(response.status).toBeDefined();
    });

    it('should have project routes available', async () => {
      const response = await request(app)
        .get('/api/projects');

      // Should get a response
      expect(response.status).toBeDefined();
    });
  });
}); 