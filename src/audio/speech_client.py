"""
Azure AI Speech Service Client.

Handles real-time speech-to-text using Azure AI Speech Services
for sub-second audio signal processing.
"""

import os
import asyncio
import logging
from typing import AsyncGenerator, Callable, Optional

logger = logging.getLogger(__name__)


class AzureSpeechClient:
    """Wrapper for Azure AI Speech SDK for real-time transcription."""

    def __init__(
        self,
        speech_key: Optional[str] = None,
        speech_region: Optional[str] = None,
    ):
        self.speech_key = speech_key or os.getenv("AZURE_SPEECH_KEY", "")
        self.speech_region = speech_region or os.getenv("AZURE_SPEECH_REGION", "koreacentral")
        self._recognizer = None

    def _ensure_sdk(self):
        """Lazy import Azure Speech SDK - only required when actually connecting."""
        try:
            import azure.cognitiveservices.speech as speechsdk
            return speechsdk
        except ImportError:
            raise ImportError(
                "azure-cognitiveservices-speech is required. "
                "Install with: pip install azure-cognitiveservices-speech"
            )

    def create_recognizer(self, audio_stream=None):
        """Create a speech recognizer with push stream or default mic input."""
        speechsdk = self._ensure_sdk()

        speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key,
            region=self.speech_region,
        )
        speech_config.speech_recognition_language = "en-US"
        speech_config.set_property(
            speechsdk.PropertyId.SpeechServiceResponse_RequestSentiment, "true"
        )

        if audio_stream:
            audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)
        else:
            audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)

        self._recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config,
        )
        return self._recognizer

    def create_push_stream(self):
        """Create a push audio stream for feeding raw audio data."""
        speechsdk = self._ensure_sdk()
        audio_format = speechsdk.audio.AudioStreamFormat(
            samples_per_second=16000,
            bits_per_sample=16,
            channels=1,
        )
        return speechsdk.audio.PushAudioInputStream(stream_format=audio_format)

    async def start_continuous_recognition(
        self,
        on_recognized: Callable[[str], None],
        on_recognizing: Optional[Callable[[str], None]] = None,
    ):
        """Start continuous speech recognition with callbacks."""
        if not self._recognizer:
            raise RuntimeError("Call create_recognizer() first")

        def recognized_cb(evt):
            if evt.result.text:
                on_recognized(evt.result.text)

        def recognizing_cb(evt):
            if on_recognizing and evt.result.text:
                on_recognizing(evt.result.text)

        self._recognizer.recognized.connect(recognized_cb)
        if on_recognizing:
            self._recognizer.recognizing.connect(recognizing_cb)

        self._recognizer.start_continuous_recognition()
        logger.info("Started continuous speech recognition")

    async def stop_recognition(self):
        """Stop continuous recognition."""
        if self._recognizer:
            self._recognizer.stop_continuous_recognition()
            logger.info("Stopped speech recognition")
