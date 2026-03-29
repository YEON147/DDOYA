package com.ssafy.ddoya.domain.intake.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class FastApiVerifyRequest {
    @JsonProperty("expected_items")
    private List<ExpectedItem> expectedItems;

    @Getter
    @Builder
    public static class ExpectedItem {
        @JsonProperty("user_supplement_id")
        private Long userSupplementId;

        @JsonProperty("dose_per_intake")
        private Integer dosePerIntake;

        @JsonProperty("pill_reference_embedding_path")
        private String pillReferenceEmbeddingPath;
    }
}
