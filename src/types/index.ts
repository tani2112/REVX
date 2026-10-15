export type NavTab = 'workspace' | 'runs' | 'verification' | 'approvals' | 'execution' | 'results';

export type StepStatus = 'completed' | 'running' | 'recovering' | 'pending' | 'failed';

export interface WorkflowStep {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  status: StepStatus;
  progressPercent: number;
  duration?: string;
  details?: {
    description: string;
    startedAt?: string;
    completedAt?: string;
    actionTaken?: string;
    recoveryDetails?: {
      error: string;
      strategy: string;
      attemptCount: number;
      resolved: boolean;
    };
    assertions?: string[];
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'recover';
  message: string;
  stepId?: string;
}

export interface VerificationRecord {
  id: string;
  target: string;
  recordType: string;
  hash: string;
  fullHash?: string;
  assertionsPassed: number;
  totalAssertions: number;
  status: 'verified' | 'flagged' | 'pending';
  timestamp: string;
  samplePayload: Record<string, unknown>;
  runId?: string;
  taskId?: string;
  taskTitle?: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  type: 'email' | 'db_write' | 'payment';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  riskLevel: 'low' | 'medium' | 'high';
  recipient?: string;
  subject?: string;
  bodyPreview?: string;
  runId?: string;
  taskId?: string;
  taskTitle?: string;
  taskDescription?: string;
  executed?: boolean;
  details: {
    initiator: string;
    reason: string;
    guardrailsPassed: string[];
    actionPayload: Record<string, unknown>;
  };
}

export interface BackendRunSummary {
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
  task?: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  };
}

export interface DemoTaskPreset {
  id: string;
  title: string;
  prompt: string;
  steps: WorkflowStep[];
  logs: LogEntry[];
}
