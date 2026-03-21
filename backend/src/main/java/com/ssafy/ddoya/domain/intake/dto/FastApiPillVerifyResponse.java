package com.ssafy.ddoya.domain.intake.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class FastApiPillVerifyResponse {
    private boolean success;
    private String message;
    private List<VerifyResult> results;

    @Getter
    @NoArgsConstructor
    public static class VerifyResult {
        @JsonProperty("user_supplement_id")
        private Long userSupplementId;

        @JsonProperty("dose_per_intake")
        private Integer dosePerIntake;

        @JsonProperty("detected_amount")
        private Integer detectedAmount;
    }
}
