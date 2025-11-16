"""
models_info.py
----------------

Data classes and constants describing open‑source and proprietary models used in
the context‑window comparison.  Each model entry includes the parameter count
(where known), the maximum context window in tokens, a brief description of its
strengths, and a citation key referencing the source of this information.

These definitions are used by the visualisation routines to normalise token
usage and by the README to populate the model comparison table.
"""

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class ModelInfo:
    name: str
    parameters: str
    context: int
    strengths: str
    citation: str


def get_open_source_models() -> List[ModelInfo]:
    """Return a list of open‑source models (≤ 12 B parameters)."""
    return [
        ModelInfo(
            name="Mistral 7B Instruct",
            parameters="7 B",
            context=8_000,
            strengths="Strong reasoning and code generation; Apache 2.0 licensed",
            citation="420364458335633"
        ),
        ModelInfo(
            name="XGen 7B 8K",
            parameters="7 B",
            context=8_192,
            strengths="Efficient long‑sequence modelling",
            citation="911101338263397"
        ),
        ModelInfo(
            name="Llama 2 7B",
            parameters="7 B",
            context=4_096,
            strengths="Balanced general‑purpose performance",
            citation="755067816323875"
        ),
    ]


def get_proprietary_models() -> List[ModelInfo]:
    """Return a list of proprietary models and their context windows."""
    return [
        ModelInfo(
            name="GPT‑4 Turbo",
            parameters="\u2013",
            context=128_000,
            strengths="General‑purpose; high performance",
            citation="606191499054299"
        ),
        ModelInfo(
            name="GPT‑4.1",
            parameters="\u2013",
            context=1_000_000,
            strengths="Improved coding and instruction following",
            citation="135591285725828"
        ),
        ModelInfo(
            name="Claude 3 Sonnet",
            parameters="\u2013",
            context=200_000,
            strengths="Extended thinking with tool use",
            citation="73988196732927"
        ),
        ModelInfo(
            name="Claude 4.5 (beta)",
            parameters="\u2013",
            context=1_000_000,
            strengths="Beta mode; 1 M context for tier‑4 organisations",
            citation="73988196732927"
        ),
        ModelInfo(
            name="Gemini 2.5 Pro",
            parameters="\u2013",
            context=1_000_000,
            strengths="Native multimodality; improved reasoning",
            citation="264535844435865"
        ),
        ModelInfo(
            name="DeepSeek V3.2",
            parameters="\u2013",
            context=128_000,
            strengths="JSON output mode; cost‑effective pricing",
            citation="196653781099666"
        ),
        ModelInfo(
            name="Phi‑3 Medium",
            parameters="\u2013",
            context=128_000,
            strengths="Small but capable; available in 4 k and 128 k variants",
            citation="593591340691591"
        ),
        ModelInfo(
            name="Grok 4 Fast",
            parameters="\u2013",
            context=2_000_000,
            strengths="Function calling; structured outputs; reasoning",
            citation="2584474606170"
        ),
    ]