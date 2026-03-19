from collections import defaultdict


def aggregate_verify_results(expected_items, crop_results: list[dict]) -> dict:
    """
    crop별 결과를 영양제별 summary로 집계한다.
    """
    detected_count_map = defaultdict(int)
    confidence_sum_map = defaultdict(float)
    confidence_count_map = defaultdict(int)
    review_flag_map = defaultdict(bool)

    for crop in crop_results:
        sid = crop.get("final_user_supplement_id")
        if sid is None:
            continue

        detected_count_map[sid] += 1
        confidence_sum_map[sid] += float(crop.get("final_confidence", 0.0))
        confidence_count_map[sid] += 1
        review_flag_map[sid] = review_flag_map[sid] or bool(crop.get("review_required", False))

    results = []

    for item in expected_items:
        sid = item.user_supplement_id
        detected_count = detected_count_map[sid]

        if confidence_count_map[sid] > 0:
            match_confidence = confidence_sum_map[sid] / confidence_count_map[sid]
        else:
            match_confidence = 0.0

        results.append(
            {
                "user_supplement_id": sid,
                "expected_count": item.expected_count,
                "detected_count": detected_count,
                "match_confidence": float(match_confidence),
                "review_required": bool(review_flag_map[sid]),
            }
        )

    total_detected_count = sum(detected_count_map.values())

    if crop_results:
        avg_confidence = sum(float(c["final_confidence"]) for c in crop_results) / len(crop_results)
    else:
        avg_confidence = 0.0

    is_match = all(
        result["expected_count"] == result["detected_count"]
        for result in results
    )

    return {
        "total_detected_count": int(total_detected_count),
        "avg_confidence": float(avg_confidence),
        "results": results,
        "is_match": bool(is_match),
        "crop_results": crop_results,
    }