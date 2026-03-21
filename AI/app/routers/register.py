from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile

from app.schemas.pill_schema import RegisterCheckResponse, RegisterEmbeddingResponse
from app.services.register_service import run_register_check, run_register_embedding

router = APIRouter()


@router.post("/register/check", response_model=RegisterCheckResponse)
async def register_check(
    request: Request,
    image: UploadFile = File(...),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")

    try:
        file_bytes = await image.read()
        model_registry = request.app.state.model_registry
        return run_register_check(file_bytes, model_registry)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"register/check 처리 중 오류 발생: {str(e)}")


@router.post("/register/embedding", response_model=RegisterEmbeddingResponse)
async def register_embedding(
    request: Request,
    image: UploadFile = File(...),
    user_supplement_id: int | None = Form(default=None),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")

    try:
        file_bytes = await image.read()
        model_registry = request.app.state.model_registry

        return run_register_embedding(
            file_bytes=file_bytes,
            model_registry=model_registry,
            user_supplement_id=user_supplement_id,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"register/embedding 처리 중 오류 발생: {str(e)}")