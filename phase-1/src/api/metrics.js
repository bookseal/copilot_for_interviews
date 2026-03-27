'use strict';

const { Router } = require('express');
const { sessionManager } = require('../engines/sessionManager');

const router = Router();

/**
 * POST /api/metrics/:sessionId/transcript
 * Feed a speech transcript chunk → get updated telemetry.
 * Body: { text: string }
 */
router.post('/:sessionId/transcript', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ ok: false, error: '`text` is required' });

  try {
    const snapshot = sessionManager.ingestTranscript(req.params.sessionId, text);
    res.json({ ok: true, snapshot });
  } catch (err) {
    res.status(404).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/metrics/:sessionId/tick
 * Simulate one telemetry tick (mock/demo mode — no mic needed).
 */
router.post('/:sessionId/tick', (req, res) => {
  try {
    const snapshot = sessionManager.simulateTick(req.params.sessionId);
    res.json({ ok: true, snapshot });
  } catch (err) {
    res.status(404).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/metrics/:sessionId/snapshot
 * Get the latest telemetry snapshot without advancing state.
 */
router.get('/:sessionId/snapshot', (req, res) => {
  const session = sessionManager.get(req.params.sessionId);
  if (!session) return res.status(404).json({ ok: false, error: 'Session not found' });
  res.json({ ok: true, snapshot: session.snapshot });
});

/**
 * GET /api/metrics/:sessionId/history
 * Get recent telemetry history (for chart replay).
 * Query: ?limit=100
 */
router.get('/:sessionId/history', (req, res) => {
  const limit = parseInt(req.query.limit ?? '100', 10);
  const history = sessionManager.getHistory(req.params.sessionId, limit);
  if (!history) return res.status(404).json({ ok: false, error: 'Session not found' });
  res.json({ ok: true, history });
});

module.exports = router;
