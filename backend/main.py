import os
import sys
import traceback
from pathlib import Path

# Add backend directory to sys.path
_CURRENT_DIR = Path(__file__).resolve().parent
if str(_CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(_CURRENT_DIR))

os.environ.setdefault("VERCEL", "1")

try:
    from app.main import app as _fastapi_app
except Exception as _import_err:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    _fastapi_app = FastAPI()
    _tb = traceback.format_exc()

    @_fastapi_app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def _import_error_route(full_path: str):
        return JSONResponse(
            status_code=500,
            content={"error": "FastAPIImportError", "detail": str(_import_err), "traceback": _tb}
        )

async def app(scope, receive, send):
    try:
        await _fastapi_app(scope, receive, send)
    except Exception as e:
        err_tb = traceback.format_exc()
        print(f"[CRITICAL_ASGI_ERROR] {err_tb}", file=sys.stderr, flush=True)
        from fastapi.responses import JSONResponse
        res = JSONResponse(
            status_code=500,
            content={"error": "ASGIInvocationCrash", "detail": str(e), "traceback": err_tb}
        )
        await res(scope, receive, send)
