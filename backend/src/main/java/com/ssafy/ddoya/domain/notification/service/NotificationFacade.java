package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.repository.IntakeRecordRepository;
import com.ssafy.ddoya.domain.intake.repository.IntakeScheduleRepository;
import com.ssafy.ddoya.domain.notification.entity.NotificationDeliveryLog;
import com.ssafy.ddoya.domain.notification.enums.NotificationType;
import com.ssafy.ddoya.domain.notification.enums.PushSendResult;
import com.ssafy.ddoya.domain.notification.repository.NotificationDeliveryLogRepository;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final NotificationDeliveryLogRepository deliveryLogRepository;
    private final UserRepository userRepository;
    private final IntakeScheduleRepository intakeScheduleRepository;
    private final IntakeRecordRepository intakeRecordRepository;

    /**
     * 프론트 단 등에서 관리자 권한 없이 단숨에 푸시 기능을 QA 테스트해 볼 수 있도록 열어둔 메서드입니다.
     */
    @Transactional
    public PushSendResult sendTestNotification(Long userId, String title, String body, Map<String, String> data) {
        Map<String, String> payload = data != null ? new HashMap<>(data) : new HashMap<>();
        payload.put("notificationType", NotificationType.TEST.name());
        
        PushSendResult result = pushNotificationService.sendToUser(userId, title, body, NotificationType.TEST, payload);
        
        if (result == PushSendResult.SUCCESS) {
            saveLog(userId, NotificationType.TEST, title, body, null, null, null, 1);
        }
        return result;
    }
    
    /**
     * 영양제 복용 리마인드 알림 (INTAKE)
     */
    @Transactional
    public PushSendResult sendIntakeReminder(Long userId, Long scheduleId, Long intakeRecordId, String supplementName, int attemptNo) {
        String title = "복용 알림";
        String body = supplementName + " 복용할 시간이에요.";
        Map<String, String> data = Map.of(
                "notificationType", NotificationType.INTAKE.name(),
                "scheduleId", String.valueOf(scheduleId),
                "intakeRecordId", String.valueOf(intakeRecordId)
        );
        PushSendResult result = pushNotificationService.sendToUser(userId, title, body, NotificationType.INTAKE, data);
        
        if (result == PushSendResult.SUCCESS) {
            saveLog(userId, NotificationType.INTAKE, title, body, scheduleId, scheduleId, intakeRecordId, attemptNo);
        }
        return result;
    }

    /**
     * 영양제 챙김 알림 (CARRY)
     */
    @Transactional
    public PushSendResult sendCarryReminder(Long userId, Long scheduleId) {
        String title = "영양제 챙김 알림";
        String body = "외출 전 영양제를 챙겨주세요.";
        Map<String, String> data = Map.of(
                "notificationType", NotificationType.CARRY.name(),
                "scheduleId", String.valueOf(scheduleId)
        );
        PushSendResult result = pushNotificationService.sendToUser(userId, title, body, NotificationType.CARRY, data);

        if (result == PushSendResult.SUCCESS) {
            saveLog(userId, NotificationType.CARRY, title, body, scheduleId, scheduleId, null, 1);
        }
        return result;
    }

    /**
     * 재구매 알림 (REPURCHASE - 재고 임계치 이하 도달 시)
     */
    @Transactional
    public PushSendResult sendRepurchaseReminder(Long userId, Long userSupplementId, String supplementName, Integer stockQuantity) {
        String title = "재구매 알림";
        String body = supplementName + " 재고가 " + stockQuantity + "개 남았어요.";
        Map<String, String> data = Map.of(
                "notificationType", NotificationType.REPURCHASE.name(),
                "userSupplementId", String.valueOf(userSupplementId),
                "stockQuantity", String.valueOf(stockQuantity)
        );
        PushSendResult result = pushNotificationService.sendToUser(userId, title, body, NotificationType.REPURCHASE, data);

        if (result == PushSendResult.SUCCESS) {
            saveLog(userId, NotificationType.REPURCHASE, title, body, userSupplementId, null, null, 1);
        }
        return result;
    }

    private void saveLog(Long userId, NotificationType type, String title, String body, 
                         Long relatedId, Long scheduleId, Long intakeRecordId, int attemptNo) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        IntakeSchedule schedule = (scheduleId != null) 
                ? intakeScheduleRepository.findById(scheduleId).orElse(null) : null;
        IntakeRecord intakeRecord = (intakeRecordId != null) 
                ? intakeRecordRepository.findById(intakeRecordId).orElse(null) : null;

        NotificationDeliveryLog logEntity = NotificationDeliveryLog.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .relatedId(relatedId)
                .schedule(schedule)
                .intakeRecord(intakeRecord)
                .sentAt(LocalDateTime.now())
                .attemptNo(attemptNo)
                .build();
        
        deliveryLogRepository.save(logEntity);
    }
}
