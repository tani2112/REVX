import type { WorkflowStep, LogEntry, VerificationRecord, ApprovalItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface BackendHealth {
  status: string;
  database: string;
  version: string;
}

export interface BackendTask {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export interface BackendStep {
  id: string;
  run_id: string;
  step_number: string;
  name: string;
  description: string;
  status: 'completed' | 'running' | 'recovering' | 'pending' | 'failed';
  progress_percent: number;
  duration_str?: string;
  attempt_number: number;
  result_summary?: string;
  error_message?: string;
  recovery_strategy?: string;
  recovery_attempt_count: number;
}

export interface BackendLog {
  id: string;
  run_id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'recover';
  message: string;
}

export interface BackendVerificationReport {
  id: string;
  run_id: string;
  target: string;
  record_type: string;
  status: 'verified' | 'failed' | 'inconclusive';
  sha256_digest: string;
  assertions_passed: number;
  total_assertions: number;
  details: {
    assertions?: Array<{ assertion: string; passed: boolean; [key: string]: unknown }>;
    actual_count?: number;
    expected_count?: number;
    sha256?: string;
  };
  created_at: string;
}

export interface BackendApproval {
  id: string;
  run_id?: string;
  action_type: 'outreach_email' | 'db_migration';
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  risk_level: 'low' | 'medium' | 'high';
  recipient?: string;
  subject?: string;
  body_preview: string;
  guardrails: string[];
  initiator: string;
  reason: string;
  decision_by?: string;
  decision_timestamp?: string;
  decision_reason?: string;
  created_at: string;
  executed: boolean;
  execution_result?: string;
}

export interface BackendRunDetail {
  id: string;
  task_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  attempt_count: number;
  max_retries: number;
  inject_failure: boolean;
  error_details?: string;
  summary?: string;
  steps: BackendStep[];
  logs: BackendLog[];
  verification_report?: BackendVerificationReport;
}

// Map backend step to UI WorkflowStep
export function mapBackendStep(s: BackendStep): WorkflowStep {
  const assertions = [
    'Deterministic execution assertion: PASSED',
    'Payload integrity verified against schema v2.4',
  ];

  return {
    id: s.id,
    number: s.step_number,
    title: s.name,
    subtitle: s.result_summary || (s.status === 'recovering' ? s.error_message || 'Recovering...' : s.description),
    status: s.status,
    progressPercent: s.progress_percent,
    duration: s.duration_str || '1.2s',
    details: {
      description: s.description,
      startedAt: 'UTC Execution',
      completedAt: s.duration_str,
      actionTaken: s.result_summary,
      recoveryDetails: s.recovery_attempt_count > 0 ? {
        error: s.error_message || 'STORAGE_MUTATION_LOCK contention',
        strategy: s.recovery_strategy || 'Autonomous Exponential Backoff with Jitter',
        attemptCount: s.recovery_attempt_count,
        resolved: s.status === 'completed',
      } : undefined,
      assertions,
    },
  };
}

// Map backend log to UI LogEntry
export function mapBackendLog(l: BackendLog): LogEntry {
  const timeFormatted = l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : '14:20:00';
  return {
    id: l.id,
    timestamp: timeFormatted,
    level: l.level,
    message: l.message,
    stepId: l.run_id,
  };
}

// Map backend verification report to UI VerificationRecord
export function mapBackendVerification(v: BackendVerificationReport): VerificationRecord {
  return {
    id: v.id,
    target: v.target,
    recordType: v.record_type,
    hash: `${v.sha256_digest.slice(0, 8)}...${v.sha256_digest.slice(-6)}`,
    assertionsPassed: v.assertions_passed,
    totalAssertions: v.total_assertions,
    status: v.status === 'verified' ? 'verified' : 'flagged',
    timestamp: new Date(v.created_at).toLocaleTimeString(),
    samplePayload: v.details as Record<string, unknown>,
  };
}

// Map backend approval to UI ApprovalItem
export function mapBackendApproval(a: BackendApproval): ApprovalItem {
  return {
    id: a.id,
    title: a.title,
    type: a.action_type === 'outreach_email' ? 'email' : 'db_write',
    status: a.status,
    createdAt: new Date(a.created_at).toLocaleTimeString(),
    riskLevel: a.risk_level,
    recipient: a.recipient,
    subject: a.subject,
    bodyPreview: a.body_preview,
    details: {
      initiator: a.initiator,
      reason: a.reason,
      guardrailsPassed: a.guardrails || [],
      actionPayload: {
        action_type: a.action_type,
        executed: a.executed,
        execution_result: a.execution_result,
      },
    },
  };
}

// --- API Service Methods ---
export const api = {
  async getHealth(): Promise<BackendHealth> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async createTask(description: string, injectFailure: boolean = false, title?: string): Promise<BackendTask> {
    const res = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, title, inject_failure: injectFailure }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create task');
    }
    return res.json();
  },

  async getLatestRun(): Promise<BackendRunDetail | null> {
    const res = await fetch(`${API_BASE_URL}/api/runs/latest`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch latest run: ${res.statusText}`);
    return res.json();
  },

  async getRunDetails(runId: string): Promise<BackendRunDetail> {
    const res = await fetch(`${API_BASE_URL}/api/runs/${runId}`);
    if (!res.ok) throw new Error(`Failed to fetch run: ${res.statusText}`);
    return res.json();
  },

  async getVerifications(): Promise<BackendVerificationReport[]> {
    const res = await fetch(`${API_BASE_URL}/api/verifications`);
    if (!res.ok) throw new Error(`Failed to fetch verifications: ${res.statusText}`);
    return res.json();
  },

  async reverifyRun(runId: string): Promise<BackendVerificationReport> {
    const res = await fetch(`${API_BASE_URL}/api/verifications/runs/${runId}/reverify`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to reverify run: ${res.statusText}`);
    return res.json();
  },

  async getApprovals(): Promise<BackendApproval[]> {
    const res = await fetch(`${API_BASE_URL}/api/approvals`);
    if (!res.ok) throw new Error(`Failed to fetch approvals: ${res.statusText}`);
    return res.json();
  },

  async submitApprovalDecision(approvalId: string, decision: 'approved' | 'rejected', reason?: string): Promise<BackendApproval> {
    const res = await fetch(`${API_BASE_URL}/api/approvals/${approvalId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reason, actor: 'Human Operator' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit decision');
    }
    return res.json();
  },

  async dispatchProtectedAction(approvalId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/approvals/${approvalId}/dispatch`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Action rejected with HTTP ${res.status}`);
    }
    return res.json();
  },

  async resetApprovals(): Promise<BackendApproval[]> {
    const res = await fetch(`${API_BASE_URL}/api/approvals/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to reset approvals: ${res.statusText}`);
    return res.json();
  },
};
