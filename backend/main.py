import os
import sys
from pathlib import Path

# Add backend directory and root directory to sys.path
_CURRENT_DIR = Path(__file__).resolve().parent
_ROOT_DIR = _CURRENT_DIR.parent

for p in [str(_CURRENT_DIR), str(_ROOT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

os.environ.setdefault("VERCEL", "1")

from backend.app.main import app
