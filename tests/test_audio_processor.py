"""Tests for the AudioProcessor service."""

import numpy as np
import pytest

from src.audio.processor import AudioProcessor, ThresholdConfig, AudioMetrics


@pytest.fixture
def processor():
    return AudioProcessor(sample_rate=16000)


class TestCalculateDb:
    def test_silence_returns_zero(self, processor):
        silence = np.zeros(1024, dtype=np.int16)
        assert processor.calculate_db(silence) == 0.0

    def test_empty_array_returns_zero(self, processor):
        assert processor.calculate_db(np.array([], dtype=np.int16)) == 0.0

    def test_loud_signal_returns_high_db(self, processor):
        loud = np.full(1024, 30000, dtype=np.int16)
        db = processor.calculate_db(loud)
        assert db > 80

    def test_quiet_signal_returns_low_db(self, processor):
        quiet = np.full(1024, 100, dtype=np.int16)
        db = processor.calculate_db(quiet)
        assert db < 50

    def test_db_within_valid_range(self, processor):
        random_audio = np.random.randint(-5000, 5000, 1024, dtype=np.int16)
        db = processor.calculate_db(random_audio)
        assert 0.0 <= db <= 96.0


class TestCalculateWpm:
    def test_zero_duration(self, processor):
        assert processor.calculate_wpm(10, 0) == 0.0

    def test_negative_duration(self, processor):
        assert processor.calculate_wpm(10, -1) == 0.0

    def test_normal_speech(self, processor):
        # 30 words in 12 seconds = 150 WPM
        wpm = processor.calculate_wpm(30, 12)
        assert wpm == 150.0

    def test_fast_speech(self, processor):
        # 50 words in 12 seconds = 250 WPM
        wpm = processor.calculate_wpm(50, 12)
        assert wpm > 200


class TestCheckAlerts:
    def test_no_alerts_in_optimal_range(self, processor):
        metrics = AudioMetrics(db_level=60, wpm=150, is_speaking=True)
        alerts = processor.check_alerts(metrics)
        assert len(alerts) == 0

    def test_too_quiet_alert(self, processor):
        metrics = AudioMetrics(db_level=40, wpm=150, is_speaking=True)
        alerts = processor.check_alerts(metrics)
        assert len(alerts) == 1
        assert alerts[0].alert_type == "too_quiet"

    def test_too_loud_alert(self, processor):
        metrics = AudioMetrics(db_level=80, wpm=150, is_speaking=True)
        alerts = processor.check_alerts(metrics)
        assert len(alerts) == 1
        assert alerts[0].alert_type == "too_loud"

    def test_too_fast_alert(self, processor):
        metrics = AudioMetrics(db_level=60, wpm=200, is_speaking=True)
        alerts = processor.check_alerts(metrics)
        assert len(alerts) == 1
        assert alerts[0].alert_type == "too_fast"

    def test_too_slow_alert(self, processor):
        metrics = AudioMetrics(db_level=60, wpm=100, is_speaking=True)
        alerts = processor.check_alerts(metrics)
        assert len(alerts) == 1
        assert alerts[0].alert_type == "too_slow"

    def test_no_alerts_when_not_speaking(self, processor):
        metrics = AudioMetrics(db_level=30, wpm=0, is_speaking=False)
        alerts = processor.check_alerts(metrics)
        assert len(alerts) == 0

    def test_multiple_alerts(self, processor):
        metrics = AudioMetrics(db_level=40, wpm=200, is_speaking=True)
        alerts = processor.check_alerts(metrics)
        assert len(alerts) == 2
        types = {a.alert_type for a in alerts}
        assert types == {"too_quiet", "too_fast"}


class TestProcessChunk:
    def test_process_returns_metrics_and_alerts(self, processor):
        audio = np.random.randint(-5000, 5000, 1024, dtype=np.int16)
        metrics, alerts = processor.process_chunk(audio)
        assert isinstance(metrics, AudioMetrics)
        assert isinstance(alerts, list)

    def test_history_limited_to_max(self, processor):
        audio = np.random.randint(-5000, 5000, 1024, dtype=np.int16)
        for _ in range(60):
            processor.process_chunk(audio)
        assert len(processor.history) == 50

    def test_custom_thresholds(self):
        config = ThresholdConfig(db_min=40, db_max=80, wpm_min=100, wpm_max=200)
        processor = AudioProcessor(thresholds=config)
        metrics = AudioMetrics(db_level=45, wpm=150, is_speaking=True)
        alerts = processor.check_alerts(metrics)
        assert len(alerts) == 0  # 45 dB is within custom 40-80 range
