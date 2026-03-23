package com.ssafy.ddoya.domain.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 약 챙김 알림 시각 수정을 위한 요청 DTO입니다.
 */
@Getter
@Setter
@NoArgsConstructor
public class CarryNotificationTimeUpdateRequest {

    @NotBlank(message = "약 챙김 알림 시각은 필수입니다.")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "약 챙김 알림 시각은 HH:mm 형식이어야 합니다.")
    @JsonProperty("carry_notification_time")
    private String carryNotificationTime;

}
