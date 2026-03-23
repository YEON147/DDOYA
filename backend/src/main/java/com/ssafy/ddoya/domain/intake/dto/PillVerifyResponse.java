package com.ssafy.ddoya.domain.intake.dto;

import com.ssafy.ddoya.domain.intake.entity.IntakeStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PillVerifyResponse {
    private boolean success;
    private String message;
    private List<VerifyResult> results;

    @Getter
    @Builder
    public static class VerifyResult {
        private Long scheduleId;
        private Long userSupplementId;
        private Integer dosePerIntake;
        private Integer detectedAmount;
        private Boolean matched;
        private IntakeStatus beforeStatus;
        private IntakeStatus afterStatus;
    }
}
