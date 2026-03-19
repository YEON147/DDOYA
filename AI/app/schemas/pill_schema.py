from typing import Literal

from pydantic import BaseModel, Field


class RegisterCheckResponse(BaseModel):
    success: bool = Field(..., description="처리 성공 여부")
    message: str = Field(..., description="등록 가능 여부 또는 실패 사유")


class RegisterEmbeddingResponse(BaseModel):
    success: bool = Field(..., description="처리 성공 여부")
    reference_embedding_path: str = Field(
        default="",
        description="저장된 기준 임베딩 경로"
    )
    message: str = Field(
        default="",
        description="실패 사유 또는 보조 메시지"
    )


class ExpectedItem(BaseModel):
    user_supplement_id: int = Field(..., description="사용자 영양제 ID")
    expected_count: int = Field(..., description="예상 복용 개수")
    reference_embedding_path: str = Field(..., description="등록 시 저장된 기준 임베딩 경로")


class VerifyTopKCandidate(BaseModel):
    user_supplement_id: int = Field(..., description="후보 영양제 ID")
    score: float = Field(..., description="최종 점수")


class VerifyCropResult(BaseModel):
    crop_id: int = Field(..., description="crop 순번")
    bbox: list[int] = Field(..., description="[x1, y1, x2, y2]")
    final_user_supplement_id: int | None = Field(default=None, description="최종 분류된 영양제 ID")
    final_confidence: float = Field(default=0.0, description="최종 신뢰도")
    embedding_score: float = Field(default=0.0, description="임베딩 유사도 점수")
    feature_score: float = Field(default=0.0, description="색상/모양 보조 점수")
    review_required: bool = Field(default=False, description="검토 필요 여부")
    top_k: list[VerifyTopKCandidate] = Field(default_factory=list, description="상위 후보 목록")


class VerifySummaryItem(BaseModel):
    user_supplement_id: int = Field(..., description="사용자 영양제 ID")
    expected_count: int = Field(..., description="예상 복용 개수")
    detected_count: int = Field(..., description="탐지된 개수")
    match_confidence: float = Field(default=0.0, description="평균 매칭 신뢰도")
    review_required: bool = Field(default=False, description="검토 필요 여부")


class VerifyResponse(BaseModel):
    success: bool = Field(..., description="처리 성공 여부")
    status: Literal["SUCCESS", "REVIEW_REQUIRED", "RETAKE_REQUIRED"] = Field(
        ...,
        description="분석 상태"
    )
    message: str = Field(..., description="처리 결과 메시지")
    data: dict = Field(default_factory=dict, description="응답 데이터")