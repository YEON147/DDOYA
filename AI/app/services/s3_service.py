import io
from pathlib import Path
from uuid import uuid4

import boto3
import numpy as np

from app.core.config import settings


def _use_s3() -> bool:
    return settings.STORAGE_BACKEND == "s3"


def _validate_s3_settings() -> None:
    missing_fields = []

    if not settings.AWS_S3_BUCKET:
        missing_fields.append("AWS_S3_BUCKET")
    if not settings.AWS_ACCESS_KEY_ID:
        missing_fields.append("AWS_ACCESS_KEY_ID")
    if not settings.AWS_SECRET_ACCESS_KEY:
        missing_fields.append("AWS_SECRET_ACCESS_KEY")
    if not settings.AWS_DEFAULT_REGION:
        missing_fields.append("AWS_DEFAULT_REGION or AWS_REGION")

    if missing_fields:
        joined = ", ".join(missing_fields)
        raise ValueError(f"S3 설정이 누락되었습니다: {joined}")


def _create_s3_client():
    _validate_s3_settings()

    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_DEFAULT_REGION,
    )


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

    if _use_s3():
        client = _create_s3_client()
        client.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key,
            Body=buffer.getvalue(),
            ContentType="application/octet-stream",
        )
        return key

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
    if not reference_embedding_path:
        raise ValueError("reference_embedding_path가 비어 있습니다.")

    if _use_s3():
        client = _create_s3_client()
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