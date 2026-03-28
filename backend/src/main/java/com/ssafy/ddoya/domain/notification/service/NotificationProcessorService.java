package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import com.ssafy.ddoya.domain.intake.repository.IntakeRecordRepository;
import com.ssafy.ddoya.domain.intake.repository.IntakeScheduleRepository;
import com.ssafy.ddoya.domain.notification.entity.NotificationDeliveryLog;
import com.ssafy.ddoya.domain.notification.enums.PushSendResult;
import com.ssafy.ddoya.domain.notification.repository.DeviceTokenRepository;
import com.ssafy.ddoya.domain.notification.repository.NotificationDeliveryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 시간대별로 대량의 알림 파이프라인을 처리하는 프로세서 서비스입니다.
 * 주로 스케줄러(Scheduler) 계층에서 호출됩니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationProcessorService {

    private final IntakeScheduleRepository intakeScheduleRepository;
    private final IntakeRecordRepository intakeRecordRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final NotificationDeliveryLogRepository deliveryLogRepository;
    private final NotificationFacade notificationFacade;

    /**
     * 특정 시각(분 단위) 기준으로 챙김 알림 수신 대상자들을 일괄 조회하여 푸시를 발송합니다.
     * 
     * @param now 현재 시각
     */
    public void processCarryReminders(LocalTime now) {
        LocalTime scanTime = LocalTime.of(now.getHour(), now.getMinute());

        List<IntakeSchedule> targetSchedules = intakeScheduleRepository
                .findAllByScheduleTypeAndIntakeTimeAndCarryEnabledAndIsActiveTrue(ScheduleType.CARRY, scanTime);

        if (targetSchedules.isEmpty()) {
            return;
        }

        log.info("[챙김 알림 프로세스] 시각: {}, 대상: {}건", scanTime, targetSchedules.size());

        // 벌크 사전 조회: 대상 유저들의 활성 기기 보유 여부를 한 번의 쿼리로 확인
        Set<Long> userIds = targetSchedules.stream().map(s -> s.getUser().getUserId()).collect(Collectors.toSet());
        Set<Long> usersWithDevices = deviceTokenRepository.findAllByUser_UserIdInAndIsActiveTrue(userIds)
                .stream().map(dt -> dt.getUser().getUserId()).collect(Collectors.toSet());

        int successCount = 0;
        int failCount = 0;
        int skipCount = 0;

        for (IntakeSchedule schedule : targetSchedules) {
            Long userId = schedule.getUser().getUserId();

            // 1. 기기 유무 사전 필터링
            if (!usersWithDevices.contains(userId)) {
                log.info("[챙김 알림 스킵] userId={} - 사유: 활성 기기 없음", userId);
                skipCount++;
                continue;
            }

            try {
                // 2. 발송 및 결과 상세 집계
                PushSendResult result = notificationFacade.sendCarryReminder(userId, schedule.getScheduleId());

                switch (result) {
                    case SUCCESS -> {
                        log.info("[챙김 알림 발송 성공] userId={}", userId);
                        successCount++;
                    }
                    case FAILED -> {
                        log.error("[챙김 알림 발송 실패] userId={} - 사유: FCM 서버 리턴 에러", userId);
                        failCount++;
                    }
                    case NO_ACTIVE_DEVICE -> {
                        log.info("[챙김 알림 스킵] userId={} - 사유: 활성 기기 없음", userId);
                        skipCount++;
                    }
                }
            } catch (Exception e) {
                log.error("[챙김 알림 프로세스 에러] userId={}, 이유={}", userId, e.getMessage());
                failCount++;
            }
        }

        log.info("[챙김 알림 프로세스 완료] {} 시각 - 총 {}건 중 성공 {}건, 실패 {}건, 스킵(기기없음) {}건",
                scanTime, targetSchedules.size(), successCount, failCount, skipCount);
    }

    /**
     * 현재 시각 기준, 복용하지 않은 영양제(MISSED)에 대한 '섭취 알림'을 발송합니다.
     * 5분 간격 로그 기반 재처리 로직이 포함되어 있습니다.
     * 
     * @param now 현재 시각
     */
    @Transactional
    public void processIntakeReminders(LocalDateTime now) {
        log.debug("[섭취 알림 프로세스 시작] 기준 시각: {}", now);

        // 오늘 00:00:00 이후의 기록만 대상으로 한정
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        List<IntakeRecord> targets = intakeRecordRepository.findIntakeReminders(now, startOfDay);

        if (targets.isEmpty()) {
            return;
        }

        // 벌크 사전 조회: 대상 유저들의 활성 기기 보유 여부 확인
        Set<Long> userIds = targets.stream().map(ir -> ir.getSchedule().getUser().getUserId())
                .collect(Collectors.toSet());
        Set<Long> usersWithDevices = deviceTokenRepository.findAllByUser_UserIdInAndIsActiveTrue(userIds)
                .stream().map(dt -> dt.getUser().getUserId()).collect(Collectors.toSet());

        int successCount = 0;
        int failCount = 0;
        int retryWaitSkipCount = 0;
        int noDeviceSkipCount = 0;

        for (IntakeRecord record : targets) {
            Long irId = record.getIntakeRecordId();
            Long userId = record.getSchedule().getUser().getUserId();

            // 1. 발송 주기 및 이력 판단
            Optional<NotificationDeliveryLog> lastLogOpt = deliveryLogRepository
                    .findTopByIntakeRecord_IntakeRecordIdOrderBySentAtDesc(irId);

            NotificationDeliveryLog lastLog = lastLogOpt.orElse(null);

            if (lastLog == null) {
                log.info("[섭취 알림 최초 발송 대상] intakeRecordId={}", irId);
            } else {
                if (!shouldSendIntakeReminder(lastLog, now)) {
                    log.info("[섭취 알림 스킵] intakeRecordId={} - 사유: 재전송 대기 중 (마지막 발송: {})", irId, lastLog.getSentAt());
                    retryWaitSkipCount++;
                    continue;
                }
                log.info("[섭취 알림 재전송 대상] intakeRecordId={} - 이전 시도: {}회차", irId, lastLog.getAttemptNo());
            }

            // 2. 기기 보유 확인
            if (!usersWithDevices.contains(userId)) {
                log.info("[섭취 알림 스킵] intakeRecordId={} - 사유: 활성 기기 없음", irId);
                noDeviceSkipCount++;
                continue;
            }

            int nextAttemptNo = resolveNextAttemptNo(lastLog);
            String supplementName = (record.getSchedule().getSupplement() != null)
                    ? record.getSchedule().getSupplement().getAlias()
                    : "영양제";

            try {
                // Facade 내부에서 SUCCESS 시 log 저장을 수행함
                PushSendResult result = notificationFacade.sendIntakeReminder(
                        userId, record.getSchedule().getScheduleId(), irId, supplementName, nextAttemptNo);

                if (result == PushSendResult.SUCCESS) {
                    successCount++;
                } else if (result == PushSendResult.FAILED) {
                    log.error("[섭취 알림 발송 실패] intakeRecordId={} - 사유: FCM 전송 에러", irId);
                    failCount++;
                } else { // NO_ACTIVE_DEVICE
                    noDeviceSkipCount++;
                }
            } catch (Exception e) {
                log.error("[섭취 알림 프로세스 오류] intakeRecordId={}, 이유={}", irId, e.getMessage());
                failCount++;
            }
        }

        log.info("[섭취 알림 프로세스 완료] 총 {}건 중 성공 {}건, 실패 {}건, 5분 대기 스킵 {}건, 활성 기기 없음 스킵 {}건",
                targets.size(), successCount, failCount, retryWaitSkipCount, noDeviceSkipCount);
    }

    private boolean shouldSendIntakeReminder(NotificationDeliveryLog lastLog, LocalDateTime now) {
        // 첫 발송인 경우
        if (lastLog == null) {
            return true;
        }
        // 마지막 발송으로부터 5분 이상 경과했는가 (5분 간격 재시도)
        return lastLog.getSentAt().plusMinutes(5).isBefore(now) || lastLog.getSentAt().plusMinutes(5).isEqual(now);
    }

    private int resolveNextAttemptNo(NotificationDeliveryLog lastLog) {
        return (lastLog == null) ? 1 : lastLog.getAttemptNo() + 1;
    }
}
