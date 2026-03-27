from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.model_loader import load_models, release_models
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

app.include_router(ocr.router, prefix="/api/ai/ocr", tags=["OCR"])
app.include_router(report.router, prefix="/api/ai/report", tags=["Report"])

# 전부 pills로 통일
app.include_router(register.router, prefix="/api/ai/pills", tags=["Pill Register"])
app.include_router(verify.router, prefix="/api/ai/pills", tags=["Pill Verify"])