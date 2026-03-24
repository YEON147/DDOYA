from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.services.ocr_service import call_clova_ocr
from app.services.ocr_parser import parse_ocr_result, calculate_confidence
from app.services.openai_service import analyze_supplement_label, determine_body_part_id
from app.db import get_db
import tempfile
import os

router = APIRouter()


def load_ingredient_list(db: Session) -> list:
    """DB에서 ingredient_id, normalized_name 목록 로드"""
    result = db.execute(
        text("SELECT ingredient_id, normalized_name FROM ingredient_master")
    ).fetchall()
    return [{"ingredient_id": row[0], "normalized_name": row[1]} for row in result]


@router.post("/analyze")
async def analyze_ocr(file: UploadFile = File(...), db: Session = Depends(get_db)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        ocr_result = call_clova_ocr(tmp_path)
        confidence = calculate_confidence(ocr_result)

        if confidence < 0.5:
            return {
                "success": False,
                "message": "이미지 품질이 낮습니다. 다시 촬영해주세요.",
                "data": None
            }

        texts = parse_ocr_result(ocr_result)

        print("=== LLM에 넘어가는 텍스트 ===")
        print(" ".join([t["text"] for t in texts]))

        # DB 성분 목록 로드
        ingredient_list = load_ingredient_list(db)

        # LLM 분석 (ingredient_id 매칭 포함)
        llm_result = analyze_supplement_label(texts, ingredient_list)

        body_part_id = llm_result.get("body_part_id")
        if not body_part_id:
            body_part_id = determine_body_part_id(llm_result["ingredients"])

        return {
            "success": True,
            "message": "OCR 분석이 완료되었습니다.",
            "data": {
                "ocr_confidence": round(confidence, 2),
                "body_part_id": body_part_id,
                "serving_info": llm_result["serving_info"],
                "ingredients": llm_result["ingredients"]
            }
        }

    finally:
        os.unlink(tmp_path)