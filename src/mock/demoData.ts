import type { WorkflowStep, LogEntry, VerificationRecord, ApprovalItem, DemoTaskPreset } from '../types';

export const INITIAL_STEPS: WorkflowStep[] = [
  {
    id: 'step-1',
    number: '01',
    title: 'Research internships',
    subtitle: 'Found 3 matching opportunities',
    status: 'completed',
    progressPercent: 100,
    duration: '1.4s',
    details: {
      description: 'Scraped accredited career portals and filtered for 2026 Systems & AI Engineering internships matching qualifications.',
      startedAt: '14:20:02 UTC',
      completedAt: '14:20:03 UTC',
      actionTaken: 'Queried 4 API sources, normalized 42 listings, deduped against previous applications.',
      assertions: [
        'Response status code == 200',
        'Payload contains at least 1 verified listing',
        'Duplicate check: 0 collisions with historical table',
      ],
    },
  },
  {
    id: 'step-2',
    number: '02',
    title: 'Save results',
    subtitle: 'Recovering from storage error...',
    status: 'recovering',
    progressPercent: 68,
    duration: '2.8s (recovering)',
    details: {
      description: 'Persisting candidate records and application tracking metadata into transactional storage.',
      startedAt: '14:20:04 UTC',
      recoveryDetails: {
        error: 'STORAGE_MUTATION_LOCK: Database locked by concurrent worker routine #41',
        strategy: 'Autonomous Exponential Backoff with Jitter (attempt 2 of 3) & idempotent replay guard.',
        attemptCount: 2,
        resolved: false,
      },
      actionTaken: 'Isolated transaction checkpoint. Re-attempting atomic batch commit.',
      assertions: [
        'Idempotency key valid: #REVX-TXN-884920',
        'Disk journal integrity preserved',
      ],
    },
  },
  {
    id: 'step-3',
    number: '03',
    title: 'Verify records',
    subtitle: 'Pending execution',
    status: 'pending',
    progressPercent: 0,
    details: {
      description: 'Cryptographic hash audit and read-back validation to ensure 0 state corruption.',
      assertions: [
        'Read-back count strictly equals written row count',
        'SHA-256 state tree digest matches planned signature',
      ],
    },
  },
];

export const INITIAL_LOGS: LogEntry[] = [
  { id: 'log-1', timestamp: '14:20:01.102', level: 'info', message: '[ORCHESTRATOR] Initialized workflow run #WF-9942 (Internship Research)' },
  { id: 'log-2', timestamp: '14:20:01.450', level: 'info', message: '[PLAN] Phase 1/3: Formulated execution graph with 3 sub-agents and 2 verification checkpoints.' },
  { id: 'log-3', timestamp: '14:20:02.010', level: 'info', message: '[EXECUTE] Dispatched Step 01 (Research internships) using search & semantic filter tools.' },
  { id: 'log-4', timestamp: '14:20:03.114', level: 'success', message: '[STEP_01] Found 3 matching opportunities: Stripe (Core Infra), DeepMind (Systems), Figma (Engine).' },
  { id: 'log-5', timestamp: '14:20:03.420', level: 'info', message: '[STEP_01] Passed pre-write assertion: Schema compatibility v2.4 confirmed.' },
  { id: 'log-6', timestamp: '14:20:04.050', level: 'info', message: '[EXECUTE] Dispatched Step 02 (Save results). Initiating atomic transaction #REVX-TXN-884920.' },
  { id: 'log-7', timestamp: '14:20:04.821', level: 'warn', message: '[WARN] Lock contention detected on SQLite journal. Process #41 holds active read-lock.' },
  { id: 'log-8', timestamp: '14:20:05.105', level: 'recover', message: '[AUTONOMOUS_RECOVERY] Triggered Recovery Policy: Exponential Backoff (delay: 450ms, jitter: 35ms).' },
  { id: 'log-9', timestamp: '14:20:05.612', level: 'recover', message: '[AUTONOMOUS_RECOVERY] Attempt 1/3 timed out. Escalating backoff to 800ms. Idempotency token verified.' },
  { id: 'log-10', timestamp: '14:20:06.419', level: 'info', message: '[STEP_02] Re-attempt 2/3 active: Database lock freed. Committing 3 rows into table `internship_pipeline`...' },
];

