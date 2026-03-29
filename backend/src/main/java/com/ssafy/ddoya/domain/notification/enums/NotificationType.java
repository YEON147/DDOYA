package com.ssafy.ddoya.domain.notification.enums;

/**
 * FCM 푸시 알림의 타입을 식별하기 위한 열거형입니다.
 * 향후 앱 내 푸시 클릭 시 화면 이동 분기 처리에 사용됩니다.
 */
public enum NotificationType {
    INTAKE,     // 섭취 알림 (정해진 시간에 복용 리마인드)
    CARRY,      // 챙김 알림 (외출 전 영양제 챙김 리마인드)
    REPURCHASE, // 재구매 알림 (재고가 N개 이하로 떨어졌을 때)
    TEST                 // 테스트용 알림
}
