import numpy as np

from app.core.config import settings


def safe_cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype(np.float32)
    b = b.astype(np.float32)

    a_norm = np.linalg.norm(a)
    b_norm = np.linalg.norm(b)

    if a_norm < 1e-12 or b_norm < 1e-12:
        return 0.0

    return float(np.dot(a, b) / (a_norm * b_norm))


def _hist_intersection(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype(np.float32)
    b = b.astype(np.float32)

    if a.sum() > 0:
        a = a / (a.sum() + 1e-12)
    if b.sum() > 0:
        b = b / (b.sum() + 1e-12)

    return float(np.minimum(a, b).sum())


def _distance_to_similarity(distance_value: float, scale: float = 1.0) -> float:
    return float(1.0 / (1.0 + (distance_value / max(scale, 1e-12))))


def compute_feature_score(
    query_features: dict[str, np.ndarray],
    reference_bundle: dict[str, np.ndarray],
) -> float:
    """
    색상/모양 보조 특징 점수 계산
    """
    mean_hsv_q = query_features["mean_hsv"]
    mean_hsv_r = reference_bundle["mean_hsv"]

    hue_hist_q = query_features["hue_hist"]
    hue_hist_r = reference_bundle["hue_hist"]

    shape_q = query_features["shape_vector"]
    shape_r = reference_bundle["shape_vector"]

    hsv_distance = float(np.linalg.norm(mean_hsv_q - mean_hsv_r))
    hsv_score = _distance_to_similarity(hsv_distance, scale=60.0)

    hist_score = _hist_intersection(hue_hist_q, hue_hist_r)

    shape_distance = float(np.linalg.norm(shape_q - shape_r))
    shape_score = _distance_to_similarity(shape_distance, scale=1.0)

    final_feature_score = (
        settings.FEATURE_HSV_WEIGHT * hsv_score
        + settings.FEATURE_HIST_WEIGHT * hist_score
        + settings.FEATURE_SHAPE_WEIGHT * shape_score
    )

    return float(final_feature_score)


def match_crop_against_expected_items(
    query_embedding: np.ndarray,
    query_features: dict[str, np.ndarray],
    reference_candidates: list[dict],
    top_k: int = 3,
) -> dict:
    """
    reference_candidates 예시:
    [
        {
            "user_supplement_id": 201,
            "bundle": {
                "embedding": ...,
                "mean_hsv": ...,
                "hue_hist": ...,
                "shape_vector": ...
            }
        },
        ...
    ]
    """
    if not reference_candidates:
        raise ValueError("reference_candidates가 비어 있습니다.")

    scored_candidates = []

    for candidate in reference_candidates:
        user_supplement_id = candidate["user_supplement_id"]
        bundle = candidate["bundle"]

        embedding_score = safe_cosine_similarity(query_embedding, bundle["embedding"])
        feature_score = compute_feature_score(query_features, bundle)

        final_score = (
            settings.EMBEDDING_SCORE_WEIGHT * embedding_score
            + settings.AUX_FEATURE_SCORE_WEIGHT * feature_score
        )

        scored_candidates.append(
            {
                "user_supplement_id": user_supplement_id,
                "embedding_score": float(embedding_score),
                "feature_score": float(feature_score),
                "final_score": float(final_score),
            }
        )

    scored_candidates.sort(key=lambda x: x["final_score"], reverse=True)

    top_candidates = scored_candidates[: min(top_k, len(scored_candidates))]
    top1 = top_candidates[0]
    top2_score = top_candidates[1]["final_score"] if len(top_candidates) > 1 else 0.0
    margin = top1["final_score"] - top2_score

    review_required = (
        top1["final_score"] < settings.REVIEW_SCORE_THRESHOLD
        or margin < settings.REVIEW_MARGIN_THRESHOLD
    )

    return {
        "final_user_supplement_id": top1["user_supplement_id"],
        "final_confidence": float(top1["final_score"]),
        "embedding_score": float(top1["embedding_score"]),
        "feature_score": float(top1["feature_score"]),
        "review_required": review_required,
        "top_k": [
            {
                "user_supplement_id": item["user_supplement_id"],
                "score": float(item["final_score"]),
            }
            for item in top_candidates
        ],
    }