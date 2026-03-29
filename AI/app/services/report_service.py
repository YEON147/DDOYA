from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.services.openai_service import (
    select_top_deficient_ingredients,
    match_product_types,
    generate_report_comments,
)

# ── 단위 변환 ──────────────────────────────────────────────
UNIT_TO_MG = {
    "g": 1000.0,
    "mg": 1.0,
    "μg": 0.001,
    "ug": 0.001,
    "mcg": 0.001,
    "μg RAE": 0.001,
    "μg DFE": 0.001,
    "mg α-TE": 1.0,
    "mg NE": 1.0,
    "IU": None,  # 성분마다 환산값이 다름 → 별도 처리
}

IU_TO_MG = {
    "비타민D": 0.025 * 0.001,       # 1 IU = 0.025 μg = 0.000025 mg
    "비타민A": 0.3 * 0.001,         # 1 IU(retinol) = 0.3 μg = 0.0003 mg
    "비타민E": 0.67 * 1.0,          # 1 IU(d-α-tocopherol) ≈ 0.67 mg
}


def _convert_to_mg(amount: float, from_unit: str, ingredient_name: str = "") -> float:
    """입력 amount를 mg 기준으로 변환"""
    from_unit_lower = from_unit.strip()

    factor = UNIT_TO_MG.get(from_unit_lower)
    if factor is not None:
        return amount * factor

    # IU 처리
    if from_unit_lower.upper() == "IU":
        for name_key, iu_factor in IU_TO_MG.items():
            if name_key in ingredient_name:
                return amount * iu_factor
        return amount  # 매핑 못 찾으면 그대로 반환

    # CFU 등 변환 불가 단위는 그대로
    return amount


def _convert_from_mg(amount_mg: float, to_unit: str, ingredient_name: str = "") -> float:
    """mg 기준 값을 target_unit으로 변환"""
    factor = UNIT_TO_MG.get(to_unit.strip())
    if factor is not None and factor != 0:
        return amount_mg / factor

    if to_unit.strip().upper() == "IU":
        for name_key, iu_factor in IU_TO_MG.items():
            if name_key in ingredient_name:
                return amount_mg / iu_factor if iu_factor != 0 else amount_mg
        return amount_mg

    return amount_mg


# ── 나이 계산 ──────────────────────────────────────────────
def _calculate_age(birth_date_str: str) -> int:
    birth = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
    today = date.today()
    return today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))


# ── RI/UL 컬럼 선택 ───────────────────────────────────────
def _get_ri_ul_columns(gender: str, age: int) -> tuple[str, str]:
    if age < 19:
        return "ri_non_adult", "ul_non_adult"
    if gender.upper() == "MALE":
        return "ri_adult_m", "ul_adult_m"
    return "ri_adult_f", "ul_adult_f"


# ── DB 조회 ────────────────────────────────────────────────
def _load_ingredient_master(db: Session, ingredient_ids: list[int] | None = None) -> dict:
    """ingredient_master 테이블에서 성분 정보 조회. ingredient_ids가 비면 전체 조회."""
    if ingredient_ids:
        placeholders = ", ".join([f":id_{i}" for i in range(len(ingredient_ids))])
        params = {f"id_{i}": iid for i, iid in enumerate(ingredient_ids)}
        where_clause = f"WHERE ingredient_id IN ({placeholders})"
    else:
        params = {}
        where_clause = ""

    result = db.execute(
        text(
            f"SELECT ingredient_id, normalized_name, "
            f"ri_adult_m, ri_adult_f, ri_non_adult, ri_pregnant, "
            f"ul_adult_m, ul_adult_f, ul_non_adult, ul_pregnant, "
            f"unit, solubility, gi_irritant, effect, absorption_note "
            f"FROM ingredient_master "
            f"{where_clause}"
        ),
        params,
    ).fetchall()

    master = {}
    for row in result:
        master[row[0]] = {
            "ingredient_id": row[0],
            "normalized_name": row[1],
            "ri_adult_m": float(row[2]) if row[2] is not None else None,
            "ri_adult_f": float(row[3]) if row[3] is not None else None,
            "ri_non_adult": float(row[4]) if row[4] is not None else None,
            "ri_pregnant": float(row[5]) if row[5] is not None else None,
            "ul_adult_m": float(row[6]) if row[6] is not None else None,
            "ul_adult_f": float(row[7]) if row[7] is not None else None,
            "ul_non_adult": float(row[8]) if row[8] is not None else None,
            "ul_pregnant": float(row[9]) if row[9] is not None else None,
            "unit": row[10],
            "solubility": row[11],
            "gi_irritant": bool(row[12]) if row[12] is not None else False,
            "effect": row[13],
            "absorption_note": row[14],
        }
    return master


def _load_interactions(db: Session, ingredient_ids: list[int]) -> list[dict]:
    """ingredient_interaction 테이블에서 상호작용 정보 조회"""
    if not ingredient_ids:
        return []

    placeholders = ", ".join([f":id_{i}" for i in range(len(ingredient_ids))])
    params = {f"id_{i}": iid for i, iid in enumerate(ingredient_ids)}

    result = db.execute(
        text(
            f"SELECT interaction_id, ingredient_a, ingredient_b, type, min_interval_hours, note "
            f"FROM ingredient_interaction "
            f"WHERE ingredient_a IN ({placeholders}) OR ingredient_b IN ({placeholders})"
        ),
        params,
    ).fetchall()

    return [
        {
            "interaction_id": row[0],
            "ingredient_a": row[1],
            "ingredient_b": row[2],
            "type": row[3],
            "min_interval_hours": row[4],
            "note": row[5],
        }
        for row in result
    ]


def _load_products_by_ingredients(db: Session, ingredient_names: list[str]) -> list[dict]:
    """부족 성분명이 product_type에 포함된 제품 검색 (복합제품 대응)"""
    if not ingredient_names:
        return []
        
    conditions = " OR ".join([f"product_type LIKE :name_{i}" for i in range(len(ingredient_names))])
    params = {f"name_{i}": f"%{name}%" for i, name in enumerate(ingredient_names)}
    
    result = db.execute(
        text(
            f"SELECT product_code, product_name, product_type "
            f"FROM products "
            f"WHERE {conditions} "
        ),
        params,
    ).fetchall()

    return [
        {
            "product_code": row[0],
            "product_name": row[1],
            "product_type": row[2],
        }
        for row in result
    ]


# ── Step 1: 성분 합산 ──────────────────────────────────────
def _aggregate_ingredients(supplements: list[dict], master: dict) -> dict:
    """
    같은 ingredient_id 합산.
    amount는 이미 하루치이므로 바로 합산.
    단위가 다를 경우 ingredient_master.unit 기준으로 변환.
    """
    totals = {}

    for supp in supplements:
        for ing in supp.get("ingredients", []):
            iid = ing["ingredient_id"]
            amount = float(ing["amount"])
            unit = ing["unit"]
            name = ing.get("ingredient_name", "")

            # master에 등록된 기준 단위 가져오기
            master_unit = master.get(iid, {}).get("unit", unit)

            # 단위 변환: 입력 → mg → 기준 단위
            if unit != master_unit:
                amount_mg = _convert_to_mg(amount, unit, name)
                amount = _convert_from_mg(amount_mg, master_unit, name)

            if iid in totals:
                totals[iid]["amount"] += amount
            else:
                totals[iid] = {
                    "ingredient_id": iid,
                    "ingredient_name": name,
                    "amount": amount,
                    "unit": master_unit,
                }

    return totals


