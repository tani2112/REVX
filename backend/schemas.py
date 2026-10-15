from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# --- Health ---
class HealthResponse(BaseModel):
    status: str
    database: str
    version: str
    timestamp: datetime


# --- Task Schemas ---
class TaskCreateRequest(BaseModel):
    title: Optional[str] = None
    description: str = Field(..., min_length=1, description="Task prompt description cannot be empty")
    inject_failure: Optional[bool] = Field(default=False, description="Enable deterministic failure injection on step 02")


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime


# --- Step & Log Schemas ---
class StepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    step_number: str
    name: str
    description: str
    status: str
    progress_percent: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_str: Optional[str] = None
    attempt_number: int
    result_summary: Optional[str] = None
    error_message: Optional[str] = None
    recovery_strategy: Optional[str] = None
    recovery_attempt_count: int


class LogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    timestamp: datetime
    level: str
    message: str


# --- Verification Report Schemas ---
class VerificationReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    target: str
    record_type: str
    status: str
    sha256_digest: str
    assertions_passed: int
    total_assertions: int
    details: Dict[str, Any]
    created_at: datetime


# --- Run Schemas ---
class RunCreateRequest(BaseModel):
    task_id: str
    inject_failure: Optional[bool] = False


class RunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    attempt_count: int
    max_retries: int
    inject_failure: bool
    error_details: Optional[str] = None
    summary: Optional[str] = None


class RunDetailResponse(RunResponse):
    model_config = ConfigDict(from_attributes=True)

    task: TaskResponse
    steps: List[StepResponse]
    logs: List[LogResponse]
    verification_report: Optional[VerificationReportResponse] = None


# --- Approval Schemas ---
class ApprovalDecisionRequest(BaseModel):
    decision: str = Field(..., pattern="^(approved|rejected)$")
    reason: Optional[str] = None
    actor: Optional[str] = "Human Operator"


class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: Optional[str]
    action_type: str
    title: str
    status: str
    risk_level: str
    recipient: Optional[str]
    subject: Optional[str]
    body_preview: str
    guardrails: List[str]
    initiator: str
    reason: str
    decision_by: Optional[str]
    decision_timestamp: Optional[datetime]
    decision_reason: Optional[str]
    created_at: datetime
    executed: bool
    execution_timestamp: Optional[datetime]
    execution_result: Optional[str]


class ProtectedActionExecutionResponse(BaseModel):
    success: bool
    approval_id: str
    message: str
    action_type: str
    executed_at: datetime
    details: Dict[str, Any]


# --- Matching & Opportunity Schemas ---
class OpportunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    company: str
    location: str
    required_skills: List[str]
    min_gpa: Optional[float]
    deadline: str
    source_description: str
    dataset_type: str


class MatchingResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    opportunity_id: str
    candidate_id: str
    eligibility: str
    explanation: str
    created_at: datetime


# --- Audit Event ---
class AuditEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    entity_id: str
    action: str
    actor: str
    details: Dict[str, Any]
    timestamp: datetime
