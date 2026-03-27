'use strict';

const { AudioProcessor } = require('../src/engines/audioProcessor');

describe('AudioProcessor', () => {
  let proc;

  beforeEach(() => {
    proc = new AudioProcessor();
  });

  // ── dB calculation ────────────────────────────────────────────────────

  describe('processPcmChunk', () => {
    test('returns a finite dB for non-zero samples', () => {
      const samples = new Int16Array(100).fill(1000);
      const db = proc.processPcmChunk(samples);
      expect(isFinite(db)).toBe(true);
      expect(db).toBeLessThan(0); // always negative for 16-bit PCM
    });

    test('returns -Infinity for silent (all-zero) input', () => {
      const db = proc.processPcmChunk(new Int16Array(100).fill(0));
      expect(db).toBe(-Infinity);
    });

    test('louder amplitude → higher dB', () => {
      const quiet = proc.processPcmChunk(new Int16Array(10).fill(500));
      const loud  = proc.processPcmChunk(new Int16Array(10).fill(15000));
      expect(loud).toBeGreaterThan(quiet);
    });
  });

  // ── WPM calculation ───────────────────────────────────────────────────

  describe('processTranscript', () => {
    test('returns 0 for empty/whitespace input', () => {
      expect(proc.processTranscript('   ')).toBe(0);
    });

    test('increments totalWords correctly', () => {
      proc.processTranscript('hello world');  // 2 words
      proc.processTranscript('good morning'); // 2 words
      const snap = proc.getSnapshot();
      expect(snap.totalWords).toBe(4);
    });

    test('calculates a positive WPM after speech', () => {
      proc.processTranscript('one two three four five six seven eight nine ten');
      const snap = proc.getSnapshot();
      expect(snap.wpm).toBeGreaterThan(0);
    });
  });

  // ── Snapshot & alerts ─────────────────────────────────────────────────

  describe('getSnapshot', () => {
    test('returns OK status with no data', () => {
      const snap = proc.getSnapshot();
      expect(snap.status).toBe('OK');
      expect(snap.alerts).toHaveLength(0);
    });

    test('triggers VOLUME_LOW alert when dB is below threshold', () => {
      // Very quiet sample → well below -40 dB
      proc.processPcmChunk([1, 1, 1]);
      const snap = proc.getSnapshot();
      const types = snap.alerts.map(a => a.type);
      expect(types).toContain('VOLUME_LOW');
    });

    test('triggers VOLUME_HIGH alert when dB is above threshold', () => {
      // Full-scale sample → near 0 dB
      proc.processPcmChunk(new Int16Array(10).fill(32000));
      const snap = proc.getSnapshot();
      const types = snap.alerts.map(a => a.type);
      expect(types).toContain('VOLUME_HIGH');
    });

    test('snapshot includes thresholds', () => {
      const snap = proc.getSnapshot();
      expect(snap.thresholds.db).toHaveProperty('min');
      expect(snap.thresholds.wpm).toHaveProperty('max');
    });
  });

  // ── simulateTick ──────────────────────────────────────────────────────

  describe('simulateTick', () => {
    test('returns a valid snapshot', () => {
      const snap = proc.simulateTick();
      expect(snap).toHaveProperty('status');
      expect(snap.db).not.toBeUndefined();
    });

    test('tick always returns a finite dB', () => {
      for (let i = 0; i < 20; i++) {
        const snap = proc.simulateTick();
        expect(isFinite(snap.db)).toBe(true);
      }
    });
  });

  // ── reset ─────────────────────────────────────────────────────────────

  test('reset clears all state', () => {
    proc.processTranscript('one two three');
    proc.processPcmChunk(new Int16Array(10).fill(1000));
    proc.reset();
    const snap = proc.getSnapshot();
    expect(snap.totalWords).toBe(0);
    expect(snap.wpm).toBe(0);
    expect(snap.db).toBeNull();
  });
});
