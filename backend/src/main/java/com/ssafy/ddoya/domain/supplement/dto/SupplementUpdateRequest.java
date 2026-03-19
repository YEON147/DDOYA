package com.ssafy.ddoya.domain.supplement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;

import java.util.List;

@Getter
public class SupplementUpdateRequest {

    @NotBlank(message = "영양제 별칭은 필수입니다.")
    private String alias;

    @NotNull(message = "일일 섭취횟수는 필수입니다.")
    @Min(value = 1, message = "일일 섭취횟수는 1 이상이어야 합니다.")
    private Integer dailyDose;

    @NotNull(message = "1회 섭취량은 필수입니다.")
    @Min(value = 1, message = "1회 섭취량은 1 이상이어야 합니다.")
    private Integer dosePerIntake;

    @NotNull(message = "재고 수량은 필수입니다.")
    @Min(value = 0, message = "재고 수량은 0 이상이어야 합니다.")
    private Integer stockQuantity;

    @NotNull(message = "재고 알림 여부는 필수입니다.")
    private Boolean stockNotificationEnabled;

    @Valid
    @NotEmpty(message = "섭취 스케줄은 최소 1개 이상이어야 합니다.")
    private List<IntakeScheduleUpdateDto> intakeSchedules;

    @Getter
    public static class IntakeScheduleUpdateDto {

        // 기존 스케줄 수정 시 전달, 새 스케줄이면 null
        private Long scheduleId;

        // HH:mm 형식 강제 — JSON 역직렬화를 @JsonFormat 없이 String으로 받고 Service에서 LocalTime.parse("HH:mm") 처리
        @NotBlank(message = "섭취 시각은 필수입니다.")
        @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "섭취 시각 형식이 올바르지 않습니다. (HH:mm)")
        private String intakeTime;
    }
}
