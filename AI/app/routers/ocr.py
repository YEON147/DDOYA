from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.services.ocr_service import process_supplement_image
from app.core.deps import get_db

router = APIRouter()


@router.post("/analyze")
async def analyze_ocr(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    [Router] OCR 이미지 분석 엔드포인트
    라우터는 HTTP 요청/응답 변환만 담당하고, 복잡한 비즈니스 파이프라인 처리는 Service 계층에 위임합니다.
    """
    content = await file.read()
    result = await process_supplement_image(content, file.filename, db)
    return result