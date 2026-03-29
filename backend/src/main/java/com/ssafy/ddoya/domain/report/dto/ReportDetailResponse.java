package com.ssafy.ddoya.domain.report.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.ssafy.ddoya.domain.report.entity.AnalysisType;

/**
 * 리포트 상세 조회 응답 DTO
 */
@Getter
@Builder
public class ReportDetailResponse {

    private Long reportId;
    private Boolean needsRefresh;
    private LocalDateTime updatedAt;
    private Boolean isEditable;
    private ReportCommentsDto comments;
    private List<RecommendedProductsByIngredientDto> recommendedProductsByIngredient;

    @JsonProperty("ingredient_analysis")
    private List<IngredientAnalysisResponse> ingredientAnalysis;

    @JsonProperty("timing_recommendations")
    private List<TimingRecommendationDto> timingRecommendations;

    @Getter
    @Builder
    public static class IngredientAnalysisResponse {
        @JsonProperty("ingredient_id")
        private Long ingredientId;
        @JsonProperty("normalized_ingredient_name")
        private String normalizedIngredientName;
        @JsonProperty("recommended_amount")
        private BigDecimal recommendedAmount;
        @JsonProperty("current_amount")
        private BigDecimal currentAmount;
        @JsonProperty("excess_ratio")
        private BigDecimal excessRatio;
        @JsonProperty("excess_amount")
        private BigDecimal excessAmount;
        @JsonProperty("deficiency_ratio")
        private BigDecimal deficiencyRatio;
        @JsonProperty("deficiency_amount")
        private BigDecimal deficiencyAmount;
        private String unit;
        @JsonProperty("analysis_type")
        private AnalysisType analysisType;
    }

    @Getter
    @Builder
    public static class ReportCommentsDto {
        private String excessComment;
        private String deficiencyComment;
        private String productComment;
        private String scheduleComment;
    }

    @Getter
    @Builder
    public static class RecommendedProductsByIngredientDto {
        private Long ingredientId;
        private String ingredientName;
        private List<RecommendedProductDto> recommendedProducts;
    }

    @Getter
    @Builder
    public static class RecommendedProductDto {
        private String productCode;
        private String productName;
    }

    /** 영양제 1개당 복수 섭취 타이밍 목록을 담는 DTO */
    @Getter
    @Builder
    public static class TimingRecommendationDto {

        @JsonProperty("user_supplement_id")
        private Long userSupplementId;

        private String alias;

        @JsonProperty("intake_timings")
        private List<IntakeTimingInfo> intakeTimings;

        @Getter
        @Builder
        public static class IntakeTimingInfo {

            @JsonProperty("intake_timing")
            private String intakeTiming;

            /** 사용자 설정 기준 실제 섭취 시각 (HH:mm), 설정이 없으면 null */
            @JsonProperty("intake_time")
            private String intakeTime;
        }
    }
}
