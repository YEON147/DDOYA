package com.ssafy.ddoya.domain.notification.dto;

import com.ssafy.ddoya.domain.user.entity.UserNotificationSetting;
import lombok.Builder;
import lombok.Getter;

/**
 * 알림 수신 여부 설정을 반환하기 위한 응답 DTO입니다.
 */
@Getter
@Builder
public class NotificationSettingResponse {

    private boolean intakeNotificationEnabled;
    private boolean carryNotificationEnabled;
    private boolean stockNotificationEnabled;

    /**
     * UserNotificationSetting 엔티티로부터 NotificationSettingResponse DTO를 생성합니다.
     *
     * @param setting 알림 설정 엔티티
     * @return 알림 설정 응답 DTO
     */
    public static NotificationSettingResponse from(UserNotificationSetting setting) {
        return NotificationSettingResponse.builder()
                .intakeNotificationEnabled(setting.isIntakeNotificationEnabled())
                .carryNotificationEnabled(setting.isCarryNotificationEnabled())
                .stockNotificationEnabled(setting.isStockNotificationEnabled())
                .build();
    }
}
