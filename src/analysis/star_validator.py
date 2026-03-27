"""
STAR Method Validator - Phase 2 Cognitive Architecture.

Validates interview responses against the STAR framework
(Situation, Task, Action, Result) using Azure OpenAI.
"""

import os
import json
import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)

STAR_SYSTEM_PROMPT = """You are an expert interview coach that analyzes responses using the STAR framework.

Evaluate the given interview response and identify each STAR component:
- **Situation**: The context or background of the scenario
- **Task**: The specific challenge or responsibility
- **Action**: The concrete steps taken
- **Result**: The measurable outcome or impact

Respond in this exact JSON format:
{
    "situation": {"found": true/false, "text": "extracted text or empty", "feedback": "specific improvement suggestion"},
    "task": {"found": true/false, "text": "extracted text or empty", "feedback": "specific improvement suggestion"},
    "action": {"found": true/false, "text": "extracted text or empty", "feedback": "specific improvement suggestion"},
    "result": {"found": true/false, "text": "extracted text or empty", "feedback": "specific improvement suggestion"},
    "overall_score": 0-100,
    "summary": "brief tactical feedback on structure gaps"
}
"""


@dataclass
class STARComponent:
    """Individual STAR component evaluation."""
    found: bool
    text: str
    feedback: str


@dataclass
class STARResult:
    """Complete STAR validation result."""
    situation: STARComponent
    task: STARComponent
    action: STARComponent
    result: STARComponent
    overall_score: int
    summary: str

    @property
    def is_complete(self) -> bool:
        return all([self.situation.found, self.task.found, self.action.found, self.result.found])

    @property
    def missing_components(self) -> list[str]:
        missing = []
        if not self.situation.found:
            missing.append("Situation")
        if not self.task.found:
            missing.append("Task")
        if not self.action.found:
            missing.append("Action")
        if not self.result.found:
            missing.append("Result")
        return missing


class STARValidator:
    """Validates interview answers against the STAR framework using Azure OpenAI."""

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

    async def validate(self, response_text: str) -> STARResult:
        """Validate an interview response against the STAR framework."""
        client = self._get_client()

        completion = client.chat.completions.create(
            model=self.deployment,
            messages=[
                {"role": "system", "content": STAR_SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this interview response:\n\n{response_text}"},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        raw = json.loads(completion.choices[0].message.content)
        return self._parse_result(raw)

    def _parse_result(self, raw: dict) -> STARResult:
        """Parse raw API response into STARResult."""
        def parse_component(data: dict) -> STARComponent:
            return STARComponent(
                found=data.get("found", False),
                text=data.get("text", ""),
                feedback=data.get("feedback", ""),
            )

        return STARResult(
            situation=parse_component(raw.get("situation", {})),
            task=parse_component(raw.get("task", {})),
            action=parse_component(raw.get("action", {})),
            result=parse_component(raw.get("result", {})),
            overall_score=raw.get("overall_score", 0),
            summary=raw.get("summary", ""),
        )
