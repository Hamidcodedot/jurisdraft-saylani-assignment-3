# ==========================================================
# Pre-Legal SaaS — Windows Startup Script (PowerShell)
# ==========================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  JURISDRAFT — ENTERPRISE CONTRACT REPOSITORY & STUDIO" -ForegroundColor Cyan
Write-Host "  Saylani Mass IT Training (SMIT) • Classes 9 & 10" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT

# 1. Check Python Venv
$VENV_PYTHON = Join-Path $ROOT "backend\venv\Scripts\python.exe"
if (-not (Test-Path $VENV_PYTHON)) {
    Write-Host "[*] Creating Python virtual environment..." -ForegroundColor Yellow
    py -m venv backend\venv
    & "$ROOT\backend\venv\Scripts\pip.exe" install -r "$ROOT\backend\requirements.txt"
}

# 2. Start Backend in Background
Write-Host "[*] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$env:PYTHONPATH = $ROOT
$backendJob = Start-Job -ScriptBlock {
    param($rootPath)
    Set-Location $rootPath
    $env:PYTHONPATH = $rootPath
    & "$rootPath\backend\venv\Scripts\uvicorn.exe" backend.app.main:app --host 127.0.0.1 --port 8000
} -ArgumentList $ROOT

Start-Sleep -Seconds 3

# 3. Check Frontend
Write-Host "[*] Launching Next.js Frontend Studio on http://localhost:3000..." -ForegroundColor Green
Set-Location "$ROOT\frontend"
if (-not (Test-Path "$ROOT\frontend\node_modules")) {
    Write-Host "[*] Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "[✓] JurisDraft SaaS is running!" -ForegroundColor Cyan
Write-Host "    • Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "    • Backend API & Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "    • Health Status: http://localhost:8000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop services." -ForegroundColor Yellow
Write-Host ""

# Start Next.js dev server
npm run dev
