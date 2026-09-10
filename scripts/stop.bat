@echo off
echo [*] Stopping JurisDraft services...
taskkill /F /IM uvicorn.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo [✓] All JurisDraft processes stopped.
