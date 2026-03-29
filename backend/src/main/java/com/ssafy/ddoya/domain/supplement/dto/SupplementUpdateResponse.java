package com.ssafy.ddoya.domain.supplement.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 영양제 정보 수정 후 최종 상태를 반환하는 응답 DTO 클래스입니다.
 */
@Getter
@Builder
public class SupplementUpdateResponse {

    /**
     * 영양제 ID
     */
    private Long userSupplementId;

    /**
     * 수정된 별칭
     */
    private String alias;

    /**
     * 수정된 1일 섭취 횟수
     */
    private Integer dailyDose;

    /**
     * 수정된 1회 섭취량
     */
    private Integer dosePerIntake;

    /**
     * 수정된 재고 수량
     */
    private Integer stockQuantity;

    /**
     * 수정된 재고 알림 설정 상태
     */
    private Boolean stockNotificationEnabled;

    /**
     * 최종 동기화된 섭취 일정 리스트
     */
    private List<IntakeScheduleDto> intakeSchedules;

    /**
     * 최종 일정 정보를 담는 DTO
     */
    @Getter
    @Builder
    public static class IntakeScheduleDto {
        /**
         * 스케줄 ID
         */
        private Long scheduleId;
        /**
         * 섭취 시각 (HH:mm)
         */
        private String intakeTime;
    }
}
