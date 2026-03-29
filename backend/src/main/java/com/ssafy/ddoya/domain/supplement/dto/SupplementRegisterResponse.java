package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * 영양제 등록 완료 후 저장된 상세 정보를 반환하는 응답 DTO 클래스입니다.
 */
@Getter
@Builder
public class SupplementRegisterResponse {

    /**
     * 저장된 영양제 ID
     */
    private Long supplementId;

    /**
     * 알약 이미지 URL
     */
    private String pillImageUrl;

    /**
     * 영양제 별칭
     */
    private String alias;

    /**
     * 설정된 1일 섭취 횟수
     */
    private Integer dailyDose;

    /**
     * 설정된 1회 섭취량
     */
    private Integer dosePerIntake;

    /**
     * 설정된 총 용량
     */
    private Integer capacity;

    /**
     * 임베딩 등에 반영되었는지 여부
     */
    private Boolean isReflected;

    /**
     * 관련 신체 부위 ID
     */
    private Byte bodyPartId;

    /**
     * 관련 신체 부위 이름
     */
    private String bodyPartName;

    /**
     * 생성된 재고 ID
     */
    private Long inventoryId;

    /**
     * 설정된 초기 재고 수량
     */
    private Integer stockQuantity;

    /**
     * 저장된 알약 특징점(Embedding) 파일 경로
     */
    private String pillReferenceEmbeddingPath;

    /**
     * 저장된 성분 목록
     */
    private List<IngredientDto> ingredients;

    /**
     * 개별 성분 저장 정보를 담는 DTO
     */
    @Getter
    @Builder
    public static class IngredientDto {
        /**
         * 정규화된 성분 ID
         */
        private Long normalizedIngredientId;

        /**
         * 정규화된 성분 이름
         */
        private String normalizedName;

        /**
         * 원본 성분 이름
         */
        private String rawName;

        /**
         * 성분 함량의 단위
         */
        private String unit;

        /**
         * 성분 함량
         */
        private BigDecimal amount;

        /**
         * 핵심 주성분 여부
         */
        private Boolean isPrimary;
    }
}
