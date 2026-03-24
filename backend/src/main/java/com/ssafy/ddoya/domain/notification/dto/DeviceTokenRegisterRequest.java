package com.ssafy.ddoya.domain.notification.dto;

import com.ssafy.ddoya.domain.notification.enums.DeviceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 앱 클라이언트에서 발급받은 최신 FCM 토큰을 서버에 등록할 때 사용하는 DTO입니다.
 */
@Getter
@NoArgsConstructor
public class DeviceTokenRegisterRequest {

    @NotBlank(message = "FCM 토큰 문자열 값이 누락되었습니다.")
    private String fcmToken;

    @NotNull(message = "기기 타입(ANDROID, IOS)을 명시해야 합니다.")
    private DeviceType deviceType;
}
