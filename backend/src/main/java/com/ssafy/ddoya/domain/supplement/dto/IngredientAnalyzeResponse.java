package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class IngredientAnalyzeResponse {

    private Byte bodyPartId;
    private String bodyPartName;
    private List<IngredientDto> ingredients;

    @Getter
    @Builder
    public static class IngredientDto {
        private Long normalizedIngredientId;
        private String normalizedName;
        private String rawName;
        private String unit;
        private BigDecimal amount;
        private Boolean isPrimary;
    }
}
