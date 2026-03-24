package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 프로젝트 내 각 도메인에서 알림을 발송하고 싶을 때 단일 창구(Facade)로 호출할 수 있는 서비스입니다.
 * 비즈니스 로직(섭취 일정 체크, 재고 감소 처리 등)은 이 안에서 주관하거나, 별도 스케줄러 계층에서 주관하게 됩니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationFacade {

    private final PushNotificationService pushNotificationService;

    /**
     * 프론트 단 등에서 관리자 권한 없이 단숨에 푸시 기능을 QA 테스트해 볼 수 있도록 열어둔 메서드입니다.
     */
    public void sendTestNotification(Long userId, String title, String body, NotificationType type, Map<String, String> data) {
        pushNotificationService.sendToUser(userId, title, body, type, data);
    }
    
    // =============================================
    // [확장 뼈대 설정 구간 - 추후 상세 구현 추가될 예정임]
    // =============================================

    /**
     * 영양제 섭취 알림 (EX: "비타민C 복용할 시간이에요")
     * Spring Batch, Cron 또는 Quartz 등 스케줄러 영역에서 시간이 도달할 때 호출될 수 있습니다.
     */
    public void sendIntakeReminder(Long userId) {
        // TODO: 복용 대상 영양제 조회 및 알림 텍스트 구성 로직
        // pushNotificationService.sendToUser(userId, "복용 알림", "비타민C 먹을 시간이에요!", NotificationType.INTAKE_REMINDER, null);
    }

    /**
     * 외출 챙김 알림 (EX: "외출 전 비타민 챙겨주세요!")
     */
    public void sendCarryReminder(Long userId) {
        // TODO: 외출 전 챙김 필요 영양제 조회 및 푸시 알림 발사
    }

    /**
     * 재구매 알림 (EX: "비타민C의 남은 알약이 10개 미만입니다.")
     * IntakeRecord 저장 시 재고(Stock)가 기준 임계치 밑으로 꺾였을 때 곧바로 호출되도록 구성합니다.
     */
    public void sendRepurchaseReminder(Long userId) {
        // TODO: 잔여 재고 부족 기준 검증 로직 연결
    }
}
