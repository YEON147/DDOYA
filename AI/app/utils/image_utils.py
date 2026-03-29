from __future__ import annotations

import json
from typing import Any

import cv2
import numpy as np
from fastapi import HTTPException


def decode_image(file_bytes: bytes) -> np.ndarray:
    buffer = np.frombuffer(file_bytes, dtype=np.uint8)
    image = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("이미지 디코딩에 실패했습니다.")
    return image


def bgr_to_rgb(image_bgr: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)


def safe_crop(image: np.ndarray, bbox: list[int]) -> np.ndarray:
    h, w = image.shape[:2]
    x1, y1, x2, y2 = bbox
    x1 = max(0, min(x1, w))
    x2 = max(0, min(x2, w))
    y1 = max(0, min(y1, h))
    y2 = max(0, min(y2, h))
    if x2 <= x1 or y2 <= y1:
        raise ValueError("유효하지 않은 bbox 입니다.")
    return image[y1:y2, x1:x2].copy()


def encode_image_to_jpg_bytes(image: np.ndarray, quality: int = 95) -> bytes:
    ok, encoded = cv2.imencode(".jpg", image, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        raise ValueError("이미지 인코딩에 실패했습니다.")
    return encoded.tobytes()


def parse_json_form(raw: str, field_name: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f"{field_name} JSON 파싱 실패") from exc
