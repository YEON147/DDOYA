from pydantic import BaseModel, Field


class RegisterCheckResponse(BaseModel):
    success: bool = Field(..., description="처리 성공 여부")
    message: str = Field(..., description="등록 가능 여부 또는 실패 사유")


class RegisterEmbeddingResponse(BaseModel):
    success: bool = Field(..., description="처리 성공 여부")
    pillReferenceEmbeddingPath: str = Field(
        default="",
        description="저장된 기준 임베딩 경로"
    )
    message: str = Field(
        default="",
        description="실패 사유 또는 보조 메시지"
    )


class ExpectedItem(BaseModel):
    user_supplement_id: int = Field(..., description="사용자 영양제 ID")
    dose_per_intake: int = Field(..., description="예상 복용 개수")
    pill_reference_embedding_path: str = Field(
        ...,
        description="등록 시 저장된 기준 임베딩 경로"
    )


class VerifyResultItem(BaseModel):
    user_supplement_id: int = Field(..., description="사용자 영양제 ID")
    dose_per_intake: int = Field(..., description="예상 복용 개수")
    detected_amount: int = Field(..., description="탐지된 개수")


class VerifyResponse(BaseModel):
    success: bool = Field(..., description="처리 성공 여부")
    message: str = Field(..., description="처리 결과 메시지")
    results: list[VerifyResultItem] | None = Field(
        default=None,
        description="영양제별 분석 결과"
    )