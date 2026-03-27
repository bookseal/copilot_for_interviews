'use strict';

const request = require('supertest');

// Start the server without listening on a real port for tests
process.env.MOCK_MODE = 'true';
process.env.PORT = '0';

const { app } = require('../src/server');

describe('API Integration', () => {

  describe('GET /api/health', () => {
    test('returns 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.mockMode).toBe(true);
    });
  });

  describe('Sessions API', () => {
    const sessionId = `test_session_${Date.now()}`;

    test('POST /api/sessions creates a session', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ sessionId });
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.session.id).toBe(sessionId);
    });

    test('GET /api/sessions/:id returns the session', async () => {
      const res = await request(app).get(`/api/sessions/${sessionId}`);
      expect(res.status).toBe(200);
      expect(res.body.session.id).toBe(sessionId);
    });

    test('GET /api/sessions/:id returns 404 for unknown id', async () => {
      const res = await request(app).get('/api/sessions/no_such_session');
      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });

    test('GET /api/sessions lists sessions', async () => {
      const res = await request(app).get('/api/sessions');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
    });

    test('DELETE /api/sessions/:id removes the session', async () => {
      const res = await request(app).delete(`/api/sessions/${sessionId}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('Metrics API', () => {
    const sessionId = `metrics_test_${Date.now()}`;

    beforeAll(async () => {
      await request(app).post('/api/sessions').send({ sessionId });
    });

    test('POST /api/metrics/:id/transcript updates WPM', async () => {
      const res = await request(app)
        .post(`/api/metrics/${sessionId}/transcript`)
        .send({ text: 'The quick brown fox jumps over the lazy dog' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.snapshot.totalWords).toBeGreaterThan(0);
    });

    test('POST /api/metrics/:id/transcript requires text field', async () => {
      const res = await request(app)
        .post(`/api/metrics/${sessionId}/transcript`)
        .send({});
      expect(res.status).toBe(400);
    });

    test('POST /api/metrics/:id/tick returns a snapshot', async () => {
      const res = await request(app).post(`/api/metrics/${sessionId}/tick`);
      expect(res.status).toBe(200);
      expect(res.body.snapshot).toHaveProperty('status');
    });

    test('GET /api/metrics/:id/snapshot returns latest snapshot', async () => {
      const res = await request(app).get(`/api/metrics/${sessionId}/snapshot`);
      expect(res.status).toBe(200);
      expect(res.body.snapshot).toHaveProperty('thresholds');
    });

    test('GET /api/metrics/:id/history returns array', async () => {
      const res = await request(app).get(`/api/metrics/${sessionId}/history?limit=10`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.history)).toBe(true);
    });
  });
});
