import numpy as np


def detect_pills(image: np.ndarray, model_registry) -> list[dict]:
    """
    YOLO로 알약 bbox를 추출한다.
    반환 형식:
    [
        {
            "bbox": [x1, y1, x2, y2],
            "confidence": 0.91
        },
        ...
    ]
    """
    results = model_registry.yolo_model.predict(
        source=image,
        conf=getattr(model_registry, "yolo_conf_threshold", 0.25),
        verbose=False,
    )

    detections: list[dict] = []

    if not results:
        return detections

    result = results[0]
    if result.boxes is None or len(result.boxes) == 0:
        return detections

    boxes = result.boxes.xyxy.cpu().numpy().astype(int)
    confs = result.boxes.conf.cpu().numpy()

    for box, conf in zip(boxes, confs):
        detections.append(
            {
                "bbox": box.tolist(),
                "confidence": float(conf),
            }
        )

    return detections


def crop_by_bbox(
    image: np.ndarray,
    bbox: list[int],
    pad_ratio: float = 0.05,
) -> np.ndarray:
    """
    bbox 기준으로 crop을 생성한다.
    pad_ratio만큼 여유를 줘서 너무 딱 맞게 자르지 않도록 한다.
    """
    h, w = image.shape[:2]
    x1, y1, x2, y2 = bbox

    box_w = max(1, x2 - x1)
    box_h = max(1, y2 - y1)

    pad_x = int(box_w * pad_ratio)
    pad_y = int(box_h * pad_ratio)

    nx1 = max(0, x1 - pad_x)
    ny1 = max(0, y1 - pad_y)
    nx2 = min(w, x2 + pad_x)
    ny2 = min(h, y2 + pad_y)

    return image[ny1:ny2, nx1:nx2].copy()