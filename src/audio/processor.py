"""
Audio Processing Service - Real-time dB and WPM measurement.

Handles raw audio stream analysis for volume (dB) and speech rate (WPM).
Integrates with Azure AI Speech for speech-to-text transcription.
"""

import numpy as np
import time
import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AudioMetrics:
    """Real-time audio signal metrics."""
    db_level: float = 0.0
    wpm: float = 0.0
    timestamp: float = 0.0
    is_speaking: bool = False
    transcript: str = ""


@dataclass
class ThresholdConfig:
    """Configurable alert thresholds."""
    db_min: float = float(os.getenv("DB_MIN_THRESHOLD", "50"))
    db_max: float = float(os.getenv("DB_MAX_THRESHOLD", "75"))
    wpm_min: float = float(os.getenv("WPM_MIN_THRESHOLD", "130"))
    wpm_max: float = float(os.getenv("WPM_MAX_THRESHOLD", "180"))


@dataclass
class SignalAlert:
    """Alert generated when metrics exceed thresholds."""
    alert_type: str  # "too_quiet", "too_loud", "too_fast", "too_slow"
    metric_name: str  # "db" or "wpm"
    current_value: float
    threshold_value: float
    message: str


class AudioProcessor:
    """Processes raw audio data for dB level and WPM calculation."""

    def __init__(self, sample_rate: int = 16000, thresholds: Optional[ThresholdConfig] = None):
        self.sample_rate = sample_rate
        self.thresholds = thresholds or ThresholdConfig()
        self._word_timestamps: list[float] = []
        self._history: list[AudioMetrics] = []
        self._max_history = 50

    def calculate_db(self, audio_chunk: np.ndarray) -> float:
        """Calculate dB level from raw audio samples (PCM 16-bit)."""
        if len(audio_chunk) == 0:
            return 0.0

        audio_float = audio_chunk.astype(np.float64)
        rms = np.sqrt(np.mean(audio_float ** 2))

        if rms == 0:
            return 0.0

        # Convert RMS to dB (reference: max 16-bit value)
        db = 20 * np.log10(rms / 32768.0) + 96  # Normalize to ~0-96 dB range
        return max(0.0, min(96.0, db))

    def calculate_wpm(self, word_count: int, duration_seconds: float) -> float:
        """Calculate words per minute from transcription results."""
        if duration_seconds <= 0:
            return 0.0
        return (word_count / duration_seconds) * 60.0

    def update_wpm_from_transcript(self, transcript: str, timestamp: float) -> float:
        """Update WPM calculation based on new transcript words."""
        words = transcript.strip().split()
        if not words:
            return 0.0

        self._word_timestamps.append(timestamp)

        # Use a sliding window of last 15 seconds for WPM
        window_start = timestamp - 15.0
        self._word_timestamps = [t for t in self._word_timestamps if t >= window_start]

        if len(self._word_timestamps) < 2:
            return 0.0

        duration = self._word_timestamps[-1] - self._word_timestamps[0]
        return self.calculate_wpm(len(self._word_timestamps), duration)

    def check_alerts(self, metrics: AudioMetrics) -> list[SignalAlert]:
        """Check if current metrics trigger any alerts."""
        alerts = []

        if metrics.is_speaking:
            if metrics.db_level < self.thresholds.db_min:
                alerts.append(SignalAlert(
                    alert_type="too_quiet",
                    metric_name="db",
                    current_value=metrics.db_level,
                    threshold_value=self.thresholds.db_min,
                    message=f"Speaking too quietly ({metrics.db_level:.1f} dB < {self.thresholds.db_min} dB)"
                ))
            elif metrics.db_level > self.thresholds.db_max:
                alerts.append(SignalAlert(
                    alert_type="too_loud",
                    metric_name="db",
                    current_value=metrics.db_level,
                    threshold_value=self.thresholds.db_max,
                    message=f"Speaking too loudly ({metrics.db_level:.1f} dB > {self.thresholds.db_max} dB)"
                ))

            if metrics.wpm > self.thresholds.wpm_max:
                alerts.append(SignalAlert(
                    alert_type="too_fast",
                    metric_name="wpm",
                    current_value=metrics.wpm,
                    threshold_value=self.thresholds.wpm_max,
                    message=f"Speaking too fast ({metrics.wpm:.0f} WPM > {self.thresholds.wpm_max} WPM)"
                ))
            elif metrics.wpm > 0 and metrics.wpm < self.thresholds.wpm_min:
                alerts.append(SignalAlert(
                    alert_type="too_slow",
                    metric_name="wpm",
                    current_value=metrics.wpm,
                    threshold_value=self.thresholds.wpm_min,
                    message=f"Speaking too slowly ({metrics.wpm:.0f} WPM < {self.thresholds.wpm_min} WPM)"
                ))

        return alerts

    def process_chunk(self, audio_chunk: np.ndarray, transcript: str = "", timestamp: Optional[float] = None) -> tuple[AudioMetrics, list[SignalAlert]]:
        """Process an audio chunk and return metrics with any alerts."""
        ts = timestamp or time.time()
        db_level = self.calculate_db(audio_chunk)
        is_speaking = db_level > 30  # Voice activity detection threshold

        wpm = 0.0
        if transcript:
            wpm = self.update_wpm_from_transcript(transcript, ts)

        metrics = AudioMetrics(
            db_level=db_level,
            wpm=wpm,
            timestamp=ts,
            is_speaking=is_speaking,
            transcript=transcript,
        )

        self._history.append(metrics)
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history:]

        alerts = self.check_alerts(metrics)
        return metrics, alerts

    @property
    def history(self) -> list[AudioMetrics]:
        return list(self._history)