export const DEMO_PRESETS: DemoTaskPreset[] = [
  {
    id: 'preset-internships',
    title: 'Research internships & verify',
    prompt: 'Research top 2026 Systems & AI Engineering internships, deduplicate listings, save to pipeline, and verify database integrity.',
    steps: INITIAL_STEPS,
    logs: INITIAL_LOGS,
  },
  {
    id: 'preset-reconciliation',
    title: 'Financial ledger & Stripe reconciliation',
    prompt: 'Query Stripe charges from the past 24 hours, cross-check against PostgreSQL ledger, resolve discrepancies, and report verified delta.',
    steps: [
      {
        id: 'p2-1',
        number: '01',
        title: 'Fetch Stripe ledger',
        subtitle: '1,420 charges retrieved and parsed',
        status: 'completed',
        progressPercent: 100,
        duration: '1.8s',
      },
      {
        id: 'p2-2',
        number: '02',
        title: 'Reconcile DB transactions',
        subtitle: 'Recovered 2 missing webhook payloads',
        status: 'completed',
        progressPercent: 100,
        duration: '3.1s',
      },
      {
        id: 'p2-3',
        number: '03',
        title: 'Verify audit balance',
        subtitle: 'Checksum matches $48,920.00 exactly',
        status: 'completed',
        progressPercent: 100,
        duration: '0.6s',
      },
    ],
    logs: [
      { id: 'l2-1', timestamp: '14:15:00.012', level: 'info', message: '[ORCHESTRATOR] Initiated Stripe Ledger Reconciliation workflow.' },
      { id: 'l2-2', timestamp: '14:15:01.890', level: 'success', message: '[FETCH] Retrieved 1,420 transactions from Stripe API.' },
      { id: 'l2-3', timestamp: '14:15:02.412', level: 'warn', message: '[AUDIT] Found 2 uncommitted webhook events in buffer queue.' },
      { id: 'l2-4', timestamp: '14:15:03.110', level: 'recover', message: '[RECOVERY] Replayed uncommitted webhooks with HMAC signature validation.' },
      { id: 'l2-5', timestamp: '14:15:04.220', level: 'success', message: '[VERIFY] Balance verified: Discrepancy delta = $0.00. SHA-256 proof generated.' },
    ],
  },
  {
    id: 'preset-security-audit',
    title: 'Cloud IAM privilege & security scan',
    prompt: 'Audit all AWS IAM roles with wildcard permissions, simulate least-privilege policies, and prepare rollback proof before mutation.',
    steps: [
      {
        id: 'p3-1',
        number: '01',
        title: 'Inspect IAM permissions',
        subtitle: 'Scanned 84 roles, 4 overprivileged',
        status: 'completed',
        progressPercent: 100,
        duration: '2.2s',
      },
      {
        id: 'p3-2',
        number: '02',
        title: 'Generate policy diff',
        subtitle: 'Restricting s3:* to read-only',
        status: 'running',
        progressPercent: 54,
        duration: '1.1s',
      },
      {
        id: 'p3-3',
        number: '03',
        title: 'Verify rollback checkpoint',
        subtitle: 'Pending dry-run simulation',
        status: 'pending',
        progressPercent: 0,
      },
    ],
    logs: [
      { id: 'l3-1', timestamp: '14:10:00.000', level: 'info', message: '[SECURITY] Starting IAM Privilege Least-Privilege Scan.' },
      { id: 'l3-2', timestamp: '14:10:02.215', level: 'warn', message: '[FLAG] 4 IAM roles detected with unrestricted Wildcard Action (s3:*).' },
      { id: 'l3-3', timestamp: '14:10:03.010', level: 'info', message: '[SIMULATION] Generating dry-run diff against AWS IAM simulator...' },
    ],
  },
];

