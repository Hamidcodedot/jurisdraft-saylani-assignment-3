@echo off
echo [*] Stopping Pre-Legal services...
taskkill /F /IM uvicorn.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo [✓] All Pre-Legal processes stopped.
