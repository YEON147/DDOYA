package com.ssafy.ddoya.domain.supplement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * 영양제 등록 요청을 위한 DTO 클래스입니다.
 * 사용자 입력 정보와 AI 분석 결과를 함께 포함합니다.
 */
@Getter
public class SupplementRegisterRequest {

    /**
     * 사용자가 영양제에 붙인 이름 (별칭)
     */
    @NotBlank(message = "영양제 별칭은 필수입니다.")
    private String alias;

    /**
     * 1일 섭취 횟수
     */
    @NotNull(message = "1일 섭취 횟수는 필수입니다.")
    @Min(value = 1, message = "1일 섭취 횟수는 1 이상이어야 합니다.")
    private Integer dailyDose;

    /**
     * 1회 섭취량
     */
    @NotNull(message = "1회 섭취량은 필수입니다.")
    @Min(value = 1, message = "1회 섭취량은 1 이상이어야 합니다.")
    private Integer dosePerIntake;

    /**
     * 영양제의 총 용량
     */
    @NotNull(message = "총 용량은 필수입니다.")
    @Min(value = 0, message = "총 용량은 양수이어야 합니다.")
    private Integer capacity;

    /**
     * 알약 이미지의 Embedding 파일 저장 경로
     */
    private String pillReferenceEmbeddingPath;

    /**
     * 분석을 통해 추출된 주요 신체 부위 ID
     */
    @NotNull(message = "신체 부위 ID는 필수입니다.")
    private Byte bodyPartId;

    /**
     * 분석을 통해 추출된 주요 신체 부위 이름
     */
    private String bodyPartName;

    /**
     * 분석을 통해 추출된 성분 목록
     */
    @Valid
    @NotEmpty(message = "성분 분석 결과는 최소 1개 이상이어야 합니다.")
    private List<IngredientDto> ingredients;

    /**
     * 영양제 성분에 대한 상세 정보 DTO
     */
    @Getter
    public static class IngredientDto {
        /**
         * 정규화된 성분 ID (IngredientMaster ID)
         */
        @NotNull(message = "성분 ID는 필수입니다.")
        private Long normalizedIngredientId;

        /**
         * 정규화된 성분 이름
         */
        @NotBlank(message = "정규화된 성분명은 필수입니다.")
        private String normalizedName;

        /**
         * 추출된 원본 성분 이름
         */
        @NotBlank(message = "원본 성분명은 필수입니다.")
        private String rawName;

        /**
         * 성분 함량의 단위
         */
        @NotBlank(message = "성분 단위는 필수입니다.")
        private String unit;

        /**
         * 성분 함량
         */
        @NotNull(message = "성분 함량은 필수입니다.")
        private BigDecimal amount;

        /**
         * 핵심 주성분 여부
         */
        @NotNull(message = "주성분 여부는 필수입니다.")
        private Boolean isPrimary;
    }
}