export const DEMO_VERIFICATIONS: VerificationRecord[] = [
  {
    id: 'rec-1',
    target: 'db.internship_pipeline',
    recordType: 'Row Integrity & Uniqueness',
    hash: '0x8f2a...91ce4b',
    assertionsPassed: 6,
    totalAssertions: 6,
    status: 'verified',
    timestamp: 'Just now',
    samplePayload: {
      table: 'internship_pipeline',
      records_inserted: 3,
      idempotency_token: 'REVX-TXN-884920',
      null_violations: 0,
      foreign_key_valid: true,
      sha256: '8f2a6d71b30528eec49e91ce4bfa3982',
    },
  },
  {
    id: 'rec-2',
    target: 'api.stripe.charge_delta',
    recordType: 'Mathematical Invariant',
    hash: '0x3c11...89a0fa',
    assertionsPassed: 8,
    totalAssertions: 8,
    status: 'verified',
    timestamp: '5 min ago',
    samplePayload: {
      expected_balance_cents: 4892000,
      actual_balance_cents: 4892000,
      delta: 0,
      audit_source: 'stripe_event_log_v2',
    },
  },
  {
    id: 'rec-3',
    target: 'aws.iam.least_privilege',
    recordType: 'Policy Boundary Constraint',
    hash: '0x17d4...4419aa',
    assertionsPassed: 12,
    totalAssertions: 12,
    status: 'verified',
    timestamp: '18 min ago',
    samplePayload: {
      roles_scanned: 84,
      wildcard_violations_cleared: 4,
      canary_role_simulation: 'PASSED_NO_DROP',
    },
  },
  {
    id: 'rec-4',
    target: 'cdn.assets.integrity',
    recordType: 'Subresource Integrity (SRI)',
    hash: '0x55b2...ff9012',
    assertionsPassed: 4,
    totalAssertions: 4,
    status: 'verified',
    timestamp: '1 hr ago',
    samplePayload: {
      assets_checked: 18,
      sri_hashes_matched: 18,
      tampering_detected: false,
    },
  },
];

export const DEMO_APPROVALS: ApprovalItem[] = [
  {
    id: 'app-1',
    title: 'Outreach Email: 3 Verified Internship Candidates',
    type: 'email',
    status: 'pending',
    createdAt: '2 mins ago',
    riskLevel: 'medium',
    recipient: 'recruiting-team@stripe.com, careers@deepmind.com, talent@figma.com',
    subject: 'Application & Portfolio Submission: Systems & AI Engineering',
    bodyPreview: `Dear University Recruiting Team,

I am writing to express my strong interest in the 2026 Systems & AI Engineering internship. Through REVX verified autonomous workflow orchestration, my background demonstrates end-to-end reliability, failure recovery architectures, and verifiable execution.

Key Projects & Verified Artifacts:
• REVX: Autonomous workflows with deterministic recovery & cryptographic verification.
• Real-time distributed stream reconciler with zero state corruption.

Portfolio & Repository: https://github.com/tani2112/REVX
Resume: Attached (Cryptographically verified)

Thank you for your consideration,
Candidate`,
    details: {
      initiator: 'Agent: OutreachOrchestrator_v2',
      reason: 'Requires human approval before external communication is dispatched via SMTP gateway.',
      guardrailsPassed: [
        'PII Leakage Detector: 0 sensitive tokens detected',
        'Tone & Politeness Policy: Verified professional',
        'Attachment Virus & Format Scan: 100% clean PDF',
        'Rate limit check: 3/50 daily quota utilized',
      ],
      actionPayload: {
        recipients_count: 3,
        smtp_route: 'outbound-relays.revx.internal',
        idempotent_dispatch_id: 'DSP-2026-9081',
      },
    },
  },
  {
    id: 'app-2',
    title: 'Schema Migration: Add Hash Verification Column to Production Table',
    type: 'db_write',
    status: 'pending',
    createdAt: '15 mins ago',
    riskLevel: 'high',
    details: {
      initiator: 'Agent: StorageSupervisor',
      reason: 'Adding NOT NULL column `sha256_audit_hash` to `execution_records` with zero-downtime lock acquisition.',
      guardrailsPassed: [
        'Backward compatibility check: Verified v1.8 client compatibility',
        'Storage footprint estimation: +1.2MB (<0.1% volume space)',
        'Rollback script pre-validated in sandbox',
      ],
      actionPayload: {
        sql: 'ALTER TABLE execution_records ADD COLUMN sha256_audit_hash VARCHAR(64) DEFAULT NULL;',
        timeout_ms: 3000,
      },
    },
  },
];
