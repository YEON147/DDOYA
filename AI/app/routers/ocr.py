from fastapi import APIRouter, UploadFile, File, Form
from app.services.ocr_service import call_clova_ocr
from app.services.ocr_parser import parse_ocr_result, calculate_confidence
from app.services.openai_service import analyze_supplement_label, determine_body_part_id
import tempfile
import os

router = APIRouter()


@router.post("/analyze")
async def analyze_ocr(file: UploadFile = File(...)):
    # 1. 업로드된 파일을 임시 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # 2. Clova OCR 호출
        ocr_result = call_clova_ocr(tmp_path)

        # 3. 신뢰도 계산
        confidence = calculate_confidence(ocr_result)

        # 4. 신뢰도 0.5 미만이면 재촬영 요청
        if confidence < 0.5:
            return {
                "success": False,
                "message": "이미지 품질이 낮습니다. 다시 촬영해주세요.",
                "data": None
            }

        # 5. 텍스트 파싱
        texts = parse_ocr_result(ocr_result)

        # 임시 텍스트 확인 코드
        print("=== LLM에 넘어가는 텍스트 ===")
        print(" ".join([t["text"] for t in texts]))

        # 6. LLM으로 한번에 분석
        llm_result = analyze_supplement_label(texts)

        # 7. 신체부위 처리
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
        # 8. 임시 파일 삭제
        os.unlink(tmp_path)