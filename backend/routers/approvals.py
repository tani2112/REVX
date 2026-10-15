import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import ApprovalRequest, utc_now
from backend.schemas import (
    ApprovalResponse,
    ApprovalDecisionRequest,
    ProtectedActionExecutionResponse,
)
from backend.services.workflow_engine import log_audit
from backend.services.seed_data import seed_database

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])


def parse_approval_response(app: ApprovalRequest) -> dict:
    guardrails = []
    try:
        guardrails = json.loads(app.guardrails_json)
    except Exception:
        pass

    return {
        "id": app.id,
        "run_id": app.run_id,
        "action_type": app.action_type,
        "title": app.title,
        "status": app.status,
        "risk_level": app.risk_level,
        "recipient": app.recipient,
        "subject": app.subject,
        "body_preview": app.body_preview,
        "guardrails": guardrails,
        "initiator": app.initiator,
        "reason": app.reason,
        "decision_by": app.decision_by,
        "decision_timestamp": app.decision_timestamp,
        "decision_reason": app.decision_reason,
        "created_at": app.created_at,
        "executed": app.executed,
        "execution_timestamp": app.execution_timestamp,
        "execution_result": app.execution_result,
    }


@router.get("", response_model=List[ApprovalResponse])
@router.get("/", response_model=List[ApprovalResponse])
def list_approvals(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Lists all approval items, pending and resolved."""
    approvals = db.query(ApprovalRequest).order_by(ApprovalRequest.created_at.desc()).offset(skip).limit(limit).all()
    return [parse_approval_response(a) for a in approvals]


@router.get("/{approval_id}", response_model=ApprovalResponse)
def get_approval(approval_id: str, db: Session = Depends(get_db)):
    """Retrieves an approval request by ID."""
    app = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Approval request '{approval_id}' not found.")
    return parse_approval_response(app)


@router.post("/{approval_id}/decision", response_model=ApprovalResponse)
def submit_decision(approval_id: str, req: ApprovalDecisionRequest, db: Session = Depends(get_db)):
    """Records human operator approval or rejection decision."""
    app = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Approval request '{approval_id}' not found.")

    if app.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Approval request '{approval_id}' has already been decided with status '{app.status}'.",
        )

    app.status = req.decision
    app.decision_by = req.actor or "Human Operator"
    app.decision_timestamp = utc_now()
    app.decision_reason = req.reason or ("Approved by operator" if req.decision == "approved" else "Rejected by operator")
    db.commit()
    db.refresh(app)

    log_audit(db, "approval", app.id, f"approval_{req.decision}", app.decision_by, {
        "decision": req.decision,
        "reason": app.decision_reason,
    })

    return parse_approval_response(app)


@router.post("/{approval_id}/execute", response_model=ProtectedActionExecutionResponse)
@router.post("/{approval_id}/dispatch", response_model=ProtectedActionExecutionResponse)
def execute_protected_action(approval_id: str, db: Session = Depends(get_db)):
    """
    CRITICAL SERVER-SIDE AUTHORIZATION GATE:
    Executes a protected sensitive operation ONLY if an operator has explicitly granted approval.
    Rejects any unapproved request with 403 Forbidden.
    """
    app = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Approval request '{approval_id}' not found.")

    # ENFORCE SERVER-SIDE APPROVAL REQUIREMENT
    if app.status != "approved":
        log_audit(db, "protected_action", app.id, "execution_blocked", "SecurityEnforcer", {
            "attempted_status": app.status,
            "error": "Forbidden: Unapproved action attempt blocked",
        })
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"PROTECTED ACTION BLOCKED: Operation requires approved human sign-off. Current approval status: '{app.status}'.",
        )

    if app.executed:
        return ProtectedActionExecutionResponse(
            success=True,
            approval_id=app.id,
            action_type=app.action_type,
            message="Action was previously executed and confirmed.",
            executed_at=app.execution_timestamp or utc_now(),
            details={"action": app.action_type, "recipient": app.recipient, "already_executed": True},
        )

    # Perform safe simulated action (NEVER sends real email)
    app.executed = True
    app.execution_timestamp = utc_now()
    app.execution_result = (
        f"Verified draft staged for dispatch to {app.recipient}. "
        f"[DEMO SAFEGUARD: No real outbound email transmitted]."
    )
    db.commit()

    log_audit(db, "protected_action", app.id, "action_dispatched", app.decision_by or "System", {
        "action_type": app.action_type,
        "recipient": app.recipient,
        "result": app.execution_result,
    })

    return ProtectedActionExecutionResponse(
        success=True,
        approval_id=app.id,
        action_type=app.action_type,
        message=app.execution_result,
        executed_at=app.execution_timestamp,
        details={
            "recipient": app.recipient,
            "subject": app.subject,
            "safe_demo": True,
        },
    )


@router.post("/reset", response_model=List[ApprovalResponse])
def reset_approvals(db: Session = Depends(get_db)):
    """Resets demo approvals to initial seeded state."""
    db.query(ApprovalRequest).delete()
    db.commit()
    seed_database(db)
    approvals = db.query(ApprovalRequest).order_by(ApprovalRequest.created_at.desc()).all()
    return [parse_approval_response(a) for a in approvals]
