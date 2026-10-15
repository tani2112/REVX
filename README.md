# REVX

**REVX — Recover. Execute. Verify.**  
An autonomous AI operator that plans multi-step workflows, coordinates tools, tracks execution, recovers from failures, verifies results, and keeps humans in control through approval gates and transparent audit trails.

---

## Architecture Overview

REVX provides an end-to-end autonomous workflow orchestration system composed of:
1. **Frontend**: React 19, Vite, TypeScript, and Vanilla CSS with a cinematic dark space observatory aesthetic, animated galaxy visualization, and real-time execution observability.
2. **Backend**: Python 3, FastAPI, SQLAlchemy, and SQLite (`./revx.db`).
3. **Core Workflow Engine**: Deterministic candidate-to-opportunity matcher, controlled failure injection, exponential backoff with jitter, idempotency token guarantees, independent cryptographic read-back verification, and server-side authorization enforcement.

---

## Quick Start (Local Run)

### 1. Prerequisites
- **Node.js**: v20+ recommended
- **Python**: v3.10+ (tested with Python 3.14)
- **Git**

### 2. Backend Setup & Run

In a terminal:
```bash
# 1. Create and activate Python virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI backend server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- The backend will start on **`http://127.0.0.1:8000`**
- Interactive OpenAPI Docs: **`http://127.0.0.1:8000/docs`**
- Health Check: **`http://127.0.0.1:8000/health`**

### 3. Frontend Setup & Run

In a second terminal:
```bash
# 1. Install frontend dependencies
npm install

# 2. Launch Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Running the Automated Test Suite

### Backend Test Suite (Pytest)
```bash
PYTHONPATH=. backend/venv/bin/pytest backend/tests/test_backend.py -v
```
Tests cover:
- Health and database connectivity
- Task creation, validation, and retrieval
- Multi-step workflow execution
- Deterministic candidate matching
- Controlled failure injection and autonomous recovery
- Idempotency protection against duplicate writes
- Independent read-back cryptographic verification
- Approval state transitions and 409 conflict detection
- Server-side authorization gate (403 Forbidden enforcement on unapproved actions)

### Frontend Typecheck & Production Build
```bash
npm run build
```

### Frontend Code Quality (Oxlint)
```bash
npm run lint
```

---

## Demo Workflow: Internship Opportunity Research

1. **Describe a Task**: Enter a prompt or select a sample scenario preset (e.g. *Research internships & verify*).
2. **Execute (Step 01)**: The engine queries seeded opportunities (Stripe, DeepMind, Figma) and applies deterministic qualification rules.
3. **Controlled Failure & Autonomous Recovery (Step 02)**: In demo mode, a simulated storage lock contention is caught; REVX applies exponential backoff with jitter and commits records idempotently with zero duplicates.
4. **Independent Cryptographic Verification (Step 03)**: The verifier reads back stored rows, verifies constraints, and seals the state with a SHA-256 digest.
5. **Human Approval Gate**: An outreach email draft is prepared and held pending in the Approvals queue. Calling protected actions without prior human approval is strictly blocked by the backend (`403 Forbidden`).

---

## Technical Specifications
Detailed REST API endpoint contracts, schemas, and error codes are documented in [docs/API-contract.md](file:///home/tanishk/REVX/docs/API-contract.md).
