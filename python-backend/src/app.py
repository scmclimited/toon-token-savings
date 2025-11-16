"""
app.py
-------

Command‑line interface for demonstrating token savings.  This script loads a
dataset, encodes it as JSON and TOON, counts tokens, prints the results, and
generates charts.  It also supports normalising the counts relative to a list
of models specified by name.  Charts and reports are written to an output
directory.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import List

from .dataset import load_data
from .token_counter import compare_formats
from .visualization import plot_bar, plot_delta, plot_radar, plot_spiral
from .models_info import get_open_source_models, get_proprietary_models, ModelInfo


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="TOON token savings demonstration")
    parser.add_argument("--data", required=True, help="Path to input JSON file")
    parser.add_argument("--output", default="reports", help="Directory for output files")
    parser.add_argument(
        "--models", default="open-source,proprietary",
        help="Comma‑separated list of model categories to include in radar chart (open-source, proprietary, all)"
    )
    parser.add_argument("--no-plots", action="store_true", help="Do not generate charts")
    return parser.parse_args()


def collect_models(selection: str) -> List[ModelInfo]:
    selection = selection.strip().lower()
    models: List[ModelInfo] = []
    if selection in ("open-source", "open", "all"):
        models += get_open_source_models()
    if selection in ("proprietary", "closed", "all"):
        models += get_proprietary_models()
    # deduplicate by name
    seen = set()
    unique = []
    for m in models:
        if m.name not in seen:
            unique.append(m)
            seen.add(m.name)
    return unique


def main() -> None:
    args = parse_args()
    data_path = Path(args.data)
    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    data = load_data(data_path)
    result = compare_formats(data)

    print("Token counts:")
    print(f"  JSON tokens: {result['json_tokens']:.0f}")
    print(f"  TOON tokens: {result['toon_tokens']:.0f}")
    print(f"  Savings:    {result['savings']:.2f}%")

    if not args.no_plots:
        # Bar chart
        bar_path = out_dir / "bar_chart.png"
        plot_bar(result, str(bar_path))
        # Delta chart
        delta_path = out_dir / "delta_chart.png"
        plot_delta(result, str(delta_path))
        # Radar chart
        models = collect_models(args.models)
        radar_path = out_dir / "radar_chart.png"
        plot_radar(result, models, str(radar_path))
        # Spiral chart
        spiral_path = out_dir / "spiral_chart.png"
        plot_spiral(result, str(spiral_path))
        print(f"Charts saved to {out_dir.resolve()}")
    else:
        print("Plots skipped (--no-plots)")


if __name__ == "__main__":
    main()