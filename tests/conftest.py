"""
Pytest configuration for the test suite.

This file ensures that the project root is added to the Python path
so that imports from the `src` package work correctly.
"""

import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

