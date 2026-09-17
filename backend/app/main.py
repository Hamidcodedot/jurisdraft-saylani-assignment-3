import os
import sys
import shutil
from contextlib import asynccontextmanager
from pathlib import Path

# Add backend directory to sys.path
_CURRENT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _CURRENT_DIR.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import settings, IS_SERVERLESS, BACKEND_DIR
from app.db.session import init_db
from app.api.v1.routers import auth, templates, chat, documents
from app.services.template_service import template_service

import traceback

@asynccontextmanager
async def lifespan(app: FastAPI):
    # If running in serverless environment, pre-seed /tmp/prelegal.db from packaged DB if needed
    if IS_SERVERLESS:
        tmp_db = Path("/tmp") / "prelegal.db"
        source_db = BACKEND_DIR / "prelegal.db"
        if not tmp_db.exists() and source_db.exists():
            try:
                shutil.copy2(source_db, tmp_db)
            except Exception as e:
                print(f"[!] Notice: Seed DB copy to /tmp skipped: {e}")

    # Initialize database tables on startup (safe with try/except)
    try:
        await init_db()
    except Exception as e:
        print(f"[!] Warning: Database init during startup: {e}")

    # Verify templates load
    try:
        catalog = template_service.get_catalog()
        print(f"[*] JurisDraft Backend initialized with {len(catalog)} legal templates.")
    except Exception as e:
        print(f"[!] Warning: Templates catalog load during startup: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION
)

# Global Exception Handler to capture 500 errors transparently
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = f"{type(exc).__name__}: {str(exc)}"
    print(f"[ERROR] {request.method} {request.url.path} -> {error_msg}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": error_msg, "path": request.url.path}
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under both /api/v1 and /v1 (covers all Vercel rewrite permutations)
for r in [auth.router, templates.router, chat.router, documents.router]:
    app.include_router(r, prefix=settings.API_V1_STR)
    app.include_router(r, prefix="/v1")

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    """System health check endpoint."""
    catalog = template_service.get_catalog()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "templates_available": len(catalog),
        "database": "sqlite_connected"
    }

# Single-container SPA Static File Serving
static_path = settings.STATIC_DIR
if static_path.exists():
    if (static_path / "_next").exists():
        app.mount("/_next", StaticFiles(directory=str(static_path / "_next")), name="next_assets")
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Don't intercept API paths
        if full_path.startswith("api/") or full_path == "api":
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        
        # 1. Exact static asset file (e.g. favicon.ico, images, fonts)
        target_file = static_path / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(str(target_file))
        
        # 2. Next.js pre-rendered HTML page (e.g. /login -> /login.html, /editor/mutual-nda -> /editor/mutual-nda.html)
        clean_path = full_path.rstrip("/")
        if clean_path:
            html_file = static_path / f"{clean_path}.html"
            if html_file.exists() and html_file.is_file():
                return FileResponse(str(html_file))

            sub_index = static_path / clean_path / "index.html"
            if sub_index.exists() and sub_index.is_file():
                return FileResponse(str(sub_index))
        
        # 3. Default fallback to root index.html for client-side SPA routing
        index_file = static_path / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return JSONResponse(status_code=404, content={"detail": "Frontend assets not compiled yet."})
