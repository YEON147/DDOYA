import json

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile

from app.schemas.pill_schema import ExpectedItem, VerifyResponse
from app.services.verify_service import run_verify

router = APIRouter()


@router.post("/verify", response_model=VerifyResponse)
async def verify_pills(
    request: Request,
    image_file: UploadFile = File(...),
    expected_items_json: str = Form(...),
    schedule_id: int | None = Form(default=None),
):
    """
    verify는 파일 업로드 + 리스트를 같이 받아야 하므로
    expected_items는 JSON 문자열 form field로 받는다.
    """
    if not image_file.content_type or not image_file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")

    try:
        expected_items_raw = json.loads(expected_items_json)

        if not isinstance(expected_items_raw, list):
            raise ValueError("expected_items_json은 배열 형태여야 합니다.")

        expected_items = [ExpectedItem(**item) for item in expected_items_raw]

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"expected_items_json 형식이 올바르지 않습니다: {str(e)}"
        )

    try:
        file_bytes = await image_file.read()
        model_registry = request.app.state.model_registry

        return run_verify(
            file_bytes=file_bytes,
            expected_items=expected_items,
            model_registry=model_registry,
            schedule_id=schedule_id,
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"verify 처리 중 오류 발생: {str(e)}")