import os


class Settings:
    BLUR_THRESHOLD = float(os.getenv("BLUR_THRESHOLD", 80.0))
    BRIGHTNESS_MIN = float(os.getenv("BRIGHTNESS_MIN", 40.0))
    BRIGHTNESS_MAX = float(os.getenv("BRIGHTNESS_MAX", 220.0))
    CONTRAST_MIN = float(os.getenv("CONTRAST_MIN", 25.0))
    SMALL_BBOX_AREA_RATIO = float(os.getenv("SMALL_BBOX_AREA_RATIO", 0.003))

    STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "local")  # local or s3
    LOCAL_STORAGE_ROOT = os.getenv("LOCAL_STORAGE_ROOT", "storage")

    AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "")
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-northeast-2")

    S3_REFERENCE_PREFIX = os.getenv("S3_REFERENCE_PREFIX", "supplements/embeddings")
        # verify bbox filtering
    VERIFY_MIN_W = int(os.getenv("VERIFY_MIN_W", 20))
    VERIFY_MIN_H = int(os.getenv("VERIFY_MIN_H", 20))
    VERIFY_MIN_AREA = int(os.getenv("VERIFY_MIN_AREA", 400))
    CONTAIN_THRESH = float(os.getenv("CONTAIN_THRESH", 0.85))
    RELATIVE_AREA_THRESH = float(os.getenv("RELATIVE_AREA_THRESH", 0.40))

    # similarity / scoring
    TOPK = int(os.getenv("TOPK", 3))
    EMBEDDING_SCORE_WEIGHT = float(os.getenv("EMBEDDING_SCORE_WEIGHT", 0.8))
    AUX_FEATURE_SCORE_WEIGHT = float(os.getenv("AUX_FEATURE_SCORE_WEIGHT", 0.2))

    FEATURE_HSV_WEIGHT = float(os.getenv("FEATURE_HSV_WEIGHT", 0.4))
    FEATURE_HIST_WEIGHT = float(os.getenv("FEATURE_HIST_WEIGHT", 0.3))
    FEATURE_SHAPE_WEIGHT = float(os.getenv("FEATURE_SHAPE_WEIGHT", 0.3))

    REVIEW_SCORE_THRESHOLD = float(os.getenv("REVIEW_SCORE_THRESHOLD", 0.75))
    REVIEW_MARGIN_THRESHOLD = float(os.getenv("REVIEW_MARGIN_THRESHOLD", 0.05))
    DEVICE = os.getenv("DEVICE", "cpu")
    YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "weights/yolo_pill_best.pt")
    EMBEDDING_MODEL_PATH = os.getenv("EMBEDDING_MODEL_PATH", "facebook/dinov2-base")
    EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", 768))
    ENABLE_QUALITY_CHECK = os.getenv("ENABLE_QUALITY_CHECK", "false").lower() == "true"

settings = Settings()