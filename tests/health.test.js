const request = require('supertest');
const { app, server } = require('../src/index');

describe('Health & 404 Endpoints', () => {
  afterAll((done) => {
    if (server && server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  test('GET /api/v1/health should return 200 and running message', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('API is running');
  });

  test('GET /api/v1/non-existing-route should return 404', async () => {
    const res = await request(app).get('/api/v1/non-existing-route');
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });
});
