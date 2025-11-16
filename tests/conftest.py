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

# Ensure the python-backend directory is on the path so that the `src`
# package (located under python-backend/src) can be imported.
backend_dir = project_root / "python-backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

