import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.app.core.config import settings
from backend.app.db.session import init_db
from backend.app.api.v1.routers import auth, templates, chat, documents
from backend.app.services.template_service import template_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    # Verify templates load
    catalog = template_service.get_catalog()
    print(f"[*] JurisDraft Backend initialized with {len(catalog)} legal templates.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(templates.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)

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
