package com.ssafy.ddoya.domain.intake.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 사용자의 일일 섭취 일정 정보를 반환하기 위한 응답 DTO입니다.
 */
@Getter
@Builder
public class IntakeScheduleResponse {
    /** 조회 대상 날짜 */
    private LocalDate targetDate;
    /** 시간대별 섭취 정보 슬롯 리스트 */
    private List<TimeSlotDto> timeSlots;

    /**
     * 특정 시간대에 묶인 섭취 정보 목록을 담는 DTO입니다.
     */
    @Getter
    @Builder
    public static class TimeSlotDto {
        /** 섭취 시간 (HH:mm) */
        private String intakeTime;
        /** 계획된 일시 */
        private LocalDateTime plannedAt;
        /** 해당 시간대의 상세 섭취 항목 리스트 */
        private List<IntakeItemDto> items;
    }

    /**
     * 개별 영양제 섭취 항목에 대한 상세 정보 DTO입니다.
     */
    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.ALWAYS)
    public static class IntakeItemDto {
        /** 관련 일정 ID */
        private Long scheduleId;
        /** 사용자 영양제 ID */
        private Long userSupplementId;
        /** 영양제 별칭 */
        private String alias;
        /** 1회 섭취량 */
        private Integer dosePerIntake;
        /** 섭취 기록 ID */
        private Long intakeRecordId;
        /** 현재 섭취 상태 (TAKEN, MISSED, SKIPPED 등) */
        private String status;
        /** 실제 처리 일시 */
        private LocalDateTime actionAt;
        /** 계획된 일시 */
        private LocalDateTime plannedAt;

        /** 내부 처리를 위한 원본 섭취 시각 */
        @JsonIgnore
        private LocalTime rawIntakeTime;
    }
}
