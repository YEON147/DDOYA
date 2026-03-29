package com.ssafy.ddoya.domain.notification.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * FCM 푸시 전송 시도의 최종 결과를 나타내는 열거형입니다.
 * 단순 성공/실패를 넘어 기기 없음 등의 도메인적 스킵 사유를 식별합니다.
 */
@Getter
@RequiredArgsConstructor
public enum PushSendResult {
    /** 발송 성공 (하나 이상의 기기에 전송 성공) */
    SUCCESS("성공"),
    
    /** 발송 스킵 (사용자에게 활성화된 기기 토큰이 없음) */
    NO_ACTIVE_DEVICE("활성 기기 없음"),
    
    /** 발송 실패 (모든 기기에 대해 FCM 서버 전송 에러 발생 또는 초기화 오류) */
    FAILED("FCM 전송 실패");

    private final String description;
}
