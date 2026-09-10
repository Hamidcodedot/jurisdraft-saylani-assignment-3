# JurisDraft — Enterprise Legal Document Automation & Repository

> Institutional-grade legal document generation powered by curated open-standard templates, fast conversational AI drafting, interactive clause editing, persistent multi-user vaults, and containerized deployment.  
> Developed as the **Week 2 Capstone Project** for **Saylani Mass IT Training (SMIT)**: *Vibe Engineering with AI Coding Agents* (Classes 9 & 10).

---

## 1. Product Overview

**JurisDraft** bridges institutional legal documentation with autonomous AI engineering. Instead of confronting users with intimidating legal jargon or tedious static questionnaires, JurisDraft conducts an articulate, structured conversational intake interview like an experienced corporate paralegal—extracting contractual parameters, providing clause suggestions, rendering documents live on an authentic parchment canvas, and exporting publication-ready PDFs.

### Key Highlights
- **Curated Open Standards (Common Paper)**: Standard agreements modeled after vetted Common Paper frameworks under CC BY 4.0 (Mutual NDA, Cloud Service Agreement, Software License, Consulting Agreement, Terms of Service, Privacy Policy).
- **Anti-AI Slop Institutional Design**: Bespoke legal tech aesthetic inspired by enterprise platforms (Ironclad, Carta, Clerky)—Obsidian Navy (`#0C1838`) and Imperial Gold (`#D4AF37`) palette, heraldic legal crest logo, warm paper textures, crisp serif contract typography, Roman numeral clause divisions, and realistic execution signature lines.
- **Direct Clause Text Editor**: Live clause editor allowing corporate counsel to directly inspect, tweak, and inject custom riders and wording into the agreement with instantaneous real-time preview sync.
- **1-Click Corporate Presets**: Fast-fill verified corporate profiles (e.g., Delaware corporation counterparty, 24/7 enterprise SLA terms) for immediate end-to-end evaluation.
- **Cerebras Fast Inference Skill**: Integrates the custom skill (`.claude/skills/cerebras/SKILL.md`) utilizing LiteLLM via OpenRouter pinned to Cerebras (`openai/gpt-oss-120b`) for sub-second structured outputs, with an intelligent offline deterministic legal engine fallback.
- **Freemium Product-Led Growth**: Visitors can browse templates, converse with the legal assistant, and preview live contracts without signing in. Creating an account is required only to save documents to their cloud vault, seamlessly migrating guest drafts upon sign-up.
- **Mandatory Legal Review Disclaimer**: Authoritative disclaimer banners embedded in preview canvasses and exported PDFs, reminding users to verify terms with licensed legal counsel before execution.
- **Unified Multi-Stage Docker Build**: Single-container production deployment packaging both Next.js frontend assets and FastAPI backend on port 8000.

---

## 2. Architecture & Tech Stack

```
+---------------------------------------------------------------------------------+
|                               JurisDraft SaaS Stack                             |
|                           Unified Container (Port 8000)                         |
+---------------------------------------------------------------------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                                                               |
+----------------------------------+                   +----------------------------------+
|      Next.js 14 Frontend         |                   |      FastAPI Python Backend      |
|  TypeScript • Tailwind CSS       |<=== REST API ====>|  Python 3.12 • SQLAlchemy ORM   |
+----------------------------------+                   +----------------------------------+
  • Landing & Search Catalog                             • JWT Authentication & Bcrypt
  • Split-Screen Contract Studio                         • Markdown Template Engine
    - Tab 1: AI Paralegal Assistant                      • SQLite Cloud Vault
    - Tab 2: Categorized Form Fields                     • Cerebras / LiteLLM AI Service
    - Tab 3: Direct Clause Text Editor                   • ReportLab Publication PDF Engine
    - Tab 4: Health Audit Checklist                      • Single-Container Static SPA Host
  • User Documents Vault                                 
  • Freemium Auth Modals                                 
```

### Technology Matrix
| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, Pydantic V2, SQLAlchemy 2.0, aiosqlite |
| **Authentication** | OAuth2 Bearer JWT Tokens, PBKDF2/SHA256 password salting |
| **AI Inference** | Cerebras Skill (`.claude/skills/cerebras`), LiteLLM, OpenRouter |
| **PDF Generation** | ReportLab with running headers, footers & disclaimer canvas |
| **Containerization** | Multi-stage Docker, Docker Compose, cross-platform scripts |

---

## 3. Template Library (`catalog.json`)

