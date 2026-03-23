package com.ssafy.ddoya.domain.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 약 챙김 알림 시각 수정 결과 응답 DTO입니다.
 */
@Getter
@AllArgsConstructor
public class CarryNotificationTimeUpdateResponse {

    @JsonProperty("carry_notification_time")
    private String carryNotificationTime;

}
