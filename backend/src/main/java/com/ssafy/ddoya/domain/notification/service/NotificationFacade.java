package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 프로젝트 내 각 도메인에서 알림을 발송하고 싶을 때 단일 창구(Facade)로 호출할 수 있는 서비스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationFacade {

    private final PushNotificationService pushNotificationService;

    /**
     * 프론트 단 등에서 관리자 권한 없이 단숨에 푸시 기능을 QA 테스트해 볼 수 있도록 열어둔 메서드입니다.
     */
    public boolean sendTestNotification(Long userId, String title, String body, Map<String, String> data) {
        Map<String, String> payload = data != null ? new HashMap<>(data) : new HashMap<>();
        payload.put("notificationType", NotificationType.TEST.name());
        
        return pushNotificationService.sendToUser(userId, title, body, NotificationType.TEST, payload);
    }
    
    /**
     * 영양제 섭취 알림
     */
    public boolean sendIntakeReminder(Long userId, Long scheduleId, Long intakeRecordId, String supplementName) {
        String title = "복용 알림";
        String body = supplementName + " 복용할 시간이에요.";
        Map<String, String> data = Map.of(
                "notificationType", NotificationType.INTAKE.name(),
                "scheduleId", String.valueOf(scheduleId),
                "intakeRecordId", String.valueOf(intakeRecordId)
        );
        return pushNotificationService.sendToUser(userId, title, body, NotificationType.INTAKE, data);
    }

    /**
     * 챙김 알림
     */
    public boolean sendCarryReminder(Long userId) {
        String title = "영양제 챙김 알림";
        String body = "외출 전 영양제를 챙겨주세요.";
        Map<String, String> data = Map.of(
                "notificationType", NotificationType.CARRY.name()
        );
        return pushNotificationService.sendToUser(userId, title, body, NotificationType.CARRY, data);
    }

    /**
     * 재구매 알림 (재고 임계치 이하 도달 시)
     */
    public boolean sendRepurchaseReminder(Long userId, Long userSupplementId, String supplementName, Integer stockQuantity) {
        String title = "재구매 알림";
        String body = supplementName + " 재고가 " + stockQuantity + "개 남았어요.";
        Map<String, String> data = Map.of(
                "notificationType", NotificationType.REPURCHASE.name(),
                "userSupplementId", String.valueOf(userSupplementId),
                "stockQuantity", String.valueOf(stockQuantity)
        );
        return pushNotificationService.sendToUser(userId, title, body, NotificationType.REPURCHASE, data);
    }
}
