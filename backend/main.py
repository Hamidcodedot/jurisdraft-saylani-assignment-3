import os
import sys
from pathlib import Path

# Add backend directory to sys.path
_CURRENT_DIR = Path(__file__).resolve().parent
if str(_CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(_CURRENT_DIR))

os.environ.setdefault("VERCEL", "1")

from app.main import app
