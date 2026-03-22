package com.ssafy.ddoya.domain.intake.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 알약 복용 인증 분석을 요청할 때 사용하는 DTO 클래스입니다.
 */
@Getter
@Setter
public class PillVerifyRequest {

    /** 분석 대상이 되는 기대 영양제 목록 */
    @NotEmpty(message = "인증할 영양제 목록이 비어있습니다.")
    @Valid
    private List<ExpectedItemDto> expectedItems;

    /**
     * 분석 시 기대되는 개별 영양제 정보 DTO입니다.
     */
    @Getter
    @Setter
    public static class ExpectedItemDto {
        /** 사용자 영양제 ID */
        @NotNull(message = "영양제 ID는 필수입니다.")
        private Long userSupplementId;

        /** 기대 섭취량 */
        @NotNull(message = "권장 섭취량은 필수입니다.")
        @Min(value = 1, message = "섭취량은 1개 이상이어야 합니다.")
        private Integer dosePerIntake;

        /** 비교 분석에 사용될 약 이미지 임베딩 경로 */
        @NotEmpty(message = "참조 임베딩 경로는 필수입니다.")
        private String pillReferenceEmbeddingPath;
    }
}
