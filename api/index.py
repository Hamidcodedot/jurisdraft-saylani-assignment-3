import os
import sys
from pathlib import Path

# Ensure project root and backend folder are in Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

for p in [str(ROOT_DIR), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Set serverless environment indicator
os.environ.setdefault("VERCEL", "1")

# Import the FastAPI application instance
from backend.app.main import app
