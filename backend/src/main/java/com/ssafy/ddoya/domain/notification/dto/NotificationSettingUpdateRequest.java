package com.ssafy.ddoya.domain.notification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 알림 수신 여부 수정을 위한 요청 DTO입니다.
 */
@Getter
@Setter
@NoArgsConstructor
public class NotificationSettingUpdateRequest {

    @NotNull(message = "알림 수신 여부는 필수입니다.")
    private Boolean enabled;

}
