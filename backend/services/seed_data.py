import json
from sqlalchemy.orm import Session
from backend.models import SampleOpportunity, ApprovalRequest, Task, utc_now

SAMPLE_OPPORTUNITIES = [
  {
    "id": "OPP-2026-01",
    "title": "Systems & Infrastructure Engineering Intern",
    "company": "Stripe",
    "location": "Remote / San Francisco",
    "required_skills": ["Systems", "Distributed Systems", "Go", "Python"],
    "min_gpa": 3.2,
    "deadline": "2026-12-01",
    "source_description": "[Sample Demo Source] Accredited 2026 Tech Portal",
    "dataset_type": "sample_demo_data",
  },
  {
    "id": "OPP-2026-02",
    "title": "AI Research & Systems Engineering Intern",
    "company": "Google DeepMind",
    "location": "London / Hybrid",
    "required_skills": ["AI", "Machine Learning", "Python", "C++"],
    "min_gpa": 3.5,
    "deadline": "2026-11-15",
    "source_description": "[Sample Demo Source] Accredited 2026 Tech Portal",
    "dataset_type": "sample_demo_data",
  },
  {
    "id": "OPP-2026-03",
    "title": "Rendering Engine & Graphics Systems Intern",
    "company": "Figma",
    "location": "New York / Hybrid",
    "required_skills": ["Graphics", "Systems", "WebAssembly", "TypeScript"],
    "min_gpa": 3.0,
    "deadline": "2026-12-15",
    "source_description": "[Sample Demo Source] Accredited 2026 Tech Portal",
    "dataset_type": "sample_demo_data",
  },
  {
    "id": "OPP-2026-04",
    "title": "Cloud Networking & Kernel Security Intern",
    "company": "Cloudflare",
    "location": "Austin / Remote",
    "required_skills": ["Security", "Networking", "Rust", "Linux"],
    "min_gpa": 3.2,
    "deadline": "2026-11-30",
    "source_description": "[Sample Demo Source] Accredited 2026 Tech Portal",
    "dataset_type": "sample_demo_data",
  },
]


def seed_database(db: Session) -> None:
    """Safely seeds sample opportunities and initial demo approval items if tables are empty."""
    # 1. Opportunities
    existing_opps = db.query(SampleOpportunity).count()
    if existing_opps == 0:
        for item in SAMPLE_OPPORTUNITIES:
            opp = SampleOpportunity(
                id=item["id"],
                title=item["title"],
                company=item["company"],
                location=item["location"],
                required_skills_json=json.dumps(item["required_skills"]),
                min_gpa=item["min_gpa"],
                deadline=item["deadline"],
                source_description=item["source_description"],
                dataset_type=item["dataset_type"],
            )
            db.add(opp)
        db.commit()

    # 2. Initial Approval Requests (Human-in-the-loop control demo)
    existing_approvals = db.query(ApprovalRequest).count()
    if existing_approvals == 0:
        approval_1 = ApprovalRequest(
            id="app-1",
            run_id=None,
            action_type="outreach_email",
            title="Outreach Email: 3 Verified Internship Candidates",
            status="pending",
            risk_level="medium",
            recipient="recruiting-team@stripe.com, careers@deepmind.com, talent@figma.com",
            subject="Application & Portfolio Submission: Systems & AI Engineering",
            body_preview="""Dear University Recruiting Team,

I am writing to express my strong interest in the 2026 Systems & AI Engineering internship. Through REVX verified autonomous workflow orchestration, my background demonstrates end-to-end reliability, failure recovery architectures, and verifiable execution.

Key Projects & Verified Artifacts:
• REVX: Autonomous workflows with deterministic recovery & cryptographic verification.
• Real-time distributed stream reconciler with zero state corruption.

Portfolio & Repository: https://github.com/tani2112/REVX
Resume: Attached (Cryptographically verified)

Thank you for your consideration,
Candidate""",
            guardrails_json=json.dumps([
                "PII Leakage Detector: 0 sensitive tokens detected",
                "Tone & Politeness Policy: Verified professional",
                "Attachment Virus & Format Scan: 100% clean PDF",
                "Rate limit check: 3/50 daily quota utilized",
            ]),
            initiator="Agent: OutreachOrchestrator_v2",
            reason="Requires human approval before external communication is dispatched via SMTP gateway.",
            created_at=utc_now(),
        )

        approval_2 = ApprovalRequest(
            id="app-2",
            run_id=None,
            action_type="db_migration",
            title="Schema Migration: Add Hash Verification Column to Production Table",
            status="pending",
            risk_level="high",
            recipient=None,
            subject=None,
            body_preview="ALTER TABLE execution_records ADD COLUMN sha256_audit_hash VARCHAR(64) DEFAULT NULL;",
            guardrails_json=json.dumps([
                "Backward compatibility check: Verified v1.8 client compatibility",
                "Storage footprint estimation: +1.2MB (<0.1% volume space)",
                "Rollback script pre-validated in sandbox",
            ]),
            initiator="Agent: StorageSupervisor",
            reason="Adding NOT NULL column `sha256_audit_hash` to `execution_records` with zero-downtime lock acquisition.",
            created_at=utc_now(),
        )

        db.add(approval_1)
        db.add(approval_2)
        db.commit()
