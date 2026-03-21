from collections import defaultdict


def aggregate_verify_results(expected_items, crop_results: list[dict]) -> list[dict]:
    """
    crop별 결과를 user_supplement_id 기준으로 집계하여
    최신 verify 응답 명세(results 직결) 형태로 반환한다.
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

        results.append(
            {
                "user_supplement_id": sid,
                "dose_per_intake": item.dose_per_intake,
                "detected_amount": int(detected_amount_map[sid]),
            }
        )

    return results