import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # 품질 검사
    ENABLE_QUALITY_CHECK = os.getenv("ENABLE_QUALITY_CHECK", "false").lower() == "true"

    # Database Settings (Read-Only access to MySQL)
    AI_DB_HOST = os.getenv("AI_DB_HOST", "mysql")
    AI_DB_PORT = int(os.getenv("AI_DB_PORT", 3306))
    AI_DB_NAME = os.getenv("AI_DB_NAME", "ddoya")
    AI_DB_USERNAME = os.getenv("AI_DB_USERNAME", "ddoya")
    AI_DB_PASSWORD = os.getenv("AI_DB_PASSWORD", "ddoya1234")

    BLUR_THRESHOLD = float(os.getenv("BLUR_THRESHOLD", 25.0))
    BRIGHTNESS_MIN = float(os.getenv("BRIGHTNESS_MIN", 15.0))
    BRIGHTNESS_MAX = float(os.getenv("BRIGHTNESS_MAX", 245.0))
    CONTRAST_MIN = float(os.getenv("CONTRAST_MIN", 8.0))
    SMALL_BBOX_AREA_RATIO = float(os.getenv("SMALL_BBOX_AREA_RATIO", 0.0012))

    # 저장소
    STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "local").strip().lower()
    LOCAL_STORAGE_ROOT = os.getenv("LOCAL_STORAGE_ROOT", "storage")

    AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "").strip()
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()

    # AWS_DEFAULT_REGION 우선, 없으면 AWS_REGION fallback
    AWS_DEFAULT_REGION = os.getenv(
        "AWS_DEFAULT_REGION",
        os.getenv("AWS_REGION", "ap-northeast-2")
    ).strip()

    S3_REFERENCE_PREFIX = os.getenv("S3_REFERENCE_PREFIX", "supplements/embeddings").strip()

    # crop pad
    REGISTER_CROP_PAD_RATIO = float(os.getenv("REGISTER_CROP_PAD_RATIO", 0.12))
    VERIFY_CROP_PAD_RATIO = float(os.getenv("VERIFY_CROP_PAD_RATIO", 0.10))

    # verify bbox filtering
    VERIFY_MIN_W = int(os.getenv("VERIFY_MIN_W", 12))
    VERIFY_MIN_H = int(os.getenv("VERIFY_MIN_H", 12))
    VERIFY_MIN_AREA = int(os.getenv("VERIFY_MIN_AREA", 144))
    CONTAIN_THRESH = float(os.getenv("CONTAIN_THRESH", 0.90))
    RELATIVE_AREA_THRESH = float(os.getenv("RELATIVE_AREA_THRESH", 0.20))

    # similarity / scoring
    TOPK = int(os.getenv("TOPK", 3))

    DINO_SCORE_WEIGHT = float(
        os.getenv("DINO_SCORE_WEIGHT", os.getenv("EMBEDDING_SCORE_WEIGHT", 0.75))
    )
    COLOR_SCORE_WEIGHT = float(os.getenv("COLOR_SCORE_WEIGHT", 0.15))
    SHAPE_SCORE_WEIGHT = float(os.getenv("SHAPE_SCORE_WEIGHT", 0.10))

    COLOR_MEAN_WEIGHT = float(os.getenv("COLOR_MEAN_WEIGHT", 0.4))
    COLOR_HIST_WEIGHT = float(os.getenv("COLOR_HIST_WEIGHT", 0.6))

    REVIEW_SCORE_THRESHOLD = float(os.getenv("REVIEW_SCORE_THRESHOLD", 0.75))
    REVIEW_MARGIN_THRESHOLD = float(os.getenv("REVIEW_MARGIN_THRESHOLD", 0.05))

    DEVICE = os.getenv("DEVICE", "cpu")
    YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "weights/yolo_pill_best.pt")
    EMBEDDING_MODEL_PATH = os.getenv("EMBEDDING_MODEL_PATH", "facebook/dinov2-base")
    EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", 768))


settings = Settings()