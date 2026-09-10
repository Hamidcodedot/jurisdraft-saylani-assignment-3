#!/usr/bin/env bash
# ==========================================================
# JurisDraft SaaS — macOS / Linux Startup Script
# As referenced in SMIT Class 10.4
# ==========================================================

set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=========================================================="
echo "  JURISDRAFT — ENTERPRISE CONTRACT REPOSITORY & STUDIO"
echo "  Saylani Mass IT Training (SMIT) • Classes 9 & 10"
echo "=========================================================="
echo ""

# Check Docker option
if [ "$1" == "--docker" ]; then
    echo "[*] Launching via Docker Compose..."
    docker compose up --build
    exit 0
fi

# Native execution
if [ ! -d "backend/venv" ]; then
    echo "[*] Setting up Python virtual environment..."
    python3 -m venv backend/venv
    backend/venv/bin/pip install -r backend/requirements.txt
fi

echo "[*] Starting FastAPI Backend on http://localhost:8000..."
export PYTHONPATH="$ROOT_DIR"
backend/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "[*] Starting Next.js Frontend on http://localhost:3000..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

trap "kill $BACKEND_PID" EXIT
npm run dev
