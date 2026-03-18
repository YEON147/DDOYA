import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GMS_API_KEY"),
    base_url=os.getenv("GMS_OPENAI_BASE_URL")
)

BODY_PART_MAP = {
    "뇌 · 신경계": 1,
    "눈 · 귀 · 구강 (감각기관)": 2,
    "심장 · 혈관 · 혈액 (심혈관계)": 3,
    "폐 · 호흡기": 4,
    "위 · 장 · 소화기관": 5,
    "간 · 췌장 · 담낭 (대사기관)": 6,
    "신장 · 방광 · 요로": 7,
    "뼈 · 관절 · 근육 (근골격계)": 8,
    "피부 · 모발 · 손톱": 9,
    "호르몬 · 생식 · 면역계": 10
}


def analyze_supplement_label(ocr_texts: list) -> dict:
    """
    - serving_info 추출
    - 성분명 + 함량 추출
    - 신체부위 명시 여부 확인
    - 주요 성분 3개 판단
    """
    raw_text = " ".join([t["text"] for t in ocr_texts])

    prompt = f"""
    아래는 영양제 성분표에서 OCR로 추출한 텍스트입니다.
    텍스트 순서가 뒤섞여 있을 수 있으니 주의하세요.
    아래 JSON 형식으로만 응답하세요. 다른 말은 절대 하지 마세요.

    텍스트: {raw_text}

    분석 항목:
    1. serving_info:
       - daily_dose: 1일 섭취횟수 (정보 없으면 1로 설정)
       - dose_per_intake: 1회 섭취량, 함량이 아닌 개수 (예: 2정, 1캡슐 등으로 표현된 숫자)
    2. ingredients: 열량/탄수화물/단백질/지방/나트륨 제외한 영양 성분 추출
       - original_name: 성분표에 표기된 원래 성분명
       - normalized_name: 한글 정규화 성분명 (영어면 한글로 변환)
       - amount: 1일 섭취량 기준으로 계산된 함량 (숫자만)
       - unit: 단위 (mg, g, μg, IU 등)
       - is_primary: 함량 기준 상위 3개 성분은 1, 나머지는 0
    3. body_part_id: 성분표에 신체부위/효능이 명시되어 있으면 아래 번호로 반환, 없으면 null
       1: 뇌 · 신경계
       2: 눈 · 귀 · 구강 (감각기관)
       3: 심장 · 혈관 · 혈액 (심혈관계)
       4: 폐 · 호흡기
       5: 위 · 장 · 소화기관
       6: 간 · 췌장 · 담낭 (대사기관)
       7: 신장 · 방광 · 요로
       8: 뼈 · 관절 · 근육 (근골격계)
       9: 피부 · 모발 · 손톱
       10: 호르몬 · 생식 · 면역계

    응답 형식:
    {{
        "serving_info": {{
            "daily_dose": 1,
            "dose_per_intake": 2
        }},
        "ingredients": [
            {{
                "original_name": "Vitamin C",
                "normalized_name": "비타민C",
                "amount": 500,
                "unit": "mg",
                "is_primary": 1
            }}
        ],
        "body_part_id": 2
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )

    result = response.choices[0].message.content.strip()
    return json.loads(result)


def determine_body_part_id(ingredients: list) -> int:
    """
    성분 목록 전체를 받아서 주요 작용 신체부위 ID 판단
    """
    ingredient_text = "\n".join(
        [f"- {i['normalized_name']} {i['amount']}{i['unit']}" for i in ingredients]
    )

    prompt = f"""
    다음은 영양제에 포함된 성분 목록입니다.
    이 영양제가 주로 작용하는 신체부위를 아래 번호 중 하나만 숫자로만 답해주세요.
    다른 말은 절대 하지 마세요.

    성분 목록:
    {ingredient_text}

    1: 뇌 · 신경계
    2: 눈 · 귀 · 구강 (감각기관)
    3: 심장 · 혈관 · 혈액 (심혈관계)
    4: 폐 · 호흡기
    5: 위 · 장 · 소화기관
    6: 간 · 췌장 · 담낭 (대사기관)
    7: 신장 · 방광 · 요로
    8: 뼈 · 관절 · 근육 (근골격계)
    9: 피부 · 모발 · 손톱
    10: 호르몬 · 생식 · 면역계
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=10
    )

    return int(response.choices[0].message.content.strip())