import cv2
import numpy as np


def _find_largest_contour(binary: np.ndarray):
    contours_info = cv2.findContours(
        binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )
    contours = contours_info[0] if len(contours_info) == 2 else contours_info[1]

    if not contours:
        return None

    return max(contours, key=cv2.contourArea)


def extract_auxiliary_features(crop_image: np.ndarray) -> dict[str, np.ndarray]:
    """
    복용 인증 2차 판별에 사용할 수 있도록
    등록 단계에서 색상/모양 보조 특징을 추출한다.

    저장 예시:
    - mean_hsv
    - hue_hist
    - shape_vector(aspect_ratio, area_ratio, circularity)
    """
    hsv = cv2.cvtColor(crop_image, cv2.COLOR_BGR2HSV)

    mean_hsv = hsv.reshape(-1, 3).mean(axis=0).astype(np.float32)

    hue_hist = cv2.calcHist([hsv], [0], None, [12], [0, 180]).flatten().astype(np.float32)
    hue_hist = hue_hist / (hue_hist.sum() + 1e-12)

    gray = cv2.cvtColor(crop_image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    _, binary = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )
    binary_inv = cv2.bitwise_not(binary)

    contour_a = _find_largest_contour(binary)
    contour_b = _find_largest_contour(binary_inv)

    contour = None
    area_a = cv2.contourArea(contour_a) if contour_a is not None else 0.0
    area_b = cv2.contourArea(contour_b) if contour_b is not None else 0.0

    contour = contour_a if area_a >= area_b else contour_b

    crop_h, crop_w = crop_image.shape[:2]
    crop_area = float(max(1, crop_h * crop_w))

    if contour is None:
        shape_vector = np.array([1.0, 0.0, 0.0], dtype=np.float32)
    else:
        x, y, w, h = cv2.boundingRect(contour)
        contour_area = float(cv2.contourArea(contour))
        perimeter = float(cv2.arcLength(contour, True))

        aspect_ratio = float(w / max(1, h))
        area_ratio = float(contour_area / crop_area)
        circularity = float((4.0 * np.pi * contour_area) / ((perimeter ** 2) + 1e-12))

        shape_vector = np.array(
            [aspect_ratio, area_ratio, circularity],
            dtype=np.float32,
        )

    return {
        "mean_hsv": mean_hsv,
        "hue_hist": hue_hist,
        "shape_vector": shape_vector,
    }