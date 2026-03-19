package com.ssafy.ddoya.domain.supplement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * FastAPI 서버로부터 받은 OCR 분석 원본 응답을 담는 DTO 클래스입니다.
 */
@Getter
public class FastApiOcrResponse {

    /**
     * OCR 분석 성공 여부
     */
    private boolean success;

    /**
     * 응답 메시지
     */
    private String message;

    /**
     * 상세 분석 데이터
     */
    private OcrData data;

    /**
     * OCR 분석 상세 데이터를 담은 클래스
     */
    @Getter
    public static class OcrData {
        /**
         * OCR 인식 신뢰도 점수
         */
        @JsonProperty("ocr_confidence")
        private Double ocrConfidence;

        /**
         * 분석된 신체 부위 ID
         */
        @JsonProperty("body_part_id")
        private Byte bodyPartId;

        /**
         * 분석된 신체 부위 이름
         */
        @JsonProperty("body_part_name")
        private String bodyPartName;

        /**
         * 섭취 가이드 정보
         */
        @JsonProperty("serving_info")
        private ServingInfo servingInfo;

        /**
         * 분석된 성분 목록
         */
        private List<OcrIngredient> ingredients;
    }

    /**
     * 섭취 관련 정보를 담은 클래스
     */
    @Getter
    public static class ServingInfo {
        /**
         * 1일 섭취 횟수
         */
        @JsonProperty("daily_dose")
        private Integer dailyDose;

        /**
         * 1회 섭취량
         */
        @JsonProperty("dose_per_intake")
        private Integer dosePerIntake;
    }

    /**
     * 개별 성분 분석 데이터를 담은 클래스
     */
    @Getter
    public static class OcrIngredient {
        /**
         * 사진상의 원본 성분 이름
         */
        @JsonProperty("original_name")
        private String originalName;

        /**
         * 매핑된 정규화 성분 마스터 ID
         */
        @JsonProperty("ingredient_id")
        private Long ingredientId;

        /**
         * 성분 함량
         */
        private BigDecimal amount;

        /**
         * 성분 함량 단위
         */
        private String unit;

        /**
         * 주성분 여부 (1: 주성분, 0: 기타)
         */
        @JsonProperty("is_primary")
        private Integer isPrimary;
    }
}
