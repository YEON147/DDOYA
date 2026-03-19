import io
from pathlib import Path
from uuid import uuid4

import boto3
import numpy as np

from app.core.config import settings


def _build_reference_key(user_supplement_id: int | None = None) -> str:
    if user_supplement_id is not None:
        filename = f"{user_supplement_id}.npz"
    else:
        filename = f"{uuid4().hex}.npz"

    return f"{settings.S3_REFERENCE_PREFIX}/{filename}"


def save_reference_bundle(
    bundle: dict[str, np.ndarray],
    user_supplement_id: int | None = None,
) -> str:
    """
    reference bundle(npz)을 저장하고 논리 경로를 반환한다.
    STORAGE_BACKEND가
    - local 이면 로컬 파일 시스템에 저장
    - s3 이면 S3에 저장
    """
    key = _build_reference_key(user_supplement_id)

    buffer = io.BytesIO()
    np.savez_compressed(buffer, **bundle)
    buffer.seek(0)

    if settings.STORAGE_BACKEND == "s3":
        client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_DEFAULT_REGION,
        )
        client.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key,
            Body=buffer.getvalue(),
            ContentType="application/octet-stream",
        )
        return key

    # local fallback
    local_path = Path(settings.LOCAL_STORAGE_ROOT) / key
    local_path.parent.mkdir(parents=True, exist_ok=True)

    with open(local_path, "wb") as f:
        f.write(buffer.getvalue())

    return key

def load_reference_bundle(reference_embedding_path: str) -> dict[str, np.ndarray]:
    """
    저장된 reference bundle(npz)을 불러온다.
    반환 예시:
    {
        "embedding": np.ndarray,
        "mean_hsv": np.ndarray,
        "hue_hist": np.ndarray,
        "shape_vector": np.ndarray
    }
    """
    if settings.STORAGE_BACKEND == "s3":
        client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_DEFAULT_REGION,
        )
        response = client.get_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=reference_embedding_path,
        )
        raw_bytes = response["Body"].read()
    else:
        local_path = Path(settings.LOCAL_STORAGE_ROOT) / reference_embedding_path
        if not local_path.exists():
            raise FileNotFoundError(f"reference bundle 파일이 없습니다: {local_path}")

        with open(local_path, "rb") as f:
            raw_bytes = f.read()

    with np.load(io.BytesIO(raw_bytes), allow_pickle=False) as bundle:
        result = {}
        for key in bundle.files:
            result[key] = bundle[key].astype(np.float32)

    return result