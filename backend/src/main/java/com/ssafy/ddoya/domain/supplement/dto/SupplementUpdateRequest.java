package com.ssafy.ddoya.domain.supplement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;

import java.util.List;

/**
 * 영양제 정보 수정을 위한 요청 DTO 클래스입니다.
 * 별칭, 섭취량, 재고 정보 및 섭취 일정을 포함합니다.
 */
@Getter
public class SupplementUpdateRequest {

    /**
     * 영양제 별칭
     */
    @NotBlank(message = "영양제 별칭은 필수입니다.")
    private String alias;

    /**
     * 1일 섭취 횟수
     */
    @NotNull(message = "일일 섭취횟수는 필수입니다.")
    @Min(value = 1, message = "일일 섭취횟수는 1 이상이어야 합니다.")
    private Integer dailyDose;

    /**
     * 1회 섭취량
     */
    @NotNull(message = "1회 섭취량은 필수입니다.")
    @Min(value = 1, message = "1회 섭취량은 1 이상이어야 합니다.")
    private Integer dosePerIntake;

    /**
     * 현재 재고 수량
     */
    @NotNull(message = "재고 수량은 필수입니다.")
    @Min(value = 0, message = "재고 수량은 0 이상이어야 합니다.")
    private Integer stockQuantity;

    /**
     * 재고 부족 알림 활성화 여부
     */
    @NotNull(message = "재고 알림 여부는 필수입니다.")
    private Boolean stockNotificationEnabled;

    /**
     * 수정하거나 새로 추가할 섭취 일정 목록
     */
    @Valid
    @NotEmpty(message = "섭취 스케줄은 최소 1개 이상이어야 합니다.")
    private List<IntakeScheduleUpdateDto> intakeSchedules;

    /**
     * 개별 섭취 시각 수정을 위한 DTO
     */
    @Getter
    public static class IntakeScheduleUpdateDto {

        /**
         * 기존 스케줄 ID (기존 스케줄 수정 시 필수, 신규 추가 시 null)
         */
        private Long scheduleId;

        /**
         * 섭취 시각 (HH:mm 형식)
         */
        @NotBlank(message = "섭취 시각은 필수입니다.")
        @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "섭취 시각 형식이 올바르지 않습니다. (HH:mm)")
        private String intakeTime;
    }
}
