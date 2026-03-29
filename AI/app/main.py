from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.model_loader import load_models, release_models
from app.core.deps import get_db
from app.routers import ocr, report, register, verify


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model_registry = load_models()
    try:
        yield
    finally:
        release_models(app.state.model_registry)
        app.state.model_registry = None


app = FastAPI(
    title="Supplement AI API",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.get("/health/db", tags=["Health"])
def health_db(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    return {"status": "ok", "db": result.scalar()}


app.include_router(ocr.router, prefix="/api/ai/ocr", tags=["OCR"])
app.include_router(report.router, prefix="/api/ai/report", tags=["Report"])
app.include_router(register.router, prefix="/api/ai/pills", tags=["Pill Register"])
app.include_router(verify.router, prefix="/api/ai/pills", tags=["Pill Verify"])