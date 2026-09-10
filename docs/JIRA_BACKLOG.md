# Pre-Legal Product Backlog (Jira Tickets PL-1 to PL-7)

This backlog documents the requirements, acceptance criteria, and implementation lifecycle for the Pre-Legal SaaS product based on the Class 9 and Class 10 engineering workflow.

---

### PL-1: Initial Web Exploration (Spike)
- **Type**: Spike / Prototype
- **Status**: Completed (Superseded by PL-3)
- **Summary**: Verify feasibility of browser-based legal document preview and Markdown formatting.

---

### PL-2: Curate Legal Document Template Dataset
- **Type**: Task
- **Status**: Completed
- **Reporter**: Product Owner
- **Assignee**: Claude Code
- **Description**:
  Create a comprehensive library of standard, open legal document templates that the system can customize for users. Source templates following standard Common Paper specifications under Creative Commons licensing.
- **Acceptance Criteria**:
  1. Store clean Markdown templates in `templates/` directory (`mutual-nda.md`, `cloud-service-agreement.md`, `software-license-agreement.md`, `consulting-agreement.md`, `terms-of-service.md`, `privacy-policy.md`).
  2. Create `catalog.json` describing each template, its category, description, and required/optional parameter fields.
  3. Include a `LICENSE` file granting permissive use and properly acknowledging the Creative Commons license.

---

### PL-3: Next.js Mutual NDA Prototype
- **Type**: Story
- **Status**: Completed
- **Reporter**: Tech Lead
- **Assignee**: Claude Code
- **Description**:
  Build a web application prototype that allows a user to enter parameters into a form, renders the Mutual NDA in real-time side-by-side, and provides a PDF download.
- **Acceptance Criteria**:
  1. Side-by-side layout (form inputs on the left, live document preview on the right).
  2. Live synchronization between form inputs and document variables.
  3. One-click PDF download with standard legal formatting.

---

### PL-4: Build Foundation of V1 (Containerized Full-Stack)
- **Type**: Technical Story
- **Status**: Completed
- **Reporter**: Lead Architect
- **Assignee**: Claude Code
- **Description**:
  Upgrade the prototype into a production-grade multi-tier architecture without adding unneeded feature bloat yet. Containerize the application, set up a FastAPI backend with Python 3.12 in `backend/`, Next.js frontend in `frontend/`, SQLite database, and startup/shutdown scripts.
- **Acceptance Criteria**:
  1. FastAPI backend initialized with clear modular routers (`/api/v1/auth`, `/api/v1/templates`, `/api/v1/documents`).
  2. SQLite database initialized automatically upon container or script launch.
  3. Production multi-stage `Dockerfile` and `docker-compose.yml`.
  4. Platform startup scripts (`scripts/start-windows.ps1`, `scripts/start-mac.sh`, `scripts/stop.sh`).
  5. Placeholder authentication flow to allow frictionless exploration before login.

---

### PL-5: Add AI Conversational Drafter (Cerebras Skill & Structured Output)
- **Type**: Story
- **Status**: Completed
- **Reporter**: Product Owner
- **Assignee**: Claude Code
- **Description**:
  Evolve document drafting into an interactive legal dialogue. Instead of a sterile static form, an intelligent AI legal drafter interviews the user, clarifies intent, suggests optimal clauses, and auto-populates the document fields in real time.
- **Acceptance Criteria**:
  1. Conversational legal assistant interface that greets the user and asks targeted questions.
  2. Integration with LiteLLM / OpenRouter targeting Cerebras inference for near-instant responses.
  3. Deterministic structured output extracting key fields into document state.
  4. Two-way synchronization: updating fields via chat updates preview; editing fields manually updates chat context.
  5. Deterministic fallback engine for local/offline testing without API key dependency.

---

### PL-6: Expand to All Document Types & UX Polish
- **Type**: Story
- **Status**: Completed
- **Reporter**: Product Owner
- **Assignee**: Claude Code
- **Description**:
  Expand AI legal drafter to support all curated templates in `catalog.json` (Cloud Service Agreement, Software License, Consulting Agreement, Terms of Service, Privacy Policy). If a user requests an unsupported document, politely explain limitations and suggest the closest available standard.
- **Acceptance Criteria**:
  1. Template catalog selector with search, category filtering (B2B, SaaS, Employment, Compliance), and metadata tags.
  2. AI drafter dynamically adapts system prompt and extraction schema based on active template.
  3. Focus automatically returns to input field after submission.
  4. Follow-up questioning logic ensures all critical clauses are reviewed.

---

### PL-7: Multi-User Accounts, Freemium PLG & Enterprise Polish
- **Type**: Story
- **Status**: Completed
- **Reporter**: Product Owner & Security Reviewer
- **Assignee**: Claude Code
- **Description**:
  Implement true multi-user management with secure JWT authentication and password hashing. Provide a product-led growth freemium flow allowing guest drafting with account creation to save documents. Provide a "My Documents" dashboard. Add a mandatory, prominent legal review disclaimer.
- **Acceptance Criteria**:
  1. Secure user sign-up and sign-in (`/api/v1/auth/signup`, `/api/v1/auth/login`) with bcrypt password hashing and JWT sessions.
  2. Freemium flow: Users can draft without signing in; clicking "Save to My Documents" prompts login/signup and seamlessly attaches the draft.
  3. "My Documents" vault allowing users to manage, edit, reopen, and delete saved agreements.
  4. Prominent legal review disclaimer: *"Draft document generated by Pre-Legal AI. This document is a preliminary draft provided for informational convenience and is subject to formal review and advice from a qualified legal professional before execution."*
  5. High-end human design aesthetic: warm paper canvas, crisp typography, no generic AI styling.
