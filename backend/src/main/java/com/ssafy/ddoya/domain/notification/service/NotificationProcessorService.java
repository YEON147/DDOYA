package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import com.ssafy.ddoya.domain.intake.repository.IntakeScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

/**
 * 시간대별로 대량의 알림 파이프라인을 처리하는 프로세서 서비스입니다.
 * 주로 스케줄러(Scheduler) 계층에서 호출됩니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationProcessorService {

    private final IntakeScheduleRepository intakeScheduleRepository;
    private final NotificationFacade notificationFacade;

    /**
     * 특정 시각(분 단위) 기준으로 챙김 알림 수신 대상자들을 일괄 조회하여 푸시를 발송합니다.
     * 
     * @param now 현재 시각
     */
    public void processCarryReminders(LocalTime now) {
        // 초/나노초 단위를 제거하여 DB의 LocalTime(HH:mm:00)과 시/분 일치 여부 확인
        LocalTime scanTime = LocalTime.of(now.getHour(), now.getMinute());
        log.debug("[챙김 알림 프로세스] scanTime: " + scanTime);
        
        List<IntakeSchedule> targetSchedules = intakeScheduleRepository
                .findAllByScheduleTypeAndIntakeTimeAndCarryEnabled(ScheduleType.CARRY, scanTime);

        if (targetSchedules.isEmpty()) {
            return;
        }

        log.info("[챙김 알림 프로세스] 시각: {}, 대상: {}건", scanTime, targetSchedules.size());

        int successCount = 0;
        int failCount = 0;
        for (IntakeSchedule schedule : targetSchedules) {
            try {
                // 발송 성공 여부를 결과값으로 판단하여 집계
                if (notificationFacade.sendCarryReminder(schedule.getUser().getUserId())) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (Exception e) {
                log.error("[챙김 알림 발송 실패] userId={}, 이유={}", schedule.getUser().getUserId(), e.getMessage());
                failCount++;
            }
        }

        log.info("[챙김 알림 프로세스 완료] {} 시각 - 총 {}건 중 {}건 성공, {}건 실패", 
                scanTime, targetSchedules.size(), successCount, failCount);
    }
}
