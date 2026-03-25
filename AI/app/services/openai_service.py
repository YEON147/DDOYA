import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GMS_API_KEY"),
    base_url=os.getenv("GMS_OPENAI_BASE_URL")
)

def _parse_json(content: str) -> dict:
    """LLM이 반환한 JSON 문자열에서 마크다운 백틱을 제거하고 파싱"""
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    return json.loads(content.strip())


def analyze_supplement_label(ocr_texts: list, ingredient_list: list) -> dict:
    """
    - serving_info 추출
    - 성분명 + 함량 추출
    - ingredient_id 매칭
    - 신체부위 명시 여부 확인
    - 주요 성분 3개 판단
    """
    raw_text = " ".join([t["text"] for t in ocr_texts])

    # DB 성분 목록 텍스트로 변환
    ingredient_map_text = "\n".join(
        [f"- ingredient_id {i['ingredient_id']}: {i['normalized_name']}" for i in ingredient_list]
    )

    prompt = f"""
    아래는 영양제 성분표에서 OCR로 추출한 텍스트입니다.
    텍스트 순서가 뒤섞여 있을 수 있으니 주의하세요.
    아래 JSON 형식으로만 응답하세요. 다른 말은 절대 하지 마세요.

    텍스트: {raw_text}

    [성분표 파싱 규칙]
    - 성분명과 함량이 뒤섞여 있을 수 있습니다
    - "열량", "탄수화물", "단백질", "지방", "나트륨"은 제외하세요
    - original_name은 성분표 하단 표에 적힌 이름 기준입니다 (예: "EPA와DHA의 합", "루테인", "비타민A")
    - 기능정보 설명문(예: "눈 건강에 도움", "혈행 개선")은 성분명이 아닙니다
    - 성분명 뒤에 바로 오는 숫자+단위가 해당 성분의 함량입니다
    - 단위가 없거나 0인 성분은 amount를 0으로 설정하세요


    [등록된 성분 목록]
    {ingredient_map_text}

    분석 항목:
    1. serving_info:
       - daily_dose: 1일 섭취횟수 (정보 없으면 1로 설정)
       - dose_per_intake: 1회 섭취량, 함량이 아닌 개수 (예: 2, 1 등 숫자만)
    2. ingredients: 열량/탄수화물/단백질/지방/나트륨 제외한 영양 성분 추출
       - original_name: 성분표에 표기된 원래 성분명
       - ingredient_id: 위 등록된 성분 목록에서 가장 유사한 항목의 ingredient_id, 없으면 null
       - amount: 1일 섭취량 기준으로 계산된 함량 (숫자만)
       - unit: 단위 (mg, g, μg, μg RAE, mg α-TE, mg NE, μg DFE, CFU, IU 등)
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
            "dose_per_intake": 1
        }},
        "ingredients": [
            {{
                "original_name": "Vitamin C",
                "ingredient_id": 5,
                "amount": 500,
                "unit": "mg",
                "is_primary": 1
            }}
        ],
        "body_part_id": 2
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )

    return _parse_json(response.choices[0].message.content)


def determine_body_part_id(ingredients: list) -> int:
    """
    성분 목록 전체를 받아서 주요 작용 신체부위 ID 판단
    """
    ingredient_text = "\n".join(
        [f"- {i['original_name']} {i['amount']}{i['unit']}" for i in ingredients]
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
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=10
    )

    return int(response.choices[0].message.content.strip())


# ── 레포트 생성용 LLM 함수 ──────────────────────────────────

def select_top_deficient_ingredients(
    tied_ingredients: list[dict],
    slots: int,
    gender: str,
    age: int,
) -> list[dict]:
    """
    부족비율이 동일한 성분들 중에서 사용자 맥락에 맞는 상위 N개 성분 선정
    """
    ing_text = "\n".join(
        [f"- {d['normalized_ingredient_name']} (부족량: {d.get('deficiency_amount', 0)}{d['unit']})" for d in tied_ingredients]
    )

    prompt = f"""
    다음은 부족 비율이 동일한 영양 성분 목록입니다.
    사용자 정보: 성별={gender}, 나이={age}세

    성분 목록:
    {ing_text}

    이 사용자에게 가장 시급하게 보충이 필요한 성분 {slots}개를 선정해주세요.
    건강 중요도, 결핍 시 위험성, 해당 연령/성별에서의 필요성을 고려하세요.

    아래 JSON 형식으로만 응답하세요. 다른 말은 절대 하지 마세요.
    응답 형식:
    {{
        "selected": ["성분명1", "성분명2"]
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200
    )

    result = _parse_json(response.choices[0].message.content)
    selected_names = result.get("selected", [])

    return [d for d in tied_ingredients if d["normalized_ingredient_name"] in selected_names][:slots]


def match_product_types(
    deficient_names: list[str],
    product_types: list[str],
) -> dict:
    """
    부족 성분명 → products 테이블의 product_type 매핑.
    product_type이 정규화 성분명과 다르고 복합제품도 존재하므로 LLM이 매핑.
    반환: {성분명: product_type}
    """
    types_text = "\n".join([f"- {pt}" for pt in product_types])
    names_text = "\n".join([f"- {n}" for n in deficient_names])

    prompt = f"""
    아래 부족한 영양 성분 각각에 대해, 가장 적합한 제품 유형(product_type)을 매칭해주세요.

    [부족 성분 목록]
    {names_text}

    [사용 가능한 제품 유형(product_type) 목록]
    {types_text}

    규칙:
    - 각 성분에 대해 가장 관련성 높은 product_type 1개를 매핑하세요
    - 복합제품보다는 해당 성분에 특화된 유형을 우선하세요
    - 정확히 일치하지 않아도 가장 유사한 것을 선택하세요

    아래 JSON 형식으로만 응답하세요. 다른 말은 절대 하지 마세요.
    응답 형식:
    {{
        "mapping": {{
            "성분명": "product_type",
            "성분명2": "product_type2"
        }}
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500
    )

    result = _parse_json(response.choices[0].message.content)
    return result.get("mapping", {})


def generate_report_comments(
    analysis: list[dict],
    recommended_products: list[dict],
    timing_recommendations: list[dict],
    gender: str,
    age: int,
) -> dict:
    """
    분석 결과를 바탕으로 레포트 수준의 4종 코멘트 생성.
    각 코멘트에 분석 근거와 이유를 포함.
    """
    # 과잉/부족 성분 분류
    excess = [a for a in analysis if a["analysis_type"] == "EXCESS"]
    deficient = [a for a in analysis if a["analysis_type"] == "DEFICIENCY"]
    normal = [a for a in analysis if a["analysis_type"] == "NORMAL"]

    analysis_text = json.dumps(analysis, ensure_ascii=False, indent=2)
    products_text = json.dumps(recommended_products, ensure_ascii=False, indent=2)
    timing_text = json.dumps(timing_recommendations, ensure_ascii=False, indent=2)

    prompt = f"""
    당신은 영양 전문가입니다.
    아래 분석 데이터를 바탕으로 사용자 맞춤형 레포트 코멘트 4종을 작성하세요.

    사용자: 성별={gender}, 나이={age}세
    과잉 성분 수: {len(excess)}개
    부족 성분 수: {len(deficient)}개
    정상 성분 수: {len(normal)}개

    [성분 분석 결과]
    {analysis_text}

    [추천 제품]
    {products_text}

    [섭취 타이밍 추천]
    {timing_text}

    각 코멘트 작성 규칙:
    1. excess_comment: 과잉 성분이 있으면 어떤 성분이 얼마나 초과인지, 건강에 미치는 영향과 감량 방법을 구체적으로 안내. 과잉 성분이 없으면 과장하지 않고 "과잉 섭취된 성분이 없어 정말 다행이에요! 지금처럼 건강하게 관리해봐요!" 정도로 짧고 밝게 작성.
    2. deficiency_comment: 부족 성분별로 현재 섭취량과 권장량을 수치로 비교하고, 해당 성분이 부족하면 건강에 어떤 영향이 있는지 설명. 
    3. product_comment: 추천 제품마다 왜 이 제품이 적합한지 이유를 설명. 성분 함량, 흡수율, 조합의 장점 등. (아예 안 먹고 있는 성분이 추천된 경우에도 그 점을 짚어줌)
    4. schedule_comment: 각 영양제의 섭취 타이밍 배치 이유를 설명. 지용성/수용성 특성, 상호작용, 흡수율 관점에서 근거 제시.

    어투 및 캐릭터 설정:
    당신의 이름은 '또야'이며 귀여운 다람쥐 캐릭터입니다. 
    전문적이면서도, 사용자에게 친근하고 다정한 존댓말로 작성하세요. ("~해요!", "~합니당", "또야가 보기에~" 등 가볍고 부드러운 말투 사용)
    아래 JSON 형식으로만 응답하세요. 다른 말은 절대 하지 마세요.
    응답 형식:
    {{
        "excess_comment": "...",
        "deficiency_comment": "...",
        "product_comment": "...",
        "schedule_comment": "..."
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000
    )

    return _parse_json(response.choices[0].message.content)