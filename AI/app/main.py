from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.model_loader import load_models, release_models
from app.routers import ocr, report, register, verify


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 서버 시작 시 1회 실행.
    YOLO / DINOv2 같은 무거운 모델을 여기서 미리 로드한다.
    """
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


app.include_router(ocr.router, prefix="/api/ai/ocr", tags=["OCR"])
app.include_router(report.router, prefix="/api/ai/report", tags=["Report"])
app.include_router(register.router, prefix="/api/ai/pills", tags=["Pill Register"])
app.include_router(verify.router, prefix="/api/ai/pills", tags=["Pill Verify"])