import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Run, ExecutionStep, ActivityLog, Task, utc_now
from backend.schemas import (
    RunCreateRequest,
    RunResponse,
    RunDetailResponse,
    StepResponse,
    LogResponse,
    VerificationReportResponse,
    MatchingResultDetailResponse,
)
from backend.services.workflow_engine import execute_workflow, log_audit

router = APIRouter(prefix="/api/runs", tags=["Runs"])


def format_run_detail(run: Run) -> dict:
    """Helper to convert Run model into RunDetailResponse dict."""
    v_report_data = None
    if run.verification_report:
        vr = run.verification_report
        details_dict = {}
        try:
            details_dict = json.loads(vr.details_json)
        except Exception:
            pass
        v_report_data = {
            "id": vr.id,
            "run_id": vr.run_id,
            "target": vr.target,
            "record_type": vr.record_type,
            "status": vr.status,
            "sha256_digest": vr.sha256_digest,
            "assertions_passed": vr.assertions_passed,
            "total_assertions": vr.total_assertions,
            "details": details_dict,
            "created_at": vr.created_at,
        }

    matching_results_data = []
    if run.matching_results:
        for mr in run.matching_results:
            opp = mr.opportunity
            matching_results_data.append({
                "id": mr.id,
                "run_id": mr.run_id,
                "opportunity_id": mr.opportunity_id,
                "candidate_id": mr.candidate_id,
                "eligibility": mr.eligibility,
                "explanation": mr.explanation,
                "created_at": mr.created_at,
                "opportunity_title": opp.title if opp else None,
                "company": opp.company if opp else None,
                "location": opp.location if opp else None,
                "deadline": opp.deadline if opp else None,
                "source_description": opp.source_description if opp else None,
                "dataset_type": opp.dataset_type if opp else "sample_demo_data",
            })

    approvals_data = []
    if run.approvals:
        for a in run.approvals:
            guardrails = []
            try:
                guardrails = json.loads(a.guardrails_json)
            except Exception:
                pass
            approvals_data.append({
                "id": a.id,
                "run_id": a.run_id,
                "action_type": a.action_type,
                "title": a.title,
                "status": a.status,
                "risk_level": a.risk_level,
                "recipient": a.recipient,
                "subject": a.subject,
                "body_preview": a.body_preview,
                "guardrails": guardrails,
                "initiator": a.initiator,
                "reason": a.reason,
                "decision_by": a.decision_by,
                "decision_timestamp": a.decision_timestamp,
                "decision_reason": a.decision_reason,
                "created_at": a.created_at,
                "executed": a.executed,
                "execution_timestamp": a.execution_timestamp,
                "execution_result": a.execution_result,
            })

    return {
        "id": run.id,
        "task_id": run.task_id,
        "status": run.status,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "attempt_count": run.attempt_count,
        "max_retries": run.max_retries,
        "inject_failure": run.inject_failure,
        "error_details": run.error_details,
        "summary": run.summary,
        "task": run.task,
        "steps": run.steps,
        "logs": run.logs,
        "verification_report": v_report_data,
        "matching_results": matching_results_data,
        "approvals": approvals_data,
    }


@router.post("", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
def start_run(req: RunCreateRequest, db: Session = Depends(get_db)):
    """Starts a new execution run for a task."""
    task = db.query(Task).filter(Task.id == req.task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task '{req.task_id}' not found.",
        )

    run = Run(
        task_id=task.id,
        status="queued",
        started_at=utc_now(),
        inject_failure=bool(req.inject_failure),
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    execute_workflow(db, run)
    task.status = run.status
    db.commit()
    db.refresh(run)

    return run


@router.get("", response_model=List[RunResponse])
@router.get("/", response_model=List[RunResponse])
def list_runs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Lists recent runs."""
    return db.query(Run).order_by(Run.started_at.desc()).offset(skip).limit(limit).all()


@router.get("/latest", response_model=RunDetailResponse)
def get_latest_run(db: Session = Depends(get_db)):
    """Retrieves the most recent execution run with full details."""
    run = db.query(Run).order_by(Run.started_at.desc()).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No execution runs found. Create a task first.",
        )
    return format_run_detail(run)


@router.get("/{run_id}", response_model=RunDetailResponse)
def get_run(run_id: str, db: Session = Depends(get_db)):
    """Retrieves a single run with steps, logs, and verification report."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found.",
        )
    return format_run_detail(run)


@router.get("/{run_id}/steps", response_model=List[StepResponse])
def get_run_steps(run_id: str, db: Session = Depends(get_db)):
    """Retrieves the execution steps for a specific run."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Run '{run_id}' not found.")
    return run.steps


@router.get("/{run_id}/logs", response_model=List[LogResponse])
def get_run_logs(run_id: str, db: Session = Depends(get_db)):
    """Retrieves the activity logs for a specific run."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Run '{run_id}' not found.")
    return run.logs


@router.post("/{run_id}/retry", response_model=RunResponse)
def retry_run(run_id: str, db: Session = Depends(get_db)):
    """Retries or recovers an existing run, respecting idempotency keys."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Run '{run_id}' not found.")

    if run.attempt_count >= run.max_retries:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Run '{run_id}' has reached the maximum retry limit of {run.max_retries}.",
        )

    run.attempt_count += 1
    # Run recovery
    execute_workflow(db, run)
    log_audit(db, "run", run.id, "run_retried", "Operator", {"attempt": run.attempt_count})
    return run


@router.get("/{run_id}/results", response_model=List[MatchingResultDetailResponse])
def get_run_results(run_id: str, db: Session = Depends(get_db)):
    """Retrieves the matching opportunity results for a specific run."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Run '{run_id}' not found.")
    return format_run_detail(run)["matching_results"]

