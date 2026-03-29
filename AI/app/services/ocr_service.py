import requests
import os
import uuid
import time
import tempfile
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.services.ocr_parser import parse_ocr_result, calculate_confidence
from app.services.openai_service import analyze_supplement_label, determine_body_part_id
from app.services.image_processor import dewarp_cylinder

load_dotenv()

CLOVA_OCR_API_URL = os.getenv("CLOVA_OCR_API_URL")
CLOVA_OCR_SECRET_KEY = os.getenv("CLOVA_OCR_SECRET_KEY")


def call_clova_ocr(image_path: str) -> dict:
    ext = os.path.splitext(image_path)[1].replace(".", "").lower()
    
    headers = {
        "X-OCR-SECRET": CLOVA_OCR_SECRET_KEY
    }

    payload = {
        "version": "V2",
        "requestId": str(uuid.uuid4()),
        "timestamp": int(time.time() * 1000),
        "images": [
            {
                "format": ext,
                "name": "ingredient_image"
            }
        ]
    }

    with open(image_path, "rb") as f:
        files = {
            "message": (None, str(payload).replace("'", '"'), "application/json"),
            "file": f
        }
        response = requests.post(CLOVA_OCR_API_URL, headers=headers, files=files)

    return response.json()


def load_ingredient_list(db: Session) -> list:
    """DB에서 ingredient_id, normalized_name 목록 로드"""
    result = db.execute(
        text("SELECT ingredient_id, normalized_name FROM ingredient_master")
    ).fetchall()
    return [{"ingredient_id": row[0], "normalized_name": row[1]} for row in result]


async def process_supplement_image(file_content: bytes, filename: str, db: Session) -> dict:
    """OCR 처리 전체 파이프라인"""
    ext = os.path.splitext(filename)[1]
    if not ext:
        ext = ".jpg"

    tmp_path = ""
    dewarped_path = None

    try:
        # 1. 메모리에 있는 파일 바이너리를 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name

        # 2. 원통형 라벨 평탄화 (Dewarping) 전처리 적용
        dewarped_path = dewarp_cylinder(tmp_path)
        
        # 3. 평탄화된 이미지로 OCR 분석 수행
        ocr_result = call_clova_ocr(dewarped_path)
        confidence = calculate_confidence(ocr_result)

        if confidence < 0.5:
            return {
                "success": False,
                "message": "이미지 인식률이 너무 낮습니다. 밝은 곳에서 글자가 잘 보이게 다시 촬영해주세요."
            }

        texts = parse_ocr_result(ocr_result)

        print("=== LLM에 넘어가는 텍스트 ===")
        print(" ".join([t["text"] for t in texts]))

        # 4. DB 성분 목록 로드
        ingredient_list = load_ingredient_list(db)

        # 5. LLM 분석 (ingredient_id 매칭 포함)
        llm_result = analyze_supplement_label(texts, ingredient_list)

        # 6. 신체 부위 최종 판단
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
        
    except Exception as e:
        print(f"[OCR 파이프라인 예외 발생] {e}")
        return {
            "success": False,
            "message": "이미지를 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 이미지를 다시 촬영해주세요."
        }
        
    finally:
        # 7. 예외가 터져도 임시 파일들은 무조건 정리되도록 방어
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
        if dewarped_path and dewarped_path != tmp_path and os.path.exists(dewarped_path):
            try:
                os.unlink(dewarped_path)
            except Exception:
                pass