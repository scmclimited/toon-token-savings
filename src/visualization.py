"""
visualization.py
-----------------

Functions for producing charts illustrating token usage.  This module uses
Matplotlib for static image generation.  All plotting functions accept a
Matplotlib `Axes` object so that plots can be composed externally if desired.

Each function saves the resulting figure to the specified file path.  The
returned figure and axes are also returned for further customisation or
embedding in notebooks.
"""

from __future__ import annotations

import math
from typing import Dict, List, Tuple

import matplotlib.pyplot as plt
import numpy as np

from .models_info import ModelInfo
from .token_counter import normalise_usage


def plot_bar(result: Dict[str, float], output_path: str) -> Tuple[plt.Figure, plt.Axes]:
    """Plot a simple bar chart comparing JSON vs TOON token counts.

    Parameters
    ----------
    result : dict
        Dictionary with keys `json_tokens` and `toon_tokens`.
    output_path : str
        File path to save the resulting PNG.
    """
    labels = ['JSON', 'TOON']
    values = [result['json_tokens'], result['toon_tokens']]

    fig, ax = plt.subplots(figsize=(6, 4))
    bars = ax.bar(labels, values, color=['tab:blue', 'tab:green'])
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f"{height:.0f}", xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom')
    ax.set_ylabel('Tokens')
    ax.set_title('Token Count Comparison')
    fig.tight_layout()
    fig.savefig(output_path)
    return fig, ax


def plot_delta(result: Dict[str, float], output_path: str) -> Tuple[plt.Figure, plt.Axes]:
    """Plot a line chart showing the delta (JSON − TOON).

    This chart is trivial for a single dataset but is included for API
    consistency.  When comparing multiple datasets, extend this function to
    accept a list of results.
    """
    delta = result['json_tokens'] - result['toon_tokens']
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot([0, 1], [result['json_tokens'], result['toon_tokens']], marker='o')
    ax.set_xticks([0, 1])
    ax.set_xticklabels(['JSON', 'TOON'])
    ax.set_ylabel('Tokens')
    ax.set_title(f'Delta: JSON − TOON = {delta:.0f} tokens ({result["savings"]:.1f}% saved)')
    fig.tight_layout()
    fig.savefig(output_path)
    return fig, ax


def plot_radar(result: Dict[str, float], models: List[ModelInfo], output_path: str) -> Tuple[plt.Figure, plt.Axes]:
    """Plot a radar chart showing normalised context usage for each model.

    Parameters
    ----------
    result : dict
        Dictionary with keys `json_tokens` and `toon_tokens`.
    models : list of ModelInfo
        Models whose context windows will be represented as axes.
    output_path : str
        File path to save the resulting PNG.
    """
    labels = [m.name for m in models]
    num_vars = len(labels)

    # Normalised values for JSON and TOON per model
    values_json = [normalise_usage(result['json_tokens'], m.context) for m in models]
    values_toon = [normalise_usage(result['toon_tokens'], m.context) for m in models]
    # close the polygons
    values_json += values_json[:1]
    values_toon += values_toon[:1]

    angles = [n / float(num_vars) * 2 * math.pi for n in range(num_vars)]
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(8, 6), subplot_kw=dict(polar=True))
    ax.set_theta_offset(math.pi / 2)
    ax.set_theta_direction(-1)

    plt.xticks(angles[:-1], labels, fontsize=8)
    ax.set_rlabel_position(0)
    ax.set_yticks([0.25, 0.5, 0.75, 1.0])
    ax.set_yticklabels(['25%', '50%', '75%', '100%'])
    ax.set_ylim(0, 1)

    ax.plot(angles, values_json, linewidth=2, linestyle='solid', label='JSON')
    ax.fill(angles, values_json, alpha=0.1)
    ax.plot(angles, values_toon, linewidth=2, linestyle='dashed', label='TOON')
    ax.fill(angles, values_toon, alpha=0.1)

    ax.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1))
    ax.set_title('Context Usage Normalised to Model Limits', y=1.08)
    fig.savefig(output_path)
    return fig, ax


def plot_spiral(result: Dict[str, float], output_path: str) -> Tuple[plt.Figure, plt.Axes]:
    """Plot a spiral chart mapping token counts onto a spiral curve.

    The radius increases with the square root of the token count, providing a
    visual sense of magnitude while emphasising differences.

    Parameters
    ----------
    result : dict
        Dictionary with keys `json_tokens` and `toon_tokens`.
    output_path : str
        File path to save the resulting PNG.
    """
    json_tokens = result['json_tokens']
    toon_tokens = result['toon_tokens']
    max_tokens = max(json_tokens, toon_tokens)

    # create angle range
    angles = np.linspace(0, 4 * np.pi, 500)
    # map tokens to radii
    r_json = np.sqrt(json_tokens / max_tokens) * angles / angles.max()
    r_toon = np.sqrt(toon_tokens / max_tokens) * angles / angles.max()

    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
    ax.plot(angles, r_json, label='JSON', color='tab:blue')
    ax.plot(angles, r_toon, label='TOON', color='tab:green')
    ax.set_title('Spiral Representation of Token Counts')
    ax.legend(loc='upper right')
    fig.savefig(output_path)
    return fig, ax