import datetime
import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from backend.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(32), default="pending", nullable=False)  # pending, running, completed, failed
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    runs = relationship("Run", back_populates="task", cascade="all, delete-orphan", order_by="desc(Run.started_at)")


class Run(Base):
    __tablename__ = "runs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=False)
    status = Column(String(32), default="queued", nullable=False)  # queued, running, recovering, completed, failed
    started_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    attempt_count = Column(Integer, default=1, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    inject_failure = Column(Boolean, default=False, nullable=False)
    error_details = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    task = relationship("Task", back_populates="runs")
    steps = relationship("ExecutionStep", back_populates="run", cascade="all, delete-orphan", order_by="ExecutionStep.step_number")
    logs = relationship("ActivityLog", back_populates="run", cascade="all, delete-orphan", order_by="desc(ActivityLog.timestamp)")
    matching_results = relationship("MatchingResult", back_populates="run", cascade="all, delete-orphan")
    verification_report = relationship("VerificationReport", back_populates="run", uselist=False, cascade="all, delete-orphan")
    approvals = relationship("ApprovalRequest", back_populates="run", cascade="all, delete-orphan")


class ExecutionStep(Base):
    __tablename__ = "execution_steps"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=False)
    step_number = Column(String(8), nullable=False)  # "01", "02", "03"
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(32), default="pending", nullable=False)  # pending, running, recovering, completed, failed
    progress_percent = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_str = Column(String(32), nullable=True)
    attempt_number = Column(Integer, default=1, nullable=False)
    result_summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    recovery_strategy = Column(Text, nullable=True)
    recovery_attempt_count = Column(Integer, default=0, nullable=False)

    run = relationship("Run", back_populates="steps")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=False)
    timestamp = Column(DateTime, default=utc_now, nullable=False)
    level = Column(String(16), default="info", nullable=False)  # info, warn, error, recover, success
    message = Column(Text, nullable=False)

    run = relationship("Run", back_populates="logs")


class SampleOpportunity(Base):
    __tablename__ = "sample_opportunities"

    id = Column(String(64), primary_key=True)  # stable ID e.g. "OPP-2026-01"
    title = Column(String(128), nullable=False)
    company = Column(String(128), nullable=False)
    location = Column(String(128), nullable=False)
    required_skills_json = Column(Text, nullable=False)  # JSON list
    min_gpa = Column(Float, nullable=True)
    deadline = Column(String(64), nullable=False)
    source_description = Column(String(255), nullable=False)
    dataset_type = Column(String(64), default="sample_demo_data", nullable=False)


class MatchingResult(Base):
    __tablename__ = "matching_results"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=False)
    opportunity_id = Column(String(64), ForeignKey("sample_opportunities.id"), nullable=False)
    candidate_id = Column(String(64), nullable=False)
    eligibility = Column(String(32), nullable=False)  # eligible, ineligible, insufficient_info
    explanation = Column(Text, nullable=False)
    idempotency_token = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    run = relationship("Run", back_populates="matching_results")
    opportunity = relationship("SampleOpportunity")

    __table_args__ = (
        UniqueConstraint("run_id", "opportunity_id", name="uq_run_opportunity_match"),
    )


class VerificationReport(Base):
    __tablename__ = "verification_reports"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), unique=True, nullable=False)
    target = Column(String(128), nullable=False)
    record_type = Column(String(128), nullable=False)
    status = Column(String(32), default="verified", nullable=False)  # verified, failed, inconclusive
    sha256_digest = Column(String(64), nullable=False)
    assertions_passed = Column(Integer, default=0, nullable=False)
    total_assertions = Column(Integer, default=0, nullable=False)
    details_json = Column(Text, nullable=False)  # JSON summary of assertions
    created_at = Column(DateTime, default=utc_now, nullable=False)

    run = relationship("Run", back_populates="verification_report")


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    run_id = Column(String(64), ForeignKey("runs.id"), nullable=True)
    action_type = Column(String(32), nullable=False)  # outreach_email, db_migration
    title = Column(String(255), nullable=False)
    status = Column(String(32), default="pending", nullable=False)  # pending, approved, rejected
    risk_level = Column(String(16), default="medium", nullable=False)  # low, medium, high
    recipient = Column(String(255), nullable=True)
    subject = Column(String(255), nullable=True)
    body_preview = Column(Text, nullable=False)
    guardrails_json = Column(Text, nullable=False)  # JSON array
    initiator = Column(String(128), nullable=False)
    reason = Column(Text, nullable=False)
    decision_by = Column(String(128), nullable=True)
    decision_timestamp = Column(DateTime, nullable=True)
    decision_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    executed = Column(Boolean, default=False, nullable=False)
    execution_timestamp = Column(DateTime, nullable=True)
    execution_result = Column(Text, nullable=True)

    run = relationship("Run", back_populates="approvals")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    entity_type = Column(String(32), nullable=False)
    entity_id = Column(String(64), nullable=False)
    action = Column(String(64), nullable=False)
    actor = Column(String(128), nullable=False)
    details_json = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=utc_now, nullable=False)
