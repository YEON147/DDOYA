package com.ssafy.ddoya.domain.notification.dto;

import com.ssafy.ddoya.domain.notification.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 관리자(테스트)가 특정 회원에게 푸시 알림을 발송하기 위해 요청하는 정보 DTO입니다.
 */
@Getter
@NoArgsConstructor
public class PushSendRequest {

    @NotNull(message = "알림을 발송할 대상 사용자 ID 값은 필수입니다.")
    private Long userId;

    @NotBlank(message = "푸시 알림 제목은 필수입니다.")
    private String title;

    @NotBlank(message = "푸시 알림 본문 내용은 필수입니다.")
    private String body;

    @NotNull(message = "푸시 알림 타입 카테고리는 필수입니다. (INTAKE_REMINDER, TEST 등)")
    private NotificationType notificationType;

    // 클라이언트 앱 내의 화면 분기 및 파라미터 전달 등에 활용될 추가 데이터 맵
    private Map<String, String> data;
}
