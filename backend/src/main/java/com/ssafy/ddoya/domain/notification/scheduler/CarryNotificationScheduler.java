package com.ssafy.ddoya.domain.notification.scheduler;

import com.ssafy.ddoya.domain.notification.service.NotificationProcessorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

/**
 * 챙김 알림(CARRY) 대상을 주기적으로 체크하고 발송을 트리거하는 스케줄러 클래스입니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CarryNotificationScheduler {

    private final NotificationProcessorService notificationProcessorService;

    /**
     * 매 1분마다(0초 기준) 실행되어 현재 시각에 설정된 챙김 알림을 발송합니다.
     * 실행 시각 기준은 Asia/Seoul 타임존을 따릅니다.
     */
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    public void runCarryReminderScheduler() {
        LocalTime now = LocalTime.now();
        log.debug("[챙김 알림 스케줄러 시작] 현재 시각: {}", now);
        
        try {
            notificationProcessorService.processCarryReminders(now);
        } catch (Exception e) {
            // 스케줄러 자체의 예외가 발생하더라도 로그를 남기고 시스템은 유지되도록 처리
            log.error("[챙김 알림 스케줄러 실행 중 치명적 에러 발생] : ", e);
        }

        log.debug("[챙김 알림 스케줄러 종료]");
    }
}
