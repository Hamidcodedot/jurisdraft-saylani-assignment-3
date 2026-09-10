#!/usr/bin/env bash
echo "[*] Stopping Pre-Legal processes..."
pkill -f "uvicorn backend.app.main:app" || true
pkill -f "next dev" || true
docker compose down 2>/dev/null || true
echo "[✓] Stopped."
