import requests
import os
import uuid
import time
from dotenv import load_dotenv

load_dotenv()

CLOVA_OCR_API_URL = os.getenv("CLOVA_OCR_API_URL")
CLOVA_OCR_SECRET_KEY = os.getenv("CLOVA_OCR_SECRET_KEY")

def call_clova_ocr(image_url: str) -> dict:
    headers = {
        "X-OCR-SECRET": CLOVA_OCR_SECRET_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "version": "V2",
        "requestId": str(uuid.uuid4()),
        "timestamp": int(time.time() * 1000),
        "images": [
            {
                "format": "jpg",
                "url": image_url,
                "name": "ingredient_image"
            }
        ]
    }

    response = requests.post(CLOVA_OCR_API_URL, headers=headers, json=payload)
    return response.json()


# 이미지로 OCR 작동 테스트용
def call_clova_ocr_file(image_path: str) -> dict:
    headers = {
        "X-OCR-SECRET": CLOVA_OCR_SECRET_KEY
    }

    payload = {
        "version": "V2",
        "requestId": str(uuid.uuid4()),
        "timestamp": int(time.time() * 1000),
        "images": [
            {
                "format": "jpg",
                "name": "ingredient_image"
            }
        ]
    }

    with open(image_path, "rb") as f:
        files = {
            "message": (None, str(payload).replace("'", '"'), "application/json"),
            "file": f
        }
        response = requests.post(CLOVA_OCR_API_URL, headers=headers, files=files)
    
    return response.json()


if __name__ == "__main__":
    from ocr_parser import parse_ocr_result, calculate_confidence
    
    result = call_clova_ocr_file(r"C:\ez\특화 PJT\영양성분표.jpeg")
    
    # 파싱 결과 확인
    texts = parse_ocr_result(result)
    confidence = calculate_confidence(result)
    
    print("=== 추출된 텍스트 ===")
    for t in texts:
        print(t)
    print(f"\n=== 전체 신뢰도: {confidence} ===")