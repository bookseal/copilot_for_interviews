'use strict';

/**
 * FeedbackAnalyzer — rule-based interview feedback engine.
 * Zero external dependencies. Works fully offline.
 *
 * Input:  { fullText, history, sessionDurationMs }
 * Output: structured feedback report
 */

// ── Filler words (KO + EN) ───────────────────────────────────────────────
const FILLER_WORDS = [
  // Korean
  '음', '어', '그', '뭐', '그래서', '아', '네', '맞아요',
  // English
  'um', 'uh', 'like', 'basically', 'literally', 'actually',
  'you know', 'i mean', 'sort of', 'kind of', 'right', 'okay so',
];

// ── STAR pattern keywords ────────────────────────────────────────────────
const STAR_PATTERNS = {
  Situation: [
    'was working', 'were working', 'at the time', 'when i', 'when we',
    'in my previous', 'at my', '팀에서', '프로젝트에서', '당시', '상황은',
  ],
  Task: [
    'had to', 'needed to', 'responsible for', 'my role', 'task was',
    'was asked to', '담당', '역할', '목표', '해야 했', '필요했',
  ],
  Action: [
    'i decided', 'i implemented', 'i built', 'i created', 'i worked',
    'we decided', 'we implemented', 'i used', 'i wrote', 'i designed',
    '구현', '개발', '작성', '설계', '진행', '해결',
  ],
  Result: [
    'as a result', 'in the end', 'we achieved', 'we reduced', 'we improved',
    'the outcome', 'resulted in', '결과', '성과', '개선', '줄였', '높였',
  ],
};

/**
 * Main analysis function.
 * @param {object} params
 * @param {string} params.fullText - complete transcript
 * @param {Array}  params.history  - telemetry history [{db, wpm, ...}]
 * @param {number} params.sessionDurationMs
 * @param {number} params.totalWords
 */
function analyze({ fullText = '', history = [], sessionDurationMs = 0, totalWords = 0 }) {
  const text = fullText.trim();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length || totalWords;
  const durationMin = sessionDurationMs / 60_000;

  const sections = {
    summary: buildSummary(wordCount, durationMin, history),
    fillerWords: analyzeFillers(words),
    pace: analyzePace(history),
    volume: analyzeVolume(history),
    star: analyzeSTAR(text),
    repeatedWords: findRepeatedWords(words),
    suggestions: [],
    score: 0,
    transcript: text,
  };

  sections.suggestions = buildSuggestions(sections);
  sections.score = calcScore(sections);

  return sections;
}

// ── Summary ──────────────────────────────────────────────────────────────

function buildSummary(wordCount, durationMin, history) {
  const avgWpm = history.length
    ? Math.round(history.filter(h => h.wpm > 0).reduce((s, h) => s + h.wpm, 0) /
        Math.max(1, history.filter(h => h.wpm > 0).length))
    : 0;

  return {
    totalWords: wordCount,
    durationSec: Math.round(durationMin * 60),
    avgWpm,
    label: durationMin < 0.5 ? '매우 짧음' :
           durationMin < 1   ? '짧음' :
           durationMin < 2   ? '적절' :
           durationMin < 3   ? '약간 김' : '너무 김',
  };
}

// ── Filler word analysis ─────────────────────────────────────────────────

function analyzeFillers(words) {
  const lowerText = words.join(' ').toLowerCase();
  const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z0-9가-힣]/g, ''));
  const found = {};

  for (const filler of FILLER_WORDS) {
    const fillerLower = filler.toLowerCase();
    let count = 0;

    // Multi-word fillers (e.g. "you know") — use substring search on full text
    if (fillerLower.includes(' ')) {
      const regex = new RegExp(escapeRegex(fillerLower), 'gi');
      const matches = lowerText.match(regex);
      count = matches ? matches.length : 0;
    } else {
      // Single-word: match against tokenised words for accuracy (works for Korean too)
      count = lowerWords.filter(w => w === fillerLower).length;
    }

    if (count > 0) found[filler] = count;
  }

  const totalFillers = Object.values(found).reduce((s, v) => s + v, 0);
  const ratio = words.length > 0 ? (totalFillers / words.length) * 100 : 0;

  return {
    total: totalFillers,
    ratio: parseFloat(ratio.toFixed(1)),
    breakdown: found,
    status: ratio < 2 ? 'good' : ratio < 5 ? 'warning' : 'bad',
    label: ratio < 2 ? '양호' : ratio < 5 ? '보통' : '개선 필요',
  };
}

// ── Pace analysis ─────────────────────────────────────────────────────────

function analyzePace(history) {
  const wpmData = history.map(h => h.wpm).filter(v => v > 0);
  if (!wpmData.length) return { avg: 0, status: 'no-data', label: '데이터 없음' };

  const avg = Math.round(wpmData.reduce((s, v) => s + v, 0) / wpmData.length);
  const stddev = Math.round(Math.sqrt(wpmData.reduce((s, v) => s + (v - avg) ** 2, 0) / wpmData.length));

  return {
    avg,
    stddev,
    min: Math.min(...wpmData),
    max: Math.max(...wpmData),
    status: avg < 80 ? 'slow' : avg < 100 ? 'slightly-slow' : avg <= 180 ? 'good' : 'fast',
    label: avg < 80 ? '너무 느림' : avg < 100 ? '약간 느림' : avg <= 180 ? '적절' : '너무 빠름',
  };
}

// ── Volume analysis ───────────────────────────────────────────────────────

function analyzeVolume(history) {
  const dbData = history.map(h => h.db).filter(v => v !== null && isFinite(v));
  if (!dbData.length) return { avg: null, status: 'no-data', label: '데이터 없음' };

  const avg = parseFloat((dbData.reduce((s, v) => s + v, 0) / dbData.length).toFixed(1));
  const stddev = parseFloat(Math.sqrt(dbData.reduce((s, v) => s + (v - avg) ** 2, 0) / dbData.length).toFixed(1));

  return {
    avg,
    stddev,
    status: avg < -40 ? 'quiet' : avg > -10 ? 'loud' : 'good',
    stability: stddev < 5 ? '안정적' : stddev < 10 ? '보통' : '불안정',
    label: avg < -40 ? '너무 조용함' : avg > -10 ? '너무 큼' : '양호',
  };
}

// ── STAR structure analysis ───────────────────────────────────────────────

function analyzeSTAR(text) {
  const lower = text.toLowerCase();
  const result = {};
  let found = 0;

  for (const [part, keywords] of Object.entries(STAR_PATTERNS)) {
    const hit = keywords.some(kw => lower.includes(kw.toLowerCase()));
    result[part] = hit;
    if (hit) found++;
  }

  return {
    parts: result,
    completeness: found,
    total: 4,
    percentage: Math.round((found / 4) * 100),
    status: found === 4 ? 'complete' : found >= 3 ? 'good' : found >= 2 ? 'partial' : 'weak',
    label: found === 4 ? '완전' : found >= 3 ? '양호' : found >= 2 ? '부분적' : '미흡',
  };
}

// ── Repeated word detection ───────────────────────────────────────────────

function findRepeatedWords(words) {
  const STOP = new Set([
    'i', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'was', 'were', 'is', 'are', 'it', 'that', 'this', 'of', 'for', 'with',
    '그', '이', '저', '을', '를', '이', '가', '은', '는', '에', '의', '도',
  ]);
  const freq = {};
  for (const w of words) {
    const lw = w.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
    if (lw.length > 2 && !STOP.has(lw)) freq[lw] = (freq[lw] ?? 0) + 1;
  }
  return Object.entries(freq)
    .filter(([, c]) => c >= 3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
}

// ── Suggestion builder ────────────────────────────────────────────────────

function buildSuggestions({ fillerWords, pace, volume, star, repeatedWords, summary }) {
  const tips = [];

  if (fillerWords.status !== 'good') {
    const top = Object.entries(fillerWords.breakdown).sort(([,a],[,b])=>b-a).slice(0,3);
    tips.push(`필러워드 "${top.map(([w])=>w).join('", "')}" 줄이기 (현재 ${fillerWords.ratio}%, 목표 2% 이하)`);
  }

  if (pace.status === 'fast') tips.push(`말하는 속도를 늦추세요 (평균 ${pace.avg} WPM → 목표 100~180 WPM)`);
  if (pace.status === 'slow' || pace.status === 'slightly-slow') tips.push(`좀 더 활기차게 말하세요 (평균 ${pace.avg} WPM → 목표 100~180 WPM)`);

  if (volume.status === 'quiet') tips.push('목소리를 더 크게 내세요 (면접관이 잘 들을 수 있도록)');
  if (volume.status === 'loud')  tips.push('목소리 볼륨을 약간 줄이세요');

  if (summary.label === '너무 김') tips.push('답변이 3분을 넘었습니다 — 핵심을 더 간결하게 정리하세요');
  if (summary.label === '매우 짧음') tips.push('답변이 너무 짧습니다 — STAR 구조로 더 구체적으로 설명하세요');

  const missedSTAR = Object.entries(star.parts).filter(([, v]) => !v).map(([k]) => k);
  if (missedSTAR.length > 0) tips.push(`STAR 구조에서 ${missedSTAR.join(', ')} 부분을 보완하세요`);

  if (repeatedWords.length > 0) {
    tips.push(`"${repeatedWords[0].word}" 같은 단어 반복 사용 줄이기 (${repeatedWords[0].count}회)`);
  }

  if (tips.length === 0) tips.push('전반적으로 훌륭한 답변입니다! 👍');

  return tips;
}

// ── Score calculator ──────────────────────────────────────────────────────

function calcScore({ fillerWords, pace, volume, star, summary }) {
  let score = 100;

  // Filler words (-20 max)
  score -= Math.min(20, fillerWords.ratio * 4);

  // Pace (-20 max)
  if (pace.status === 'fast' || pace.status === 'slow') score -= 20;
  else if (pace.status === 'slightly-slow') score -= 10;

  // Volume (-10 max)
  if (volume.status !== 'good' && volume.status !== 'no-data') score -= 10;

  // STAR (-30 max)
  score -= (4 - star.completeness) * 7.5;

  // Duration
  if (summary.label === '너무 김') score -= 10;
  if (summary.label === '매우 짧음') score -= 10;

  return Math.max(0, Math.round(score));
}

// ── Utilities ─────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { analyze };
