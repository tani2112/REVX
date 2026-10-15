import os
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base, get_db
from backend.main import app
from backend.services.seed_data import seed_database
from backend.models import Task, Run, MatchingResult, ApprovalRequest, AuditEvent, SampleOpportunity
from backend.services.workflow_engine import evaluate_candidate

TEST_DB_URL = "sqlite:///./test_revx.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Setup clean test tables
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_revx.db"):
        os.remove("./test_revx.db")


@pytest.fixture
def client():
    return TestClient(app)


# --- 1. Health Endpoint Tests ---
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["version"] == "0.1.0"


def test_api_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# --- 2. Task Management Tests ---
def test_create_task_validation_error(client):
    # Empty description should fail with 422
    response = client.post("/api/tasks", json={"description": "   "})
    assert response.status_code == 422


def test_create_task_and_auto_execute(client):
    response = client.post("/api/tasks", json={
        "description": "Research 2026 tech internships and save to sheet",
        "title": "Internship Pipeline Task",
        "inject_failure": False,
    })
    assert response.status_code == 201
    task_data = response.json()
    assert task_data["id"] is not None
    assert task_data["title"] == "Internship Pipeline Task"
    assert task_data["status"] == "completed"

    # Verify task retrieval
    get_res = client.get(f"/api/tasks/{task_data['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == task_data["id"]


def test_get_nonexistent_task(client):
    response = client.get("/api/tasks/nonexistent-id-999")
    assert response.status_code == 404


def test_list_tasks(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1


# --- 3. Execution Runs, Failure Injection & Recovery Tests ---
def test_run_with_failure_injection_and_autonomous_recovery(client):
    # 1. Create a task with failure injection enabled
    task_res = client.post("/api/tasks", json={
        "description": "Test failure injection & recovery workflow",
        "title": "Failure Injection Test",
        "inject_failure": True,
    })
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    # Retrieve runs for this task
    runs_res = client.get("/api/runs")
    assert runs_res.status_code == 200
    runs = runs_res.json()
    assert len(runs) >= 1
    latest_run_id = runs[0]["id"]

    # Inspect run details
    detail_res = client.get(f"/api/runs/{latest_run_id}")
    assert detail_res.status_code == 200
    run_detail = detail_res.json()
    assert run_detail["status"] == "completed"

    # Verify execution steps
    steps = run_detail["steps"]
    assert len(steps) == 3
    assert steps[0]["step_number"] == "01"
    assert steps[0]["status"] == "completed"

    step2 = steps[1]
    assert step2["step_number"] == "02"
    assert step2["status"] == "completed"
    assert step2["recovery_attempt_count"] == 2
    assert "STORAGE_MUTATION_LOCK" in step2["error_message"]

    step3 = steps[2]
    assert step3["step_number"] == "03"
    assert step3["status"] == "completed"

    # Verify activity logs contain recovery events
    logs = run_detail["logs"]
    assert any("[AUTONOMOUS_RECOVERY]" in log["message"] for log in logs)


# --- 4. Idempotency & Duplicate Prevention Tests ---
def test_idempotency_prevents_duplicate_writes(client):
    # Trigger retry on a run
    runs = client.get("/api/runs").json()
    run_id = runs[0]["id"]

    db = TestingSessionLocal()
    initial_count = db.query(MatchingResult).filter(MatchingResult.run_id == run_id).count()
    db.close()

    # Retry run
    retry_res = client.post(f"/api/runs/{run_id}/retry")
    assert retry_res.status_code == 200

    db = TestingSessionLocal()
    after_count = db.query(MatchingResult).filter(MatchingResult.run_id == run_id).count()
    db.close()

    # Idempotent: row count should remain exactly identical
    assert after_count == initial_count


# --- 5. Candidate Evaluation Deterministic Rule Tests ---
def test_evaluate_candidate_rules():
    class MockOpp:
        required_skills_json = json.dumps(["Systems", "Python"])
        min_gpa = 3.5

    # 1. Eligible candidate
    cand_eligible = {"skills": ["Systems", "Python", "Go"], "gpa": 3.8}
    res = evaluate_candidate(cand_eligible, MockOpp())
    assert res["eligibility"] == "eligible"

    # 2. Ineligible by GPA
    cand_low_gpa = {"skills": ["Systems", "Python"], "gpa": 3.2}
    res = evaluate_candidate(cand_low_gpa, MockOpp())
    assert res["eligibility"] == "ineligible"

    # 3. Ineligible by skills
    cand_no_skills = {"skills": ["Design", "Marketing"], "gpa": 3.9}
    res = evaluate_candidate(cand_no_skills, MockOpp())
    assert res["eligibility"] == "ineligible"

    # 4. Insufficient info
    cand_no_gpa = {"skills": ["Systems", "Python"]}
    res = evaluate_candidate(cand_no_gpa, MockOpp())
    assert res["eligibility"] == "insufficient_info"


# --- 6. Verification Service Tests ---
def test_independent_verification_reports(client):
    v_res = client.get("/api/verifications")
    assert v_res.status_code == 200
    reports = v_res.json()
    assert len(reports) >= 1

    report = reports[0]
    assert report["status"] == "verified"
    assert report["assertions_passed"] == report["total_assertions"]
    assert len(report["sha256_digest"]) == 64

    # Test re-verifying a run
    run_id = report["run_id"]
    reverify_res = client.post(f"/api/verifications/runs/{run_id}/reverify")
    assert reverify_res.status_code == 200
    rev_data = reverify_res.json()
    assert rev_data["status"] == "verified"


# --- 7. Human Approvals & Protected Action Authorization Tests ---
def test_approval_decision_workflow(client):
    approvals = client.get("/api/approvals").json()
    assert len(approvals) >= 1
    app_id = approvals[0]["id"]

    # 1. Reject first
    rej_res = client.post(f"/api/approvals/{app_id}/decision", json={
        "decision": "rejected",
        "reason": "Need minor adjustment",
        "actor": "Lead Engineer",
    })
    assert rej_res.status_code == 200
    assert rej_res.json()["status"] == "rejected"

    # 2. Duplicate decision on decided item must fail with 409 Conflict
    conflict_res = client.post(f"/api/approvals/{app_id}/decision", json={
        "decision": "approved",
    })
    assert conflict_res.status_code == 409


def test_protected_action_blocked_without_approval(client):
    # Reset approvals to fresh state
    client.post("/api/approvals/reset")
    approvals = client.get("/api/approvals").json()
    pending_app = [a for a in approvals if a["status"] == "pending"][0]

    # Attempting to dispatch protected action while PENDING must be rejected with 403 Forbidden!
    blocked_res = client.post(f"/api/approvals/{pending_app['id']}/dispatch")
    assert blocked_res.status_code == 403
    assert "PROTECTED ACTION BLOCKED" in blocked_res.json()["detail"]


def test_protected_action_succeeds_after_human_approval(client):
    approvals = client.get("/api/approvals").json()
    pending_app = [a for a in approvals if a["status"] == "pending"][0]

    # Operator approves
    app_res = client.post(f"/api/approvals/{pending_app['id']}/decision", json={
        "decision": "approved",
        "reason": "Looks good to stage",
        "actor": "Security Admin",
    })
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "approved"

    # Protected action dispatch now SUCCEEDS server-side
    dispatch_res = client.post(f"/api/approvals/{pending_app['id']}/dispatch")
    assert dispatch_res.status_code == 200
    res_data = dispatch_res.json()
    assert res_data["success"] is True
    assert "No real outbound email transmitted" in res_data["message"]
