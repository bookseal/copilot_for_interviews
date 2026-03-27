'use strict';

/**
 * AudioProcessor: Real-time dB level calculation & WPM tracking
 *
 * dB formula: 20 * log10(rms / reference)
 * WPM = words_spoken / elapsed_minutes (rolling 30-sec window)
 */

const DB_MIN_THRESHOLD = parseFloat(process.env.DB_MIN_THRESHOLD ?? '-40');
const DB_MAX_THRESHOLD = parseFloat(process.env.DB_MAX_THRESHOLD ?? '-10');
const WPM_MIN_THRESHOLD = parseInt(process.env.WPM_MIN_THRESHOLD ?? '100', 10);
const WPM_MAX_THRESHOLD = parseInt(process.env.WPM_MAX_THRESHOLD ?? '180', 10);

const REFERENCE_AMPLITUDE = 32768; // 16-bit PCM max
const WPM_WINDOW_MS = 30_000;      // 30-second rolling window

class AudioProcessor {
  constructor() {
    this._wordLog = [];       // [{ timestamp, wordCount }]
    this._currentDb = -Infinity;
    this._currentWpm = 0;
    this._sessionStart = Date.now();
    this._totalWords = 0;
  }

  /**
   * Feed raw PCM samples (Int16Array or number[]) and get instant dB.
   * Call this on every audio chunk (~100ms worth of samples).
   */
  processPcmChunk(samples) {
    const rms = this._rms(samples);
    this._currentDb = rms > 0 ? 20 * Math.log10(rms / REFERENCE_AMPLITUDE) : -Infinity;
    return this._currentDb;
  }

  /**
   * Feed a recognised transcript segment (from Azure Speech or mock).
   * Updates the rolling WPM window.
   */
  processTranscript(text) {
    const words = this._countWords(text);
    if (words === 0) return this._currentWpm;

    const now = Date.now();
    this._totalWords += words;
    this._wordLog.push({ timestamp: now, wordCount: words });
    this._pruneWordLog(now);
    this._currentWpm = this._calcWpm(now);
    return this._currentWpm;
  }

  /** Snapshot of current telemetry + any active alerts */
  getSnapshot() {
    const alerts = [];
    if (this._currentDb !== -Infinity) {
      if (this._currentDb < DB_MIN_THRESHOLD) alerts.push({ type: 'VOLUME_LOW',  message: '목소리가 너무 작습니다 (mumbling)' });
      if (this._currentDb > DB_MAX_THRESHOLD) alerts.push({ type: 'VOLUME_HIGH', message: '목소리가 너무 큽니다' });
    }
    if (this._currentWpm > 0) {
      if (this._currentWpm < WPM_MIN_THRESHOLD) alerts.push({ type: 'PACE_SLOW', message: '말이 너무 느립니다' });
      if (this._currentWpm > WPM_MAX_THRESHOLD) alerts.push({ type: 'PACE_FAST', message: '말이 너무 빠릅니다 (rushing)' });
    }

    return {
      db: isFinite(this._currentDb) ? parseFloat(this._currentDb.toFixed(2)) : null,
      wpm: this._currentWpm,
      totalWords: this._totalWords,
      sessionDurationMs: Date.now() - this._sessionStart,
      thresholds: {
        db: { min: DB_MIN_THRESHOLD, max: DB_MAX_THRESHOLD },
        wpm: { min: WPM_MIN_THRESHOLD, max: WPM_MAX_THRESHOLD },
      },
      alerts,
      status: alerts.length === 0 ? 'OK' : 'WARNING',
    };
  }

  /** Simulate a single telemetry tick (for mock/demo mode) */
  simulateTick() {
    // Randomise dB in a natural speech range
    const fakeDb = -35 + Math.random() * 30;           // -35 to -5
    const fakePcm = this._dbToPcmSample(fakeDb);
    this.processPcmChunk([fakePcm]);

    // Occasionally add a "word burst" to simulate speech
    if (Math.random() < 0.4) {
      const wordBurst = Math.floor(Math.random() * 5) + 1;
      const fakeText = Array(wordBurst).fill('word').join(' ');
      this.processTranscript(fakeText);
    }

    return this.getSnapshot();
  }

  reset() {
    this._wordLog = [];
    this._currentDb = -Infinity;
    this._currentWpm = 0;
    this._sessionStart = Date.now();
    this._totalWords = 0;
  }

  // ── private helpers ──────────────────────────────────────────────────

  _rms(samples) {
    if (!samples || samples.length === 0) return 0;
    const sumSq = samples.reduce((acc, s) => acc + s * s, 0);
    return Math.sqrt(sumSq / samples.length);
  }

  _countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  _pruneWordLog(now) {
    const cutoff = now - WPM_WINDOW_MS;
    this._wordLog = this._wordLog.filter(e => e.timestamp >= cutoff);
  }

  _calcWpm(now) {
    if (this._wordLog.length === 0) return 0;
    const totalInWindow = this._wordLog.reduce((s, e) => s + e.wordCount, 0);
    const oldestTs = this._wordLog[0].timestamp;
    const windowMs = Math.max(now - oldestTs, 1000); // at least 1s denominator
    return Math.round(totalInWindow / (windowMs / 60_000));
  }

  _dbToPcmSample(db) {
    return Math.round(REFERENCE_AMPLITUDE * Math.pow(10, db / 20));
  }
}

module.exports = { AudioProcessor };
