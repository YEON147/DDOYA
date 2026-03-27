import numpy as np

from app.core.config import settings


def _safe_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    v1 = vec1.astype(np.float32).reshape(-1)
    v2 = vec2.astype(np.float32).reshape(-1)

    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)

    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0

    return float(np.dot(v1, v2) / (norm1 * norm2))


def _compare_color_features(query_features: dict, ref_bundle: dict) -> float:
    query_mean_hsv = query_features.get("mean_hsv")
    query_hue_hist = query_features.get("hue_hist")

    ref_mean_hsv = ref_bundle.get("mean_hsv")
    ref_hue_hist = ref_bundle.get("hue_hist")

    mean_score = 0.0
    hist_score = 0.0

    if query_mean_hsv is not None and ref_mean_hsv is not None:
        dist = np.linalg.norm(
            query_mean_hsv.astype(np.float32).reshape(-1)
            - ref_mean_hsv.astype(np.float32).reshape(-1)
        )
        mean_score = 1.0 / (1.0 + float(dist))

    if query_hue_hist is not None and ref_hue_hist is not None:
        hist_score = _safe_cosine_similarity(query_hue_hist, ref_hue_hist)

    return (
        settings.COLOR_MEAN_WEIGHT * mean_score
        + settings.COLOR_HIST_WEIGHT * hist_score
    )


def _compare_shape_features(query_features: dict, ref_bundle: dict) -> float:
    query_shape = query_features.get("shape_vector")
    ref_shape = ref_bundle.get("shape_vector")

    if query_shape is None or ref_shape is None:
        return 0.0

    return _safe_cosine_similarity(query_shape, ref_shape)


def _calculate_final_score(
    embedding_score: float,
    color_score: float,
    shape_score: float,
) -> float:
    return (
        settings.DINO_SCORE_WEIGHT * embedding_score
        + settings.COLOR_SCORE_WEIGHT * color_score
        + settings.SHAPE_SCORE_WEIGHT * shape_score
    )


def match_crop_against_expected_items(
    query_embedding: np.ndarray,
    query_features: dict,
    reference_candidates: list[dict],
    top_k: int = 3,
) -> dict:
    """
    threshold 없이 최고 점수 후보를 final_user_supplement_id로 선택한다.
    """
    scored_candidates = []

    for candidate in reference_candidates:
        user_supplement_id = candidate["user_supplement_id"]
        bundle = candidate["bundle"]

        ref_embedding = bundle.get("embedding")
        if ref_embedding is None:
            continue

        embedding_score = _safe_cosine_similarity(query_embedding, ref_embedding)
        color_score = _compare_color_features(query_features, bundle)
        shape_score = _compare_shape_features(query_features, bundle)

        final_score = _calculate_final_score(
            embedding_score=embedding_score,
            color_score=color_score,
            shape_score=shape_score,
        )

        scored_candidates.append(
            {
                "user_supplement_id": user_supplement_id,
                "embedding_score": round(float(embedding_score), 6),
                "color_score": round(float(color_score), 6),
                "shape_score": round(float(shape_score), 6),
                "final_score": round(float(final_score), 6),
            }
        )

    if not scored_candidates:
        return {
            "final_user_supplement_id": None,
            "final_confidence": 0.0,
            "top_candidates": [],
        }

    scored_candidates.sort(key=lambda x: x["final_score"], reverse=True)

    top_candidates = scored_candidates[:top_k]
    best = top_candidates[0]

    return {
        "final_user_supplement_id": best["user_supplement_id"],
        "final_confidence": best["final_score"],
        "top_candidates": top_candidates,
    }