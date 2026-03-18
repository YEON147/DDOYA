import requests
import os
import uuid
import time
from dotenv import load_dotenv

load_dotenv()

CLOVA_OCR_API_URL = os.getenv("CLOVA_OCR_API_URL")
CLOVA_OCR_SECRET_KEY = os.getenv("CLOVA_OCR_SECRET_KEY")


def call_clova_ocr(image_path: str) -> dict:
    ext = os.path.splitext(image_path)[1].replace(".", "").lower()
    
    headers = {
        "X-OCR-SECRET": CLOVA_OCR_SECRET_KEY
    }

    payload = {
        "version": "V2",
        "requestId": str(uuid.uuid4()),
        "timestamp": int(time.time() * 1000),
        "images": [
            {
                "format": ext,
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