package com.ssafy.ddoya.domain.notification.scheduler;

import com.ssafy.ddoya.domain.notification.service.NotificationProcessorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 정해진 섭취 시각에 영양제 복용을 리마인드하는 섭취 알림 스케줄러입니다.
 * 미복용 시 5분 간격으로 재알림을 발송하는 로직을 포함합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IntakeNotificationScheduler {

    private final NotificationProcessorService notificationProcessorService;

    /**
     * 매 1분마다(0초 기준) 실행되어 현재 시각 및 과거 미복용 건에 대한 알림을 처리합니다.
     * 실행 시각 기준은 Asia/Seoul 타임존을 따릅니다.
     */
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    public void runIntakeReminderScheduler() {
        LocalDateTime now = LocalDateTime.now();
        log.debug("[섭취 알림 스케줄러 시작] 기준 시각: {}", now);
        
        try {
            // 알림 프로세서 호출 (재시도 로직 포함)
            notificationProcessorService.processIntakeReminders(now);
        } catch (Exception e) {
            log.error("[섭취 알림 스케줄러 실행 중 에러 발생] : ", e);
        }

        log.debug("[섭취 알림 스케줄러 종료]");
    }
}
