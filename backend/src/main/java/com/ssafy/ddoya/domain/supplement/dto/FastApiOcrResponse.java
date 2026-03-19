package com.ssafy.ddoya.domain.supplement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
public class FastApiOcrResponse {

    private boolean success;
    private String message;
    private OcrData data;

    @Getter
    public static class OcrData {
        @JsonProperty("ocr_confidence")
        private Double ocrConfidence;

        @JsonProperty("body_part_id")
        private Byte bodyPartId;

        @JsonProperty("body_part_name")
        private String bodyPartName;

        @JsonProperty("serving_info")
        private ServingInfo servingInfo;

        private List<OcrIngredient> ingredients;
    }

    @Getter
    public static class ServingInfo {
        @JsonProperty("daily_dose")
        private Integer dailyDose;

        @JsonProperty("dose_per_intake")
        private Integer dosePerIntake;
    }

    @Getter
    public static class OcrIngredient {
        @JsonProperty("original_name")
        private String originalName;

        @JsonProperty("ingredient_id")
        private Long ingredientId;

        private BigDecimal amount;
        private String unit;

        @JsonProperty("is_primary")
        private Integer isPrimary;
    }
}
