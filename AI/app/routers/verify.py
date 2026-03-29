import json

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile

from app.schemas.pill_schema import ExpectedItem, VerifyResponse
from app.services.verify_service import run_verify

router = APIRouter()


@router.post(
    "/verify",
    response_model=VerifyResponse,
    response_model_exclude_none=True,
)
async def verify_pills(
    request: Request,
    file: UploadFile = File(...),
    expected_items: str = Form(...),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")

    try:
        expected_items_raw = json.loads(expected_items)

        if not isinstance(expected_items_raw, list):
            raise ValueError("expected_items는 배열 형태여야 합니다.")

        parsed_expected_items = [ExpectedItem(**item) for item in expected_items_raw]

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"expected_items 형식이 올바르지 않습니다: {str(e)}"
        )

    try:
        file_bytes = await file.read()
        model_registry = request.app.state.model_registry

        return run_verify(
            file_bytes=file_bytes,
            expected_items=parsed_expected_items,
            model_registry=model_registry,
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"verify 처리 중 오류 발생: {str(e)}")