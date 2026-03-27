"""
Sentiment & Tone Analyzer - Phase 2 Cognitive Architecture.

Analyzes interview response tone and maps it to company culture categories:
Aggressive, Collaborative, or Neutral.
"""

import os
import json
import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)

SENTIMENT_SYSTEM_PROMPT = """You are an expert communication analyst specializing in professional interview settings.

Analyze the given text for communication tone and sentiment. Categorize the overall tone as one of:
- **Aggressive**: Direct, assertive, competitive language. Uses "I achieved", "I drove", "I led the charge".
- **Collaborative**: Team-oriented, inclusive language. Uses "we built", "our team", "together we".
- **Neutral**: Balanced, professional, factual tone. Uses measured language without strong emotional markers.

Also assess:
- Confidence level (low/medium/high)
- Clarity score (0-100)
- Specific word choices that drive the classification

Respond in this exact JSON format:
{
    "tone": "aggressive" | "collaborative" | "neutral",
    "confidence_level": "low" | "medium" | "high",
    "clarity_score": 0-100,
    "tone_markers": ["list of specific phrases that indicate the tone"],
    "recommendation": "brief suggestion for tone adjustment based on target culture",
    "detail": {
        "aggressive_score": 0.0-1.0,
        "collaborative_score": 0.0-1.0,
        "neutral_score": 0.0-1.0
    }
}
"""


@dataclass
class SentimentResult:
    """Sentiment analysis result."""
    tone: str  # "aggressive", "collaborative", "neutral"
    confidence_level: str  # "low", "medium", "high"
    clarity_score: int
    tone_markers: list[str]
    recommendation: str
    aggressive_score: float
    collaborative_score: float
    neutral_score: float


class SentimentAnalyzer:
    """Analyzes communication tone for cultural fit using Azure OpenAI."""

    def __init__(
        self,
        endpoint: Optional[str] = None,
        api_key: Optional[str] = None,
        deployment: Optional[str] = None,
    ):
        self.endpoint = endpoint or os.getenv("AZURE_OPENAI_ENDPOINT", "")
        self.api_key = api_key or os.getenv("AZURE_OPENAI_API_KEY", "")
        self.deployment = deployment or os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

    def _get_client(self):
        """Lazy import and create OpenAI client."""
        try:
            from openai import AzureOpenAI
        except ImportError:
            raise ImportError("openai is required. Install with: pip install openai")

        return AzureOpenAI(
            azure_endpoint=self.endpoint,
            api_key=self.api_key,
            api_version="2024-06-01",
        )

    async def analyze(self, text: str, target_culture: Optional[str] = None) -> SentimentResult:
        """Analyze the sentiment/tone of an interview response."""
        client = self._get_client()

        user_prompt = f"Analyze this interview response:\n\n{text}"
        if target_culture:
            user_prompt += f"\n\nTarget company culture preference: {target_culture}"

        completion = client.chat.completions.create(
            model=self.deployment,
            messages=[
                {"role": "system", "content": SENTIMENT_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        raw = json.loads(completion.choices[0].message.content)
        return self._parse_result(raw)

    def _parse_result(self, raw: dict) -> SentimentResult:
        """Parse raw API response into SentimentResult."""
        detail = raw.get("detail", {})
        return SentimentResult(
            tone=raw.get("tone", "neutral"),
            confidence_level=raw.get("confidence_level", "medium"),
            clarity_score=raw.get("clarity_score", 0),
            tone_markers=raw.get("tone_markers", []),
            recommendation=raw.get("recommendation", ""),
            aggressive_score=detail.get("aggressive_score", 0.0),
            collaborative_score=detail.get("collaborative_score", 0.0),
            neutral_score=detail.get("neutral_score", 0.0),
        )
