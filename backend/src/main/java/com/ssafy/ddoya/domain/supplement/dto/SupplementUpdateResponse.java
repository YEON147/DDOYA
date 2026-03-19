package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SupplementUpdateResponse {

    private Long userSupplementId;
    private String alias;
    private Integer dailyDose;
    private Integer dosePerIntake;
    private Integer stockQuantity;
    private Boolean stockNotificationEnabled;
    private List<IntakeScheduleDto> intakeSchedules;

    @Getter
    @Builder
    public static class IntakeScheduleDto {
        private Long scheduleId;
        private String intakeTime; // "HH:mm"
    }
}