# ── Step 2: 과잉/부족 분석 ─────────────────────────────────
def _analyze_ingredients(totals: dict, master: dict, ri_col: str, ul_col: str) -> list[dict]:
    """
    RI/UL 기반 과잉·부족 분석.
    - RI/UL이 NULL인 성분은 skip
    - 합산량 > UL → EXCESS
    - 합산량 < RI × 0.5 → DEFICIENCY
    - 그 외 → NORMAL
    """
    analysis = []

    for iid, total in totals.items():
        info = master.get(iid)
        if not info:
            continue

        ri = info.get(ri_col)
        ul = info.get(ul_col)

        # RI/UL 둘 다 없으면 분석 불가 → skip
        if ri is None and ul is None:
            continue

        current = total["amount"]
        unit = total["unit"]
        name = info["normalized_name"]

        item = {
            "ingredient_id": iid,
            "normalized_ingredient_name": name,
            "recommended_amount": ri,
            "current_amount": round(current, 2),
            "excess_ratio": None,
            "excess_amount": None,
            "deficiency_ratio": None,
            "deficiency_amount": None,
            "unit": unit,
            "analysis_type": "NORMAL",
        }

        # 과잉 판단
        if ul is not None and current > ul:
            excess_amount = round(current - ul, 2)
            excess_ratio = round(excess_amount / ul, 2) if ul > 0 else None
            item["analysis_type"] = "EXCESS"
            item["excess_ratio"] = excess_ratio
            item["excess_amount"] = excess_amount

        # 부족 판단 (RI × 0.5 이하)
        elif ri is not None and ri > 0 and current < ri * 0.5:
            deficiency_amount = round(ri - current, 2)
            deficiency_ratio = round(deficiency_amount / ri, 2) if ri > 0 else None
            item["analysis_type"] = "DEFICIENCY"
            item["deficiency_ratio"] = deficiency_ratio
            item["deficiency_amount"] = deficiency_amount

        analysis.append(item)

    return analysis


def _calculate_demographic_score(product_name: str, is_kid: bool, is_female: bool, is_male: bool) -> int:
    """상품명과 사용자 인구통계학적 특성을 비교하여 적합도 점수 산출"""
    name_lower = product_name.lower()
    score = 0
    kid_keywords = ["키즈", "어린이", "차일드", "kids", "틴"]
    female_keywords = ["우먼", "여성", "우먼스", "레이디", "for women"]
    male_keywords = ["남성", "맨", "for men", "남"]
    
    # 연령 필터
    if is_kid and any(kw in name_lower for kw in kid_keywords):
        score += 100
    elif not is_kid and any(kw in name_lower for kw in kid_keywords):
        score -= 1000 # 어른에게 키즈 제품 제공 배제
        
    # 성별 필터
    if is_female and any(kw in name_lower for kw in female_keywords):
        score += 50
    elif is_female and any(kw in name_lower for kw in male_keywords) and not any(kw in name_lower for kw in female_keywords):
        score -= 1000 # 여성에게 남성 제품 제공 배제
        
    if is_male and any(kw in name_lower for kw in male_keywords) and not any(kw in name_lower for kw in female_keywords):
        score += 50
    elif is_male and any(kw in name_lower for kw in female_keywords):
        score -= 1000 # 남성에게 여성 제품 제공 배제
        
    return score