All templates are located in `templates/` formatted in clean Markdown with interpolation variables:

1. **Mutual Non-Disclosure Agreement (NDA)**: Bilateral commercial confidentiality protection covering technical information, source code, exclusions, and survival terms.
2. **Cloud Service Agreement (CSA / SaaS)**: B2B subscription software contract with service level uptime commitments (SLA), customer data ownership, and liability caps.
3. **Software License Agreement (SLA)**: Commercial software licensing covering installation limits, IP protections, audit verifications, and limited warranties.
4. **Independent Consulting Agreement**: Professional advisory statement of work detailing milestone deliverables, hourly/fixed compensations, and work-for-hire IP assignments.
5. **Website & SaaS Terms of Service**: Online terms of service outlining user conduct rules, statutory liability disclaimers, and mandatory arbitration clauses.
6. **Standard Privacy Policy (GDPR/CCPA)**: Privacy disclosure detailing personal data collection, processing purposes, international transfers, and subject rights.

---

## 4. Class 9 & Class 10 Alignment

JurisDraft satisfies every engineering requirement taught across the curriculum:

- **Class 9.1–9.5**: Structured Jira-to-PR methodology with full ticket documentation (`docs/JIRA_BACKLOG.md` tracking `PL-1` through `PL-7`).
- **Class 10.1**: The SaaS blueprint with containerized architecture and two `CLAUDE.md` files.
- **Class 10.2**: Root `CLAUDE.md` memory file and custom Cerebras skill (`.claude/skills/cerebras/SKILL.md`) with structured outputs and `extra_body` provider pinning.
- **Class 10.3**: Business-grade user stories written in the stakeholder's voice.
- **Class 10.4**: Single-container Docker design with platform startup scripts (`scripts/start-windows.ps1`, `scripts/start-mac.sh`).
- **Class 10.5**: Sub-second Cerebras inference with two-way field synchronization and focus retention.
- **Class 10.6**: Multi-user accounts, unprompted freemium PLG onboarding, and mandatory legal review disclaimers.

---

## 5. Quick Start & Execution

### Option A: One-Click Windows Native Launch
```powershell
# In PowerShell:
.\scripts\start-windows.ps1

# Or simply double-click:
.\scripts\start-windows.bat
```

### Option B: One-Click macOS / Linux Launch
```bash
chmod +x scripts/start-mac.sh scripts/stop.sh
./scripts/start-mac.sh
```

### Option C: Production Docker (Single-Container)
```bash
# Build and run the entire unified stack on port 8000:
docker compose up --build
```
Once started, visit:
- **Application Frontend**: [http://localhost:3000](http://localhost:3000) (or `http://localhost:8000` under Docker)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Status**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 6. Automated Testing

The backend includes a comprehensive asynchronous test suite built with `pytest`:

```powershell
# Run the automated backend test suite:
$env:PYTHONPATH="."
backend\venv\Scripts\pytest backend/tests -v
```

### Test Coverage Includes:
- `test_health.py`: Verifies system status and catalog availability.
- `test_templates.py`: Verifies catalog schema, detail lookups, and Markdown variable interpolation.
- `test_auth.py`: Verifies user registration, password hashing, JWT token issuance, and protected profile access.
- `test_chat_and_docs.py`: Verifies conversational legal assistant extraction, guest draft persistence, and vault management.
- `test_pdf.py`: Verifies ReportLab PDF compilation, running headers, and disclaimer flowables.

---

## 7. API Reference (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and template count |
| `GET` | `/api/v1/templates` | List all available templates in catalog |
| `GET` | `/api/v1/templates/{id}` | Retrieve template schema, fields, and raw text |
| `POST` | `/api/v1/templates/{id}/render` | Render Markdown and compute completeness score |
| `POST` | `/api/v1/chat/message` | Conversational drafting intake with field extraction |
| `POST` | `/api/v1/auth/signup` | Create user account & receive JWT token |
| `POST` | `/api/v1/auth/login` | Authenticate credentials & receive JWT token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/v1/documents` | List documents in authenticated user vault |
| `POST` | `/api/v1/documents` | Save or update agreement draft |
| `GET` | `/api/v1/documents/{id}/pdf` | Stream publication-quality PDF |
| `POST` | `/api/v1/documents/export-pdf` | Export PDF on the fly from Markdown |

---

## 8. License & Attributions

- **Codebase**: Licensed under the [MIT License](LICENSE).
- **Legal Templates**: Curated from standard [Common Paper](https://commonpaper.com/) frameworks licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
