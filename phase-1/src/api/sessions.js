'use strict';

const { Router } = require('express');
const { sessionManager } = require('../engines/sessionManager');
const { analyze } = require('../engines/feedbackAnalyzer');
const { transcribe } = require('../engines/whisperClient');

const router = Router();

/**
 * POST /api/sessions
 * Create a new interview session.
 * Body: { sessionId?: string }
 */
router.post('/', (req, res) => {
  const sessionId = req.body.sessionId ?? `session_${Date.now()}`;
  const session = sessionManager.create(sessionId);
  res.status(201).json({ ok: true, session });
});

/**
 * GET /api/sessions
 * List all active sessions.
 */
router.get('/', (_req, res) => {
  res.json({ ok: true, sessions: sessionManager.listSessions() });
});

/**
 * GET /api/sessions/:id
 * Get session info + latest snapshot.
 */
router.get('/:id', (req, res) => {
  const session = sessionManager.get(req.params.id);
  if (!session) return res.status(404).json({ ok: false, error: 'Session not found' });
  res.json({ ok: true, session });
});

/**
 * GET /api/sessions/:id/transcript
 * Get the full accumulated transcript for a session.
 */
router.get('/:id/transcript', (req, res) => {
  const data = sessionManager.getTranscripts(req.params.id);
  if (!data) return res.status(404).json({ ok: false, error: 'Session not found' });
  res.json({ ok: true, ...data });
});

/**
 * POST /api/sessions/:id/summarize
 * Run rule-based feedback analysis on the session transcript + telemetry.
 * Body: { sessionStartMs?: number } — client mic-on timestamp for accurate duration
 */
router.post('/:id/summarize', (req, res) => {
  const id = req.params.id;
  const transcriptData = sessionManager.getTranscripts(id);
  if (!transcriptData) return res.status(404).json({ ok: false, error: 'Session not found' });

  const history = sessionManager.getHistory(id, 500) ?? [];
  const snapshot = sessionManager.get(id)?.snapshot ?? {};

  // Use client-reported mic-on time if provided (most accurate)
  const sessionDurationMs = req.body?.sessionStartMs
    ? Date.now() - req.body.sessionStartMs
    : snapshot.sessionDurationMs ?? 0;

  const report = analyze({
    fullText: transcriptData.fullText,
    history,
    sessionDurationMs,
    totalWords: snapshot.totalWords ?? 0,
  });

  res.json({ ok: true, report });
});

/**
 * POST /api/sessions/:id/transcribe
 * Receive raw audio chunk (binary body), send to Whisper, return text.
 * Header: X-Lang: ko-KR | en-US (optional)
 */
router.post('/:id/transcribe', async (req, res) => {
  const id = req.params.id;
  if (!sessionManager.get(id)) return res.status(404).json({ ok: false, error: 'Session not found' });

  const chunks = [];
  req.on('data', d => chunks.push(d));
  req.on('end', async () => {
    const audioBuffer = Buffer.concat(chunks);
    if (audioBuffer.length < 1000) {
      return res.json({ ok: true, text: '' }); // too short to transcribe
    }

    const lang = (req.headers['x-lang'] || 'ko-KR').toLowerCase();
    try {
      const text = await transcribe(audioBuffer, lang);
      if (text) {
        sessionManager.ingestTranscript(id, text);
      }
      res.json({ ok: true, text });
    } catch (err) {
      console.error('[Whisper]', err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });
});

/**
 * DELETE /api/sessions/:id
 * End/delete a session.
 */
router.delete('/:id', (req, res) => {
  const deleted = sessionManager.delete(req.params.id);
  res.json({ ok: deleted, message: deleted ? 'Session ended' : 'Session not found' });
});

module.exports = router;
