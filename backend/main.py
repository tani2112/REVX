import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine, Base, SessionLocal
from backend.services.seed_data import seed_database
from backend.routers import health, tasks, runs, verifications, approvals


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Safe startup initialization: create tables without dropping existing data
    Base.metadata.create_all(bind=engine)
    # Seed initial datasets if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="REVX Backend API",
    description="Autonomous workflow orchestration with deterministic failure recovery, cryptographic verification, and human-in-the-loop approval gates.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware configured for local development and Render deployment
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
custom_origins = os.environ.get("ALLOWED_ORIGINS")
if custom_origins:
    allowed_origins.extend([o.strip() for o in custom_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if custom_origins else ["*"],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router)
app.include_router(tasks.router)
app.include_router(runs.router)
app.include_router(verifications.router)
app.include_router(approvals.router)


@app.get("/")
def root():
    return {
        "name": "REVX API",
        "tagline": "Recover. Execute. Verify.",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
