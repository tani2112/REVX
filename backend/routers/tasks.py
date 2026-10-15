from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Task, Run, utc_now
from backend.schemas import TaskCreateRequest, TaskResponse, RunDetailResponse
from backend.services.workflow_engine import execute_workflow, log_audit

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(req: TaskCreateRequest, db: Session = Depends(get_db)):
    """Creates a task and dispatches an initial workflow run."""
    clean_desc = req.description.strip()
    if not clean_desc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Task description cannot be empty.",
        )

    title = req.title.strip() if req.title and req.title.strip() else clean_desc[:50]

    task = Task(
        title=title,
        description=clean_desc,
        status="running",
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Automatically create and execute initial run for this task
    run = Run(
        task_id=task.id,
        status="queued",
        started_at=utc_now(),
        inject_failure=bool(req.inject_failure),
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Execute deterministic workflow
    execute_workflow(db, run)

    # Update task status based on run
    task.status = run.status
    db.commit()
    db.refresh(task)

    log_audit(db, "task", task.id, "task_created", "HumanOperator", {"title": task.title, "run_id": run.id})

    return task


@router.get("", response_model=List[TaskResponse])
@router.get("/", response_model=List[TaskResponse])
def list_tasks(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Lists all created tasks, ordered by most recent."""
    return db.query(Task).order_by(Task.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)):
    """Retrieves a single task by ID or returns 404."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found.",
        )
    return task
