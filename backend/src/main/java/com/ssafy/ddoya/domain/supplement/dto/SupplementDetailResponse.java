package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SupplementDetailResponse {

    private Long userSupplementId;
    private String pillImageUrl;
    private String alias;
    private List<String> primaryIngredientNames;
    private Integer dailyDose;
    private Integer stockQuantity;
    private Boolean stockNotificationEnabled;
    private List<IntakeScheduleDto> intakeSchedules;

    @Getter
    @Builder
    public static class IntakeScheduleDto {
        private Long scheduleId;
        private String intakeTime; // HH:mm
    }
}
