from fastapi import APIRouter
from app.services.ocr_service import call_clova_ocr
from app.services.ocr_parser import parse_ocr_result, calculate_confidence
from pydantic import BaseModel

router = APIRouter()

class OCRRequest(BaseModel):
    image_url: str

@router.post("/analyze")
async def analyze_ocr(request: OCRRequest):
    # 1. Clova OCR 호출
    ocr_result = call_clova_ocr(request.image_url)
    
    # 2. 신뢰도 계산
    confidence = calculate_confidence(ocr_result)
    
    # 3. 신뢰도 0.5 미만이면 재촬영 요청
    if confidence < 0.5:
        return {
            "status": "retry",
            "message": "이미지 품질이 낮습니다. 다시 촬영해주세요.",
            "confidence": confidence
        }
    
    # 4. 텍스트 파싱
    texts = parse_ocr_result(ocr_result)
    
    return {
        "status": "success",
        "confidence": confidence,
        "texts": texts
    }