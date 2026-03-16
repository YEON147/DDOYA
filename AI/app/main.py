from fastapi import FastAPI
from app.routers import ocr, report

app = FastAPI()

app.include_router(ocr.router, prefix="/api/ai/ocr", tags=["OCR"])
app.include_router(report.router, prefix="/api/ai/report", tags=["Report"])