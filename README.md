# REVX

**REVX — Recover. Execute. Verify.**  
An autonomous AI operator that plans multi-step workflows, coordinates tools, tracks execution, recovers from failures, verifies results, and keeps humans in control through approval gates and transparent audit trails.

---

## Frontend Architecture & UI Design

A cinematic, space-inspired, high-density developer console inspired by astronomical observatories and aerospace telemetry dashboards.

### Key Visual & Functional Elements

1. **Top Navigation Bar**:
   - `REVX` wordmark with electric-blue brand accent.
   - Clean view tabs: **Workspace**, **Runs**, **Verification**, **Approvals** with live notification counter.
   - **Backend Status Pill**: Glowing green pulse indicating operational status (`Demo Sandbox Mode`).
   - Operator profile badge (`R`).

2. **Hero Section & Autonomous Task Prompt**:
   - High-impact headline:
     - `Recover.`
     - `Execute.` *(Electric blue #3b82f6)*
     - `Verify.`
   - Tagline: *Autonomous workflows. Observable execution. Verified outcomes.*
   - Task input console with document staging, sample scenario presets dropdown, and `Run task >` demo trigger.

3. **Galaxy Visualization**:
   - High-performance HTML5 Canvas rendering ~1,500 particles along logarithmic spiral arms.
   - Luminous galactic core with multi-layer radial gradient flares.
   - Color grading: Brilliant white starlight, electric blue outer arms, and warm gold/amber clusters.
   - Elliptical dashed orbital paths with inclination tilt.
   - 3 interactive callout nodes with angled leader lines and phase descriptions:
     - **PLAN**: *Understand, Break down, Select tools*
     - **EXECUTE**: *Run steps, Handle failures, Recover safely*
     - **VERIFY**: *Check results, Read back data, Confirm outcomes*
   - Fully accessible, interactive, and respects `prefers-reduced-motion`.

4. **Execution Status Strip (Bottom Dock)**:
   - Docked floating status bar showing real-time workflow phases:
     - `01 Research internships` (Completed with green progress bar)
     - `02 Save results` (Autonomous recovery with pulsing blue bar)
     - `03 Verify records` (Pending verification check)
   - `View details >` trigger opening a comprehensive slide-over inspection modal.

5. **Frontend Demo Views**:
   - **Workspace**: Main cinematic galaxy command center with prompt input and status dock.
   - **Runs**: Step-by-step timeline, autonomous fault recovery spotlight (SQLite lock contention & exponential backoff with jitter), and live terminal logs viewer with filter tabs.
   - **Verification**: Cryptographic assertions ledger (SHA-256 state hashes, schema checks, mathematical balance invariants, tamper-proof audit trails).
   - **Approvals**: Human-in-the-loop control gate with outreach email drafts, SQL migrations, pre-dispatch guardrails checklist, and functional demo Approve/Reject actions.

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Typecheck
```bash
npm run build
```

---

*Note: This milestone contains strictly frontend UI code and local simulated mock states with zero backend mutations or external network dependencies.*
