'use strict';

const { analyze } = require('../src/engines/feedbackAnalyzer');

// Sample telemetry history
const goodHistory = Array.from({ length: 60 }, (_, i) => ({
  db: -25 + Math.sin(i * 0.2) * 5,
  wpm: 140 + Math.sin(i * 0.3) * 10,
}));

describe('FeedbackAnalyzer', () => {

  test('returns a report with all expected keys', () => {
    const r = analyze({ fullText: 'I led a team to build a microservice.', history: goodHistory, sessionDurationMs: 60000 });
    expect(r).toHaveProperty('score');
    expect(r).toHaveProperty('fillerWords');
    expect(r).toHaveProperty('pace');
    expect(r).toHaveProperty('volume');
    expect(r).toHaveProperty('star');
    expect(r).toHaveProperty('repeatedWords');
    expect(r).toHaveProperty('suggestions');
    expect(r).toHaveProperty('transcript');
  });

  test('score is between 0 and 100', () => {
    const r = analyze({ fullText: 'Hello world.', history: [], sessionDurationMs: 5000 });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  describe('filler word detection', () => {
    test('detects English filler words', () => {
      const r = analyze({ fullText: 'um so i was like basically working um on the project uh you know', history: [] });
      expect(r.fillerWords.total).toBeGreaterThan(3);
      expect(r.fillerWords.breakdown).toHaveProperty('um');
    });

    test('detects Korean filler words', () => {
      const r = analyze({ fullText: '음 그래서 저는 어 팀에서 음 일하고 있었는데', history: [] });
      expect(r.fillerWords.total).toBeGreaterThan(1);
    });

    test('reports good status for clean text', () => {
      const r = analyze({ fullText: 'I led a cross-functional team to deliver the project on time.', history: [] });
      expect(r.fillerWords.status).toBe('good');
    });

    test('filler ratio is percentage between 0-100', () => {
      const r = analyze({ fullText: 'um the project was like interesting', history: [] });
      expect(r.fillerWords.ratio).toBeGreaterThanOrEqual(0);
      expect(r.fillerWords.ratio).toBeLessThanOrEqual(100);
    });
  });

  describe('STAR structure analysis', () => {
    test('detects all 4 STAR parts in a complete answer', () => {
      const fullSTAR = `
        When I was working at my previous company (Situation),
        I had to migrate the database (Task).
        I decided to use a blue-green deployment strategy and implemented it over two weeks (Action).
        As a result, we reduced downtime by 90% (Result).
      `;
      const r = analyze({ fullText: fullSTAR, history: [] });
      expect(r.star.completeness).toBe(4);
      expect(r.star.status).toBe('complete');
    });

    test('marks missing STAR parts correctly', () => {
      const r = analyze({ fullText: 'I built a microservice and deployed it.', history: [] });
      expect(r.star.completeness).toBeLessThan(4);
    });

    test('star percentage is 0-100', () => {
      const r = analyze({ fullText: 'something', history: [] });
      expect(r.star.percentage).toBeGreaterThanOrEqual(0);
      expect(r.star.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('pace analysis', () => {
    test('returns no-data when history is empty', () => {
      const r = analyze({ fullText: '', history: [] });
      expect(r.pace.status).toBe('no-data');
    });

    test('flags fast pace correctly', () => {
      const fastHistory = Array.from({ length: 20 }, () => ({ db: -25, wpm: 220 }));
      const r = analyze({ fullText: 'test', history: fastHistory });
      expect(r.pace.status).toBe('fast');
    });

    test('returns good status for WPM in 100-180 range', () => {
      const normalHistory = Array.from({ length: 20 }, () => ({ db: -25, wpm: 145 }));
      const r = analyze({ fullText: 'test', history: normalHistory });
      expect(r.pace.status).toBe('good');
    });
  });

  describe('repeated words', () => {
    test('detects words repeated 3+ times', () => {
      const r = analyze({ fullText: 'basically we used kubernetes and kubernetes was great and kubernetes scaled well', history: [] });
      const found = r.repeatedWords.find(w => w.word === 'kubernetes');
      expect(found).toBeDefined();
      expect(found.count).toBeGreaterThanOrEqual(3);
    });

    test('does not flag stop words', () => {
      const r = analyze({ fullText: 'the the the the and and and and', history: [] });
      expect(r.repeatedWords).toHaveLength(0);
    });
  });

  describe('suggestions', () => {
    test('always returns at least one suggestion', () => {
      const r = analyze({ fullText: '', history: [] });
      expect(r.suggestions.length).toBeGreaterThan(0);
    });

    test('returns positive message for excellent answer', () => {
      const excellentText = `
        When I was working at a startup (Situation), I had to rebuild our payment service (Task).
        I decided to implement a new microservice architecture and built it with Node.js (Action).
        As a result we achieved 99.9% uptime and reduced latency by 40% (Result).
      `;
      const r = analyze({ fullText: excellentText, history: goodHistory, sessionDurationMs: 90000 });
      expect(r.suggestions.some(s => s.includes('👍'))).toBe(true);
    });
  });
});