# ── Step 3: 부족 성분 제품 추천 ─────────────────────────────
def _recommend_products(
    analysis: list[dict],
    db: Session,
    gender: str,
    age: int,
) -> tuple[list[dict], list[dict]]:
    """
    DEFICIENCY 성분 중 상위 3개 선정 → product_type LLM 매핑 → 성분당 3개 제품 추천.
    """
    deficient = [a for a in analysis if a["analysis_type"] == "DEFICIENCY"]

    if not deficient:
        return [], []

    # 부족비율 내림차순 정렬
    deficient.sort(key=lambda x: x.get("deficiency_ratio") or 0, reverse=True)

    # 상위 3개 선정 (동률 시 LLM 판단)
    if len(deficient) > 3:
        # 3번째와 4번째의 비율이 같으면 LLM에게 위임
        if deficient[2].get("deficiency_ratio") == deficient[3].get("deficiency_ratio"):
            tied = [d for d in deficient if d.get("deficiency_ratio") == deficient[2].get("deficiency_ratio")]
            non_tied = [d for d in deficient if d.get("deficiency_ratio") != deficient[2].get("deficiency_ratio")]
            # 확실히 상위인 것 + LLM이 선정한 나머지
            slots_needed = 3 - len([d for d in non_tied if (d.get("deficiency_ratio") or 0) > (deficient[2].get("deficiency_ratio") or 0)])
            top_non_tied = [d for d in non_tied if (d.get("deficiency_ratio") or 0) > (deficient[2].get("deficiency_ratio") or 0)]

            llm_selected = select_top_deficient_ingredients(
                tied_ingredients=tied,
                slots=slots_needed,
                gender=gender,
                age=age,
            )
            deficient = top_non_tied + llm_selected
        else:
            deficient = deficient[:3]
    # 3개 이하면 그대로 사용

    # LLM 없이 성분명으로 제품 직접 검색
    deficient_names = [d["normalized_ingredient_name"] for d in deficient]
    products = _load_products_by_ingredients(db, deficient_names)

    # Demographic 필터링 기준값
    is_kid = age < 13
    is_female = gender.upper() == "FEMALE"
    is_male = gender.upper() == "MALE"
    
    kid_keywords = ["키즈", "어린이", "차일드", "kids", "틴"]
    female_keywords = ["우먼", "여성", "우먼스", "레이디", "for women"]
    male_keywords = ["남성", "맨", "for men", "남"]

    # 전체 결핍 성분명 목록 (복합제품 가산점 부여용)
    all_deficient_names = [d["normalized_ingredient_name"] for d in deficient]

    # 성분별로 추천 구성
    recommended = []
    for d in deficient:
        ing_name = d["normalized_ingredient_name"]
        ing_id = d["ingredient_id"]
        
        # 1. 성분이 product_type 문자열 내에 존재하는 상품 필터링 (복합제품 포함)
        matched = [p for p in products if ing_name in p["product_type"]]
        
        # 2. Demographic 점수 및 복합제품 보너스 적용
        final_matched = []
        for p in matched:
            score = _calculate_demographic_score(p["product_name"], is_kid, is_female, is_male)
            
            # 결핍 성분을 여러 개 포함하는 복합제품일수록 압도적 가산점 부여
            multi_match_count = sum(1 for def_name in all_deficient_names if def_name in p["product_type"])
            score += (multi_match_count * 300)
            
            if score > -500:
                final_matched.append((p, score))
                
        # 높은 점수순 (적합성 순) 정렬 후 최대 3개 확보
        final_matched.sort(key=lambda x: x[1], reverse=True)
        top3 = final_matched[:3]
        
        for p, score in top3:
            recommended.append({
                "product_code": p["product_code"],
                "product_name": p["product_name"],
                "ingredient_id": ing_id,
            })

    return recommended, deficient


# ── Step 4: 섭취 타이밍 추천 ────────────────────────────────
TIMING_ORDER = [
    "BEFORE_BREAKFAST", "AFTER_BREAKFAST",
    "BEFORE_LUNCH", "AFTER_LUNCH",
    "BEFORE_DINNER", "AFTER_DINNER",
    "BEFORE_SLEEP",
]


def _assign_base_timing(has_relax: bool, has_energy: bool, has_fat_soluble: bool, has_gi_irritant: bool) -> str:
    """영양제 특성 플래그를 기반으로 기본 섭취 타이밍 1개 반환"""
    if has_relax:
        return "BEFORE_SLEEP"
    if has_energy:
        if has_fat_soluble or has_gi_irritant:
            return "AFTER_BREAKFAST"
        return "BEFORE_BREAKFAST"
    if has_fat_soluble or has_gi_irritant:
        return "AFTER_BREAKFAST"
    return "AFTER_BREAKFAST"


