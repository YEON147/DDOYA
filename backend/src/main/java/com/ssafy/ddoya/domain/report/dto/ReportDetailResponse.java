package com.ssafy.ddoya.domain.report.dto;

import com.ssafy.ddoya.domain.report.entity.IntakeTiming;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

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
    private List<IntakeRecommendationSummaryDto> intakeRecommendationSummary;

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

    @Getter
    @Builder
    public static class IntakeRecommendationSummaryDto {
        private IntakeTiming intakeTiming;
        private String intakeTime;
        private List<String> supplements;
    }
}
