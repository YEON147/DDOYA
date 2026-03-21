import cv2
import numpy as np

from app.schemas.pill_schema import RegisterCheckResponse, RegisterEmbeddingResponse
from app.services.embedding_service import build_reference_bundle
from app.services.quality_service import (
    evaluate_register_quality,
    validate_single_pill_detection,
)
from app.services.s3_service import save_reference_bundle
from app.services.yolo_service import crop_by_bbox, detect_pills


def _decode_image(file_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("이미지 파일을 읽을 수 없습니다.")

    return image


def run_register_check(
    file_bytes: bytes,
    model_registry,
) -> RegisterCheckResponse:
    image = _decode_image(file_bytes)

    quality_result = evaluate_register_quality(image)
    if not quality_result.success:
        return RegisterCheckResponse(
            success=False,
            message=quality_result.message,
        )

    detections = detect_pills(image, model_registry)
    is_valid, message = validate_single_pill_detection(image, detections)

    if not is_valid:
        return RegisterCheckResponse(
            success=False,
            message=message,
        )

    return RegisterCheckResponse(
        success=True,
        message="등록 가능한 이미지입니다.",
    )


def run_register_embedding(
    file_bytes: bytes,
    model_registry,
    user_supplement_id: int | None = None,
) -> RegisterEmbeddingResponse:
    image = _decode_image(file_bytes)

    quality_result = evaluate_register_quality(image)
    if not quality_result.success:
        return RegisterEmbeddingResponse(
            success=False,
            pillReferenceEmbeddingPath="",
            message=quality_result.message,
        )

    detections = detect_pills(image, model_registry)
    is_valid, message = validate_single_pill_detection(image, detections)

    if not is_valid:
        return RegisterEmbeddingResponse(
            success=False,
            pillReferenceEmbeddingPath="",
            message=message,
        )

    bbox = detections[0]["bbox"]
    crop_image = crop_by_bbox(image, bbox)

    bundle = build_reference_bundle(crop_image, model_registry)
    pill_reference_embedding_path = save_reference_bundle(
        bundle=bundle,
        user_supplement_id=user_supplement_id,
    )

    return RegisterEmbeddingResponse(
        success=True,
        pillReferenceEmbeddingPath=pill_reference_embedding_path,
        message="",
    )