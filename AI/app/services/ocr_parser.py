def parse_ocr_result(ocr_result: dict) -> list:
    texts = []
    
    try:
        images = ocr_result.get("images", [])
        for image in images:
            fields = image.get("fields", [])
            for field in fields:
                text = field.get("inferText", "")
                confidence = field.get("inferConfidence", 0)
                if text:
                    texts.append({
                        "text": text,
                        "confidence": confidence
                    })

    except Exception as e:
        print(f"OCR 파싱 오류: {e}")

    return texts


def calculate_confidence(ocr_result: dict) -> float:
    try:
        images = ocr_result.get("images", [])
        confidences = []
        for image in images:
            fields = image.get("fields", [])
            for field in fields:
                confidences.append(field.get("inferConfidence", 0))
        if not confidences:
            return 0.0
        return sum(confidences) / len(confidences)
    
    except Exception as e:
        print(f"신뢰도 계산 오류: {e}")
        return 0.0