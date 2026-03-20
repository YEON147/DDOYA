package com.ssafy.ddoya.domain.intake.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
public class IntakeScheduleResponse {
    private LocalDate targetDate;
    private List<TimeSlotDto> timeSlots;

    @Getter
    @Builder
    public static class TimeSlotDto {
        private String intakeTime;
        private LocalDateTime plannedAt;
        private List<IntakeItemDto> items;
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.ALWAYS)
    public static class IntakeItemDto {
        private Long scheduleId;
        private Long userSupplementId;
        private String alias;
        private Integer dosePerIntake;
        private Long intakeRecordId;
        private String status;
        private LocalDateTime actionAt;
        private LocalDateTime plannedAt;

        @JsonIgnore
        private LocalTime rawIntakeTime;
    }
}