def _resolve_interactions(supp_profiles: list[dict], interactions: list[dict]):
    """길항 작용 충돌 분리 및 시너지 동기화 섭취 스케줄 처리 (인플레이스 변형)"""
    # 1. ANTAGONIST(길항작용) 처리: 배열 안에서 타이밍이 겹치면 뒤로 밀어내기
    antagonist_pairs = [ia for ia in interactions if ia["type"] == "ANTAGONIST"]
    for pair in antagonist_pairs:
        a_id, b_id = pair["ingredient_a"], pair["ingredient_b"]
        for sa in [p for p in supp_profiles if a_id in p["ingredient_ids"]]:
            for sb in [p for p in supp_profiles if b_id in p["ingredient_ids"]]:
                if sa["user_supplement_id"] == sb["user_supplement_id"]:
                    continue
                common_timings = set(sa["timings"]).intersection(set(sb["timings"]))
                if common_timings:
                    new_b_timings = []
                    for t in sb["timings"]:
                        if t in common_timings:
                            current_idx = TIMING_ORDER.index(t)
                            new_idx = min(current_idx + 2, len(TIMING_ORDER) - 1)
                            while TIMING_ORDER[new_idx] in sa["timings"] and new_idx < len(TIMING_ORDER) - 1:
                                new_idx += 1
                            new_b_timings.append(TIMING_ORDER[new_idx])
                        else:
                            new_b_timings.append(t)
                    sb["timings"] = sorted(list(set(new_b_timings)), key=lambda x: TIMING_ORDER.index(x))
                    
                    if pair.get("note"):
                        sa["interaction_notes"].append(f"[방해] {pair.get('note')}")
                        sb["interaction_notes"].append(f"[방해] {pair.get('note')}")

    # 2. SYNERGY(시너지) 처리: 가급적 배열을 동기화하여 동시에 먹게 만듦
    synergy_pairs = [ia for ia in interactions if ia["type"] == "SYNERGY"]
    for pair in synergy_pairs:
        a_id, b_id = pair["ingredient_a"], pair["ingredient_b"]
        for sa in [p for p in supp_profiles if a_id in p["ingredient_ids"]]:
            for sb in [p for p in supp_profiles if b_id in p["ingredient_ids"]]:
                if sa["user_supplement_id"] == sb["user_supplement_id"]:
                    continue
                if pair.get("note"):
                    sa["interaction_notes"].append(f"[시너지] {pair.get('note')}")
                    sb["interaction_notes"].append(f"[시너지] {pair.get('note')}")
                if len(sa["timings"]) == len(sb["timings"]):
                    sb["timings"] = sa["timings"].copy()
                else:
                    min_len = min(len(sa["timings"]), len(sb["timings"]))
                    for i in range(min_len):
                        sb["timings"][i] = sa["timings"][i]
                    sb["timings"] = sorted(set(sb["timings"]), key=lambda x: TIMING_ORDER.index(x))


def _distribute_timings(base_timing: str, daily_dose: int) -> list[str]:
    """일일 섭취 횟수(daily_dose)에 따라 섭취 스케줄 분배"""
    if daily_dose <= 1:
        return [base_timing]

    # 식전/식후 속성 파악 (수면 유도제 등 예외 상황 제외)
    prefix = "BEFORE" if "BEFORE" in base_timing else "AFTER"

    if daily_dose == 2:
        if base_timing == "BEFORE_SLEEP":
            return ["AFTER_DINNER", "BEFORE_SLEEP"]
        return [f"{prefix}_BREAKFAST", f"{prefix}_DINNER"]

    # 3회 섭취일 경우
    if base_timing == "BEFORE_SLEEP":
        return ["AFTER_LUNCH", "AFTER_DINNER", "BEFORE_SLEEP"]
    
    return [f"{prefix}_BREAKFAST", f"{prefix}_LUNCH", f"{prefix}_DINNER"]


