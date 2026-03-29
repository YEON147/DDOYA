package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * 성분표 이미지 분석(OCR) 결과를 담는 응답 DTO 클래스입니다.
 */
@Getter
@Builder
public class IngredientAnalyzeResponse {

    /**
     * 분석 성공 여부
     */
    private boolean success;

    /**
     * 분석 결과에 대한 안내 메시지
     */
    private String message;

    /**
     * 분석된 주요 신체 부위 ID
     */
    private Byte bodyPartId;

    /**
     * 분석된 주요 신체 부위 이름
     */
    private String bodyPartName;

    /**
     * 권장 하루 섭취 횟수
     */
    private Integer dailyDose;

    /**
     * 권장 1회 섭취량
     */
    private Integer dosePerIntake;

    /**
     * 추출된 성분 목록
     */
    private List<IngredientDto> ingredients;

    /**
     * 개별 성분 분석 결과 DTO
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
         * OCR을 통해 추출된 원본 성분 이름
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
