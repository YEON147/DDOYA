package com.ssafy.ddoya.domain.report.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * FastAPI 리포트 생성 API 요청 DTO
 */
@Getter
@Builder
public class FastApiReportRequest {

    @JsonProperty("user_id")
    private Long userId;

    private String gender;

    @JsonProperty("birth_date")
    private LocalDate birthDate;

    private List<SupplementDto> supplements;

    @Getter
    @Builder
    public static class SupplementDto {

        @JsonProperty("user_supplement_id")
        private Long userSupplementId;

        private String alias;

        private List<IngredientDto> ingredients;
    }

    @Getter
    @Builder
    public static class IngredientDto {

        @JsonProperty("ingredient_id")
        private Long ingredientId;

        @JsonProperty("ingredient_name")
        private String ingredientName;

        private BigDecimal amount;

        private String unit;
    }
}