def _recommend_timing(
    supplements: list[dict],
    master: dict,
    interactions: list[dict],
) -> list[dict]:
    """
    영양제별 최적 섭취 타이밍 추천.
    - 지용성(FAT) / 위자극 → 식후
    - ENERGY → 아침 / RELAX → 저녁·취침전
    - daily_dose 에 맞춰 여러 번의 타이밍 분할
    - ANTAGONIST 상호작용 → 겹치는 시간대 분리
    - SYNERGY → 가급적 동시 배치
    """
    supp_profiles = []
    for supp in supplements:
        profile = {
            "user_supplement_id": supp["user_supplement_id"],
            "alias": supp.get("alias", ""),
            "daily_dose": supp.get("daily_dose", 1),
            "has_fat_soluble": False,
            "has_gi_irritant": False,
            "has_energy": False,
            "has_relax": False,
            "ingredient_ids": set(),
            "absorption_notes": [],
            "interaction_notes": [],
        }
        for ing in supp.get("ingredients", []):
            iid = ing["ingredient_id"]
            profile["ingredient_ids"].add(iid)
            info = master.get(iid, {})
            
            if info.get("absorption_note"):
                profile["absorption_notes"].append(f"[{info.get('normalized_name')}] {info.get('absorption_note')}")
                
            if info.get("solubility") == "FAT":
                profile["has_fat_soluble"] = True
            if info.get("gi_irritant") == "YES" or info.get("gi_irritant") == "TRUE":
                profile["has_gi_irritant"] = True

            if info.get("effect") == "ENERGY":
                profile["has_energy"] = True
            if info.get("effect") == "RELAX":
                profile["has_relax"] = True
        supp_profiles.append(profile)

    # 1. 1차 기본 타이밍(base_timing) 배정 및 횟수(daily_dose) 기반 분배
    for p in supp_profiles:
        base_t = _assign_base_timing(p["has_relax"], p["has_energy"], p["has_fat_soluble"], p["has_gi_irritant"])
        p["timings"] = _distribute_timings(base_t, p["daily_dose"])

    # 2. 상호작용(길항/시너지) 병합 및 분리 로직 수행
    _resolve_interactions(supp_profiles, interactions)

    return [
        {
            "user_supplement_id": p["user_supplement_id"],
            "alias": p["alias"],
            "intake_timings": p["timings"],
            "absorption_notes": list(set(p["absorption_notes"])),
            "interaction_notes": list(set(p["interaction_notes"])),
        }
        for p in supp_profiles
    ]


# ── 메인 빌드 함수 ─────────────────────────────────────────
def build_report(req: dict, db: Session) -> dict:
    """레포트 생성 메인 함수"""
    user_id = req["user_id"]
    gender = req["gender"]
    birth_date = req["birth_date"]
    supplements = req["supplements"]

    age = _calculate_age(birth_date)
    ri_col, ul_col = _get_ri_ul_columns(gender, age)

    # 모든 ingredient_id 수집
    all_ingredient_ids = list(set(
        ing["ingredient_id"]
        for supp in supplements
        for ing in supp.get("ingredients", [])
    ))

    # DB 조회 (언제나 전체 성분을 조회하여 아예 안 먹는 성분도 결핍 모델에 포함시킴)
    master = _load_ingredient_master(db)

    interactions = _load_interactions(db, all_ingredient_ids)

    # Step 1: 성분 합산 (단위 변환 포함)
    totals = _aggregate_ingredients(supplements, master)

    # 빈 성분 처리: 사용자가 전혀 섭취하지 않는 성분들도 current_amount를 0으로 초기화
    for iid, info in master.items():
        if iid not in totals:
            totals[iid] = {
                "ingredient_id": iid,
                "ingredient_name": info["normalized_name"],
                "amount": 0.0,
                "unit": info.get("unit", ""),
            }

    # Step 2: 과잉/부족 분석
    analysis = _analyze_ingredients(totals, master, ri_col, ul_col)

    # Step 3: 부족 성분 제품 추천
    recommended_products, selected_deficient = _recommend_products(analysis, db, gender, age)

    # 분석 데이터 필터링: 현재 섭취 중인 성분 + 제품 추천이 내려진 상위 3개 부족 성분만 남김
    selected_deficient_ids = {d["ingredient_id"] for d in selected_deficient}
    filtered_analysis = [
        item for item in analysis
        if item["current_amount"] > 0 or item["ingredient_id"] in selected_deficient_ids
    ]

    # Step 4: 섭취 타이밍 추천
    timing_recommendations = _recommend_timing(supplements, master, interactions)

    # Step 5: LLM 코멘트 생성 (필터링된 데이터 사용)
    comments = generate_report_comments(
        analysis=filtered_analysis,
        recommended_products=recommended_products,
        timing_recommendations=timing_recommendations,
        gender=gender,
        age=age,
    )

    # API 응답 하위 호환성 유지를 위해, 프론트엔드 전송 직전 내부 LLM 참조용 데이터(Notes) 삭제
    for t in timing_recommendations:
        t.pop("absorption_notes", None)
        t.pop("interaction_notes", None)

    return {
        "ingredient_analysis": filtered_analysis,
        "recommended_products": recommended_products,
        "timing_recommendations": timing_recommendations,
        "comments": comments,
    }
