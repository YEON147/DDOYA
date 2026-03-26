package com.ssafy.ddoya.domain.report.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * FastAPI 리포트 생성 API 응답 DTO
 */
@Getter
public class FastApiReportResponse {

    private boolean success;
    private String message;
    private ReportData data;

    @Getter
    public static class ReportData {

        @JsonProperty("ingredient_analysis")
        private List<IngredientAnalysisDto> ingredientAnalysis;

        @JsonProperty("recommended_products")
        private List<RecommendedProductDto> recommendedProducts;

        @JsonProperty("timing_recommendations")
        private List<TimingRecommendationDto> timingRecommendations;

        private CommentsDto comments;
    }

    @Getter
    public static class IngredientAnalysisDto {

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
        private String analysisType;
    }

    @Getter
    public static class RecommendedProductDto {

        @JsonProperty("product_code")
        private String productCode;

        @JsonProperty("product_name")
        private String productName;

        @JsonProperty("ingredient_id")
        private Long ingredientId;
    }

    @Getter
    public static class TimingRecommendationDto {

        @JsonProperty("user_supplement_id")
        private Long userSupplementId;

        private String alias;

        @JsonProperty("intake_timing")
        private String intakeTiming;
    }

    @Getter
    public static class CommentsDto {

        @JsonProperty("excess_comment")
        private String excessComment;

        @JsonProperty("deficiency_comment")
        private String deficiencyComment;

        @JsonProperty("product_comment")
        private String productComment;

        @JsonProperty("schedule_comment")
        private String scheduleComment;
    }
}
