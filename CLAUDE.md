# Pre-Legal — SaaS Legal Document Drafter

## Product Overview
Pre-Legal is a SaaS product that enables users to draft customized, legally standard agreements based on curated templates in the `templates` directory. The user interacts through a refined conversational legal assistant or structured form to determine document needs and fill all parameters. Available documents and field schemas are defined in `catalog.json`.

Initial prototype proved the concept with Mutual NDAs; V1 expands to full multi-document coverage, persistent accounts, live contract preview, and containerized deployment.

## Development Process
1. Use Jira / backlog tickets (`PL-1` through `PL-7`) to guide feature development.
2. Develop systematically — never skip clarifying questions, architecture reviews, or quality verification.
3. Thoroughly test with unit and integration tests; resolve all discrepancies before merging.
4. Submit PRs using GitHub tools with clean commit histories.

## AI Design
When writing code to call an LLM, use the `cerebras` skill:
- LiteLLM via OpenRouter targeting `openai/gpt-oss-120b` with Cerebras as the inference provider for sub-second responses.
- Enforce structured output via Pydantic schemas so legal clauses and fields are populated deterministically.
- Maintain an offline deterministic fallback engine to ensure 100% testability without active API keys.

## Technical Design
- Containerization: Single unified multi-stage Docker container serving frontend static assets through FastAPI on port 8000.
- Backend: Python 3.12 with FastAPI in `backend/`, modular routers, SQLAlchemy ORM, and JWT authentication.
- Frontend: Next.js with TypeScript and Tailwind CSS in `frontend/`, featuring an enterprise legal tech UI (slate/zinc palette, paper typography, split-screen live preview).
- Database: SQLite with SQLAlchemy ORM (`backend/prelegal.db`), supporting user sign-up, sign-in, and saved document management.
- Provide scripts to start and stop the app across platforms (`scripts/start-windows.ps1`, `scripts/start-mac.sh`).
- Environment variables configured via `.env` in the root directory.
