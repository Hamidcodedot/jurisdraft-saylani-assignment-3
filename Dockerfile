# ==========================================================
# Pre-Legal SaaS — Production Unified Multi-Stage Dockerfile
# Serves Next.js frontend & FastAPI backend on Port 8000
# ==========================================================

# ----------------------------------------------------------
# Stage 1: Build Frontend Static Assets
# ----------------------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Configure Next.js for static HTML export
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

# ----------------------------------------------------------
# Stage 2: Build & Run Production FastAPI Backend
# ----------------------------------------------------------
FROM python:3.12-slim AS runner
WORKDIR /app

# System dependencies for PDF generation and crypto
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Backend, Templates, and Catalog
COPY backend/ ./backend/
COPY templates/ ./templates/
COPY catalog.json ./catalog.json
COPY LICENSE ./LICENSE
COPY CLAUDE.md ./CLAUDE.md

# Copy compiled frontend from Stage 1 into backend static directory
# If Next export created an 'out' directory, copy it; else copy build
RUN mkdir -p ./backend/static
COPY --from=frontend-builder /app/frontend/.next ./backend/static/.next || true

# Set environment
ENV PYTHONPATH=/app
ENV PORT=8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start FastAPI via Uvicorn
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
