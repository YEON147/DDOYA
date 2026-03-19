import cv2
import numpy as np
import torch
from PIL import Image

from app.services.feature_service import extract_auxiliary_features


def _normalize_vector(vector: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vector)
    if norm < 1e-12:
        return vector.astype(np.float32)
    return (vector / norm).astype(np.float32)


def extract_dinov2_embedding(crop_image: np.ndarray, model_registry) -> np.ndarray:
    model = getattr(model_registry, "embedding_model", None)
    processor = getattr(model_registry, "embedding_processor", None)
    device = getattr(model_registry, "device", "cpu")

    if model is None:
        raise RuntimeError("embedding_model이 로드되지 않았습니다.")
    if processor is None:
        raise RuntimeError("embedding_processor가 로드되지 않았습니다.")

    rgb = cv2.cvtColor(crop_image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb)

    with torch.no_grad():
        inputs = processor(images=pil_image, return_tensors="pt").to(device)
        outputs = model(**inputs)

        # 네 로컬 테스트 코드와 동일하게 CLS token 사용
        embedding = outputs.last_hidden_state[:, 0]
        embedding = embedding / embedding.norm(dim=-1, keepdim=True)

    return embedding[0].detach().cpu().numpy().astype(np.float32)


def build_reference_bundle(crop_image: np.ndarray, model_registry) -> dict[str, np.ndarray]:
    embedding = extract_dinov2_embedding(crop_image, model_registry)
    aux_features = extract_auxiliary_features(crop_image)

    return {
        "embedding": embedding,
        "mean_hsv": aux_features["mean_hsv"],
        "hue_hist": aux_features["hue_hist"],
        "shape_vector": aux_features["shape_vector"],
    }