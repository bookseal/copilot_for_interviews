'use strict';

const { AudioProcessor } = require('./audioProcessor');

/**
 * SessionManager: manages per-interview-session lifecycle.
 * One session = one interview attempt.
 */
class SessionManager {
  constructor() {
    this._sessions = new Map(); // id → { processor, startedAt, history }
  }

  create(sessionId) {
    if (this._sessions.has(sessionId)) return this.get(sessionId);

    const session = {
      id: sessionId,
      processor: new AudioProcessor(),
      startedAt: new Date().toISOString(),
      history: [],          // keeps last 200 snapshots for chart replay
      transcripts: [],      // [{ ts, text }] — full transcript log
    };
    this._sessions.set(sessionId, session);
    return this._publicView(session);
  }

  get(sessionId) {
    const s = this._sessions.get(sessionId);
    return s ? this._publicView(s) : null;
  }

  /** Feed transcript and return snapshot */
  ingestTranscript(sessionId, text) {
    const s = this._sessions.get(sessionId);
    if (!s) throw new Error(`Session not found: ${sessionId}`);
    s.processor.processTranscript(text);
    s.transcripts.push({ ts: Date.now(), text: text.trim() });
    return this._snap(s);
  }

  /** Return the full transcript log for a session */
  getTranscripts(sessionId) {
    const s = this._sessions.get(sessionId);
    if (!s) return null;
    return {
      chunks: s.transcripts,
      fullText: s.transcripts.map(c => c.text).join(' '),
    };
  }

  /** Feed raw PCM chunk (Buffer/Int16Array) */
  ingestPcm(sessionId, pcmBuffer) {
    const s = this._sessions.get(sessionId);
    if (!s) throw new Error(`Session not found: ${sessionId}`);
    const samples = new Int16Array(pcmBuffer.buffer ?? pcmBuffer);
    s.processor.processPcmChunk(samples);
    return this._snap(s);
  }

  /** Simulate a tick (mock/demo) */
  simulateTick(sessionId) {
    const s = this._sessions.get(sessionId);
    if (!s) throw new Error(`Session not found: ${sessionId}`);
    const snap = s.processor.simulateTick();
    this._pushHistory(s, snap);
    return snap;
  }

  getHistory(sessionId, limit = 100) {
    const s = this._sessions.get(sessionId);
    if (!s) return null;
    return s.history.slice(-limit);
  }

  listSessions() {
    return [...this._sessions.values()].map(s => ({
      id: s.id,
      startedAt: s.startedAt,
      historyLength: s.history.length,
    }));
  }

  delete(sessionId) {
    return this._sessions.delete(sessionId);
  }

  // ── private ────────────────────────────────────────────────────────────

  _snap(session) {
    const snap = session.processor.getSnapshot();
    this._pushHistory(session, snap);
    return snap;
  }

  _pushHistory(session, snap) {
    session.history.push({ ts: Date.now(), ...snap });
    if (session.history.length > 200) session.history.shift();
  }

  _publicView(session) {
    return {
      id: session.id,
      startedAt: session.startedAt,
      snapshot: session.processor.getSnapshot(),
    };
  }
}

// Singleton for the process lifetime
const sessionManager = new SessionManager();
module.exports = { SessionManager, sessionManager };
