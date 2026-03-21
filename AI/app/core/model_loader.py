from dataclasses import dataclass
from pathlib import Path
import gc

import torch
from transformers import AutoImageProcessor, AutoModel
from ultralytics import YOLO

from app.core.config import settings


@dataclass
class ModelRegistry:
    device: str
    yolo_model: object
    embedding_model: object
    embedding_processor: object


def _resolve_device() -> str:
    requested = getattr(settings, "DEVICE", "cpu").lower()
    if requested == "cuda" and torch.cuda.is_available():
        return "cuda"
    return "cpu"


def _validate_file_exists(path_str: str, label: str) -> Path:
    path = Path(path_str)
    if not path.exists():
        raise FileNotFoundError(f"{label} 경로를 찾을 수 없습니다: {path}")
    return path


def _load_yolo_model():
    yolo_path = _validate_file_exists(settings.YOLO_MODEL_PATH, "YOLO 모델")
    return YOLO(str(yolo_path))


def _load_embedding_model(device: str):
    model_name_or_path = settings.EMBEDDING_MODEL_PATH

    processor = AutoImageProcessor.from_pretrained(model_name_or_path)
    model = AutoModel.from_pretrained(model_name_or_path).to(device)
    model.eval()

    return model, processor


def load_models() -> ModelRegistry:
    device = _resolve_device()
    yolo_model = _load_yolo_model()
    embedding_model, embedding_processor = _load_embedding_model(device)

    return ModelRegistry(
        device=device,
        yolo_model=yolo_model,
        embedding_model=embedding_model,
        embedding_processor=embedding_processor,
    )


def release_models(model_registry) -> None:
    if model_registry is None:
        return

    try:
        if hasattr(model_registry, "yolo_model"):
            model_registry.yolo_model = None
        if hasattr(model_registry, "embedding_model"):
            model_registry.embedding_model = None
        if hasattr(model_registry, "embedding_processor"):
            model_registry.embedding_processor = None

        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except Exception:
        pass