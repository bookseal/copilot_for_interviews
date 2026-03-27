'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const sessionsRouter = require('./api/sessions');
const metricsRouter = require('./api/metrics');
const { sessionManager } = require('./engines/sessionManager');

const PORT = process.env.PORT ?? 3000;
const MOCK_MODE = process.env.MOCK_MODE !== 'false'; // default true

const app = express();
app.use(cors());
app.use(express.json());

// Serve dashboard static files
app.use(express.static(path.join(__dirname, 'dashboard')));

// ── REST routes ─────────────────────────────────────────────────────────
app.use('/api/sessions', sessionsRouter);
app.use('/api/metrics', metricsRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mockMode: MOCK_MODE,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── WebSocket: real-time telemetry push ─────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    ws.close(1008, 'sessionId query param required');
    return;
  }

  // Ensure session exists
  sessionManager.create(sessionId);
  console.log(`[WS] client connected → session: ${sessionId}`);

  // Push a tick every 500ms in mock mode
  const ticker = setInterval(() => {
    if (ws.readyState !== ws.OPEN) return clearInterval(ticker);

    const snapshot = MOCK_MODE
      ? sessionManager.simulateTick(sessionId)
      : sessionManager.get(sessionId)?.snapshot ?? {};

    ws.send(JSON.stringify({ type: 'TELEMETRY', sessionId, snapshot }));
  }, 500);

  // Client can push transcript chunks over WS too
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'TRANSCRIPT' && msg.text) {
        const snapshot = sessionManager.ingestTranscript(sessionId, msg.text);
        ws.send(JSON.stringify({ type: 'TELEMETRY', sessionId, snapshot }));
      }
    } catch { /* ignore malformed messages */ }
  });

  ws.on('close', () => {
    clearInterval(ticker);
    console.log(`[WS] client disconnected → session: ${sessionId}`);
  });
});

// ── Start ────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🎙️  copilot_for_interviews – Phase 1 (Audio Telemetry)`);
  console.log(`   Server  : http://localhost:${PORT}`);
  console.log(`   Dashboard: http://localhost:${PORT}/index.html`);
  console.log(`   WS      : ws://localhost:${PORT}/ws?sessionId=<id>`);
  console.log(`   Mode    : ${MOCK_MODE ? '🔵 MOCK (no Azure needed)' : '🟢 LIVE (Azure Speech)'}\n`);
});

module.exports = { app, server }; // for tests
