from collections import defaultdict


def aggregate_verify_results(expected_items, crop_results: list[dict]) -> list[dict]:
    """
    crop별 분류 결과를 user_supplement_id 기준으로 집계한다.
    단, 최종 detected_amount는 dose_per_intake를 초과하지 않도록 cap 처리한다.
    """
    detected_amount_map = defaultdict(int)

    for crop in crop_results:
        sid = crop.get("final_user_supplement_id")
        if sid is None:
            continue
        detected_amount_map[sid] += 1

    results = []

    for item in expected_items:
        sid = item.user_supplement_id
        dose_per_intake = int(item.dose_per_intake)
        detected_amount = int(detected_amount_map[sid])

        # 핵심: 초과 검출 방지
        detected_amount = min(detected_amount, dose_per_intake)

        results.append(
            {
                "user_supplement_id": sid,
                "dose_per_intake": dose_per_intake,
                "detected_amount": detected_amount,
            }
        )

    return results