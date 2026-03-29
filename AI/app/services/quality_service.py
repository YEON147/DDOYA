from dataclasses import dataclass

import cv2
import numpy as np

from app.core.config import settings


@dataclass
class QualityCheckResult:
    success: bool
    message: str
    blur_score: float
    brightness: float
    contrast: float


def evaluate_register_quality(image: np.ndarray) -> QualityCheckResult:
    """
    등록/인증 공용 기본 품질 검사
    너무 타이트하지 않게 완화했고,
    ENABLE_QUALITY_CHECK=false면 품질 검사 자체를 통과시킨다.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(gray.mean())
    contrast = float(gray.std())

    if not settings.ENABLE_QUALITY_CHECK:
        return QualityCheckResult(
            success=True,
            message="",
            blur_score=blur_score,
            brightness=brightness,
            contrast=contrast,
        )

    if blur_score < settings.BLUR_THRESHOLD:
        return QualityCheckResult(
            success=False,
            message="촬영 품질이 낮아 재촬영이 필요합니다.",
            blur_score=blur_score,
            brightness=brightness,
            contrast=contrast,
        )

    if brightness < settings.BRIGHTNESS_MIN:
        return QualityCheckResult(
            success=False,
            message="촬영 품질이 낮아 재촬영이 필요합니다.",
            blur_score=blur_score,
            brightness=brightness,
            contrast=contrast,
        )

    if brightness > settings.BRIGHTNESS_MAX:
        return QualityCheckResult(
            success=False,
            message="촬영 품질이 낮아 재촬영이 필요합니다.",
            blur_score=blur_score,
            brightness=brightness,
            contrast=contrast,
        )

    if contrast < settings.CONTRAST_MIN:
        return QualityCheckResult(
            success=False,
            message="촬영 품질이 낮아 재촬영이 필요합니다.",
            blur_score=blur_score,
            brightness=brightness,
            contrast=contrast,
        )

    return QualityCheckResult(
        success=True,
        message="",
        blur_score=blur_score,
        brightness=brightness,
        contrast=contrast,
    )


def validate_single_pill_detection(
    image: np.ndarray,
    detections: list[dict],
) -> tuple[bool, str]:
    """
    등록용 사진은 알약 1개만 있어야 한다.
    """
    detected_count = len(detections)

    if detected_count == 0:
        return False, "알약이 검출되지 않았습니다."

    if detected_count != 1:
        return False, "등록용 이미지는 알약 1개만 촬영해야 합니다."

    h, w = image.shape[:2]
    image_area = float(h * w)

    x1, y1, x2, y2 = detections[0]["bbox"]
    bbox_area = float(max(0, x2 - x1) * max(0, y2 - y1))

    if image_area > 0 and (bbox_area / image_area) < settings.SMALL_BBOX_AREA_RATIO:
        return False, "알약이 너무 작게 촬영되었습니다. 더 가까이 촬영해주세요."

    return True, ""