import cv2
import numpy as np

from app.schemas.pill_schema import VerifyResponse, VerifyResultItem
from app.services.aggregation_service import aggregate_verify_results
from app.services.embedding_service import extract_dinov2_embedding
from app.services.feature_service import extract_auxiliary_features
from app.services.quality_service import evaluate_register_quality
from app.services.s3_service import load_reference_bundle
from app.services.similarity_service import match_crop_against_expected_items
from app.services.yolo_service import crop_by_bbox, detect_pills
from app.core.config import settings


def _decode_image(file_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("이미지 파일을 읽을 수 없습니다.")

    return image


def _box_area(box: list[int]) -> int:
    x1, y1, x2, y2 = box
    return max(0, x2 - x1) * max(0, y2 - y1)


def _intersection_area(box1: list[int], box2: list[int]) -> int:
    ax1, ay1, ax2, ay2 = box1
    bx1, by1, bx2, by2 = box2

    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)

    if ix2 <= ix1 or iy2 <= iy1:
        return 0

    return (ix2 - ix1) * (iy2 - iy1)


def _is_mostly_contained(inner_box: list[int], outer_box: list[int], thresh: float) -> bool:
    inner_area = _box_area(inner_box)
    if inner_area == 0:
        return False

    inter = _intersection_area(inner_box, outer_box)
    return (inter / inner_area) >= thresh


def _filter_verify_detections(detections: list[dict]) -> list[dict]:
    candidates = sorted(
        detections,
        key=lambda x: x["confidence"],
        reverse=True,
    )

    selected = []

    for det in candidates:
        box = det["bbox"]

        x1, y1, x2, y2 = box
        w = x2 - x1
        h = y2 - y1
        area = w * h

        if w < settings.VERIFY_MIN_W or h < settings.VERIFY_MIN_H or area < settings.VERIFY_MIN_AREA:
            continue

        skip = False
        for sel in selected:
            sel_box = sel["bbox"]
            if _box_area(sel_box) >= area and _is_mostly_contained(
                box,
                sel_box,
                settings.CONTAIN_THRESH,
            ):
                skip = True
                break

        if not skip:
            selected.append(det)

    if selected:
        largest_area = max(_box_area(item["bbox"]) for item in selected)
        filtered_selected = []

        for item in selected:
            area = _box_area(item["bbox"])
            if area < largest_area * settings.RELATIVE_AREA_THRESH:
                continue
            filtered_selected.append(item)

        selected = filtered_selected

    return selected


def run_verify(
    file_bytes: bytes,
    expected_items,
    model_registry,
) -> VerifyResponse:
    image = _decode_image(file_bytes)

    quality_result = evaluate_register_quality(image)
    if not quality_result.success:
        return VerifyResponse(
            success=False,
            message=quality_result.message,
            results=None,
        )

    raw_detections = detect_pills(image, model_registry)
    filtered_detections = _filter_verify_detections(raw_detections)

    if not filtered_detections:
        return VerifyResponse(
            success=False,
            message="알약이 검출되지 않았습니다.",
            results=None,
        )

    reference_candidates = []
    for item in expected_items:
        bundle = load_reference_bundle(item.pill_reference_embedding_path)
        reference_candidates.append(
            {
                "user_supplement_id": item.user_supplement_id,
                "bundle": bundle,
            }
        )

    crop_results = []

    for crop_id, det in enumerate(filtered_detections):
        bbox = det["bbox"]
        crop_image = crop_by_bbox(image, bbox)

        if crop_image is None or crop_image.size == 0:
            continue

        query_embedding = extract_dinov2_embedding(crop_image, model_registry)
        query_features = extract_auxiliary_features(crop_image)

        matched = match_crop_against_expected_items(
            query_embedding=query_embedding,
            query_features=query_features,
            reference_candidates=reference_candidates,
            top_k=settings.TOPK,
        )

        crop_results.append(
            {
                "crop_id": crop_id,
                "bbox": bbox,
                "final_user_supplement_id": matched["final_user_supplement_id"],
                "final_confidence": matched["final_confidence"],
            }
        )

    if not crop_results:
        return VerifyResponse(
            success=False,
            message="알약 이미지 처리에 실패했습니다.",
            results=None,
        )

    aggregated_results = aggregate_verify_results(expected_items, crop_results)

    result_items = [
        VerifyResultItem(**item)
        for item in aggregated_results
    ]

    return VerifyResponse(
        success=True,
        message="",
        results=result_items,
    )