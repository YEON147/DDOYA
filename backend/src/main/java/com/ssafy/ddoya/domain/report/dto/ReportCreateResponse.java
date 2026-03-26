package com.ssafy.ddoya.domain.report.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * POST /api/reports 성공 응답 DTO
 * FastAPI 응답 전체를 포함하며, timing_recommendations에 intake_time 필드가 추가됩니다.
 */
@Getter
@Builder
public class ReportCreateResponse {

    /** 생성/갱신된 리포트 메타 정보 */
    private Long reportId;
    private Boolean needsRefresh;
    private LocalDateTime updatedAt;

    /** 리포트 생성/갱신 직후에는 항상 true. 프론트에 편집 가능 여부를 알립니다. */
    @JsonProperty("is_editable")
    private Boolean isEditable;

    /** FastAPI 분석 결과 전체 */
    @JsonProperty("ingredient_analysis")
    private List<FastApiReportResponse.IngredientAnalysisDto> ingredientAnalysis;

    @JsonProperty("recommended_products")
    private List<FastApiReportResponse.RecommendedProductDto> recommendedProducts;

    /** intake_time 필드가 주입된 타이밍 추천 목록 */
    @JsonProperty("timing_recommendations")
    private List<TimingRecommendationWithTimeDto> timingRecommendations;

    private FastApiReportResponse.CommentsDto comments;

    /**
     * FastAPI의 TimingRecommendationDto에 intake_time 필드가 추가된 확장 DTO.
     * 영양제 1개당 복수의 섭취 타이밍을 지원합니다.
     */
    @Getter
    @Builder
    public static class TimingRecommendationWithTimeDto {

        @JsonProperty("user_supplement_id")
        private Long userSupplementId;

        private String alias;

        @JsonProperty("intake_timings")
        private List<IntakeTimingInfo> intakeTimings;

        /** 섭취 타이밍 1건: timing 이름 + 사용자 설정 시각 */
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
