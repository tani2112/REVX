from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db
from backend.schemas import HealthResponse
from backend.models import utc_now

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
@router.get("/api/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Health endpoint reporting application status and database availability."""
    try:
        # Verify database read
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connectivity check failed: {str(e)}",
        )

    return HealthResponse(
        status="healthy",
        database=db_status,
        version="0.1.0",
        timestamp=utc_now(),
    )
