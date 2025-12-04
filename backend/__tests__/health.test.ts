import request from 'supertest';
import express from 'express';

describe('Health Check', () => {
  it('should return 200 OK from health endpoint', async () => {
    const response = await request(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('should have CORS headers configured', async () => {
    const response = await request(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
      .options('/api/users/me')
      .set('Origin', process.env.FRONTEND_URL || 'http://localhost:3000')
      .expect(204);
    
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
