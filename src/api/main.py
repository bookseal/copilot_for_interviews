"""
Signal Copilot - FastAPI Backend.

WebSocket-based real-time audio processing API with REST endpoints
for STAR validation and sentiment analysis.
"""

import asyncio
import json
import logging
import time
import os
import numpy as np
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from src.audio.processor import AudioProcessor, ThresholdConfig
from src.analysis.star_validator import STARValidator
from src.analysis.sentiment import SentimentAnalyzer

logging.basicConfig(level=os.getenv("LOG_LEVEL", "info").upper())
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Signal Copilot for Interviews",
    description="AI-augmented communication optimizer for technical interviews",
    version="1.0.0",
)

# Mount frontend static files
frontend_path = Path(__file__).parent.parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

# Service instances
star_validator = STARValidator()
sentiment_analyzer = SentimentAnalyzer()


# --- Pydantic Models ---

class STARRequest(BaseModel):
    text: str

class SentimentRequest(BaseModel):
    text: str
    target_culture: str | None = None

class ThresholdUpdate(BaseModel):
    db_min: float | None = None
    db_max: float | None = None
    wpm_min: float | None = None
    wpm_max: float | None = None


# --- REST Endpoints ---

@app.get("/")
async def root():
    """Serve the frontend dashboard."""
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Signal Copilot API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "signal-copilot"}


@app.post("/api/star/validate")
async def validate_star(request: STARRequest):
    """Validate an interview response against the STAR framework."""
    try:
        result = await star_validator.validate(request.text)
        return {
            "is_complete": result.is_complete,
            "missing_components": result.missing_components,
            "overall_score": result.overall_score,
            "summary": result.summary,
            "components": {
                "situation": {"found": result.situation.found, "text": result.situation.text, "feedback": result.situation.feedback},
                "task": {"found": result.task.found, "text": result.task.text, "feedback": result.task.feedback},
                "action": {"found": result.action.found, "text": result.action.text, "feedback": result.action.feedback},
                "result": {"found": result.result.found, "text": result.result.text, "feedback": result.result.feedback},
            },
        }
    except ImportError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"STAR validation failed: {e}")
        raise HTTPException(status_code=500, detail="STAR validation failed")


@app.post("/api/sentiment/analyze")
async def analyze_sentiment(request: SentimentRequest):
    """Analyze tone and sentiment of an interview response."""
    try:
        result = await sentiment_analyzer.analyze(request.text, request.target_culture)
        return {
            "tone": result.tone,
            "confidence_level": result.confidence_level,
            "clarity_score": result.clarity_score,
            "tone_markers": result.tone_markers,
            "recommendation": result.recommendation,
            "scores": {
                "aggressive": result.aggressive_score,
                "collaborative": result.collaborative_score,
                "neutral": result.neutral_score,
            },
        }
    except ImportError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Sentiment analysis failed")


# --- WebSocket: Real-time Audio Stream ---

class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.processors: dict[str, AudioProcessor] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.processors[client_id] = AudioProcessor()
        logger.info(f"Client {client_id} connected")

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)
        self.processors.pop(client_id, None)
        logger.info(f"Client {client_id} disconnected")

    async def send_metrics(self, client_id: str, data: dict):
        ws = self.active_connections.get(client_id)
        if ws:
            await ws.send_json(data)


manager = ConnectionManager()


@app.websocket("/ws/audio/{client_id}")
async def audio_stream(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time audio streaming.

    Client sends binary audio data (PCM 16-bit, 16kHz, mono).
    Server responds with JSON metrics and alerts.
    """
    await manager.connect(websocket, client_id)
    processor = manager.processors[client_id]

    try:
        while True:
            data = await websocket.receive()

            if "bytes" in data:
                # Binary audio data
                audio_bytes = data["bytes"]
                audio_chunk = np.frombuffer(audio_bytes, dtype=np.int16)
                metrics, alerts = processor.process_chunk(audio_chunk)

                response = {
                    "type": "metrics",
                    "db_level": round(metrics.db_level, 1),
                    "wpm": round(metrics.wpm, 0),
                    "is_speaking": metrics.is_speaking,
                    "timestamp": metrics.timestamp,
                    "alerts": [
                        {"type": a.alert_type, "message": a.message}
                        for a in alerts
                    ],
                }
                await manager.send_metrics(client_id, response)

            elif "text" in data:
                # Text message (transcript from client-side STT or control)
                msg = json.loads(data["text"])
                if msg.get("type") == "transcript":
                    transcript = msg.get("text", "")
                    wpm = processor.update_wpm_from_transcript(transcript, time.time())
                    await manager.send_metrics(client_id, {
                        "type": "wpm_update",
                        "wpm": round(wpm, 0),
                        "transcript": transcript,
                    })
                elif msg.get("type") == "threshold_update":
                    processor.thresholds = ThresholdConfig(
                        db_min=msg.get("db_min", processor.thresholds.db_min),
                        db_max=msg.get("db_max", processor.thresholds.db_max),
                        wpm_min=msg.get("wpm_min", processor.thresholds.wpm_min),
                        wpm_max=msg.get("wpm_max", processor.thresholds.wpm_max),
                    )

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for {client_id}: {e}")
        manager.disconnect(client_id)
