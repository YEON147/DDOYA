package com.ssafy.ddoya.domain.intake.service;

import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.IntakeStatus;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import com.ssafy.ddoya.domain.intake.repository.IntakeRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

/**
 * 섭취 일정 변경 또는 삭제 시 섭취 기록을 동기화하는 서비스 클래스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IntakeRecordSyncService {

    private final IntakeRecordRepository intakeRecordRepository;
    private final com.ssafy.ddoya.domain.notification.repository.NotificationDeliveryLogRepository notificationDeliveryLogRepository;

    @Value("${app.timezone:Asia/Seoul}")
    private String appTimezone;

    /**
     * 스케줄 등록 또는 수정(시간 변경) 시 오늘의 섭취 기록을 동기화합니다.
     * 이미 기록이 있고 상태가 MISSED 가 아니면 기존 기록을 보존합니다.
     *
     * @param schedule 등록 또는 수정된 섭취 일정
     */
    @Transactional
    public void syncOnUpsert(IntakeSchedule schedule) {
        // 기본값: 비활성/비복용 스케줄인 경우 즉시 종료
        if (schedule == null || schedule.getScheduleType() != ScheduleType.INTAKE || !Boolean.TRUE.equals(schedule.getIsActive())) {
            return;
        }
        // 기본 동동기화 로직 수행 (신규 추가 시)
        syncOnUpsert(schedule, true);
    }

    /**
     * @param schedule      새로 생성/수정된 스케줄
     * @param shouldCreateIfMissing 기존 슬롯이 비어있거나 MISSED 였던 경우 새 레코드를 생성할지 여부
     */
    @Transactional
    public void syncOnUpsert(IntakeSchedule schedule, boolean shouldCreateIfMissing) {
        if (schedule == null || schedule.getScheduleType() != ScheduleType.INTAKE || !Boolean.TRUE.equals(schedule.getIsActive())) {
            return;
        }

        LocalDate targetDate = LocalDate.now(ZoneId.of(appTimezone));
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();
        LocalDateTime newPlannedAt = LocalDateTime.of(targetDate, schedule.getIntakeTime());

        Optional<IntakeRecord> existingRecord = intakeRecordRepository.findByScheduleScheduleIdAndPlannedAtBetween(schedule.getScheduleId(), start, end);

        if (existingRecord.isPresent()) {
            IntakeRecord record = existingRecord.get();
            if (record.getStatus() == IntakeStatus.MISSED) {
                record.reschedule(newPlannedAt);
            }
            return;
        }

        // 기존 슬롯이 TAKEN/SKIPPED 상태라 삭제되지 않은 경우, 새로운 MISSED 를 만들지 않음
        if (shouldCreateIfMissing) {
            saveNewMissedRecord(schedule, newPlannedAt);
        }
    }

    /**
     * 스케줄 수정 시 호출되는 동기화 로직입니다.
     * 기존 스케줄에 연결된 기록 중 '보존해야 할 기록(과거+오늘 확정)'은 두고,
     * '교체 가능한 기록(오늘 MISSED + 미래 전체)'만 삭제합니다.
     *
     * @param scheduleId 변경/비활성화되는 기존 일정 ID
     * @return 오늘 날짜의 MISSED 기록을 삭제했는지(즉, 새로운 슬롯 생성이 필요한지) 여부
     */
    @Transactional
    public boolean syncOnUpdate(Long scheduleId) {
        LocalDate today = LocalDate.now(ZoneId.of(appTimezone));
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.plusDays(1).atStartOfDay();

        // 1. 삭제 대상 IntakeRecord ID 목록 조회 (FK 제약 조건 해결을 위함)
        java.util.List<Long> recordIdsToDelete = intakeRecordRepository.findIdsByScheduleIdAndSyncRange(scheduleId, todayStart, todayEnd);

        // 2. 연관된 NotificationDeliveryLog 선삭제
        if (!recordIdsToDelete.isEmpty()) {
            notificationDeliveryLogRepository.deleteByIntakeRecordIdIn(recordIdsToDelete);
            log.debug("[Sync] Deleted notification logs for intake records: {}", recordIdsToDelete);
        }

        // 3. 오늘 기록 존재 여부 및 상태 확인 (보존/생성 여부 판단용)
        Optional<IntakeRecord> todayRecord = intakeRecordRepository.findByScheduleScheduleIdAndPlannedAtBetween(scheduleId, todayStart, todayEnd);
        boolean wasMissedOrEmpty = todayRecord.isEmpty() || (todayRecord.get().getStatus() == IntakeStatus.MISSED);

        // 4. 오늘 MISSED 기록 + 미래 모든 기록 삭제
        intakeRecordRepository.deleteTodayMissedAndFutureRecords(scheduleId, todayStart, todayEnd);
        log.info("[Sync] Deleted today's MISSED and future records for scheduleId: {}", scheduleId);

        return wasMissedOrEmpty;
    }

    /**
     * 스케줄 삭제(비활성화 아님) 시 오늘 날짜의 미수정 기본 기록(MISSED)만 삭제하고, 이미 사용자가 행동한 기록은 보존한다.
     * (영양제 자체를 삭제하거나 할 때 사용)
     *
     * @param scheduleId 삭제된 일정 ID
     */
    @Transactional
    public void syncOnDelete(Long scheduleId) {
        LocalDate targetDate = LocalDate.now(ZoneId.of(appTimezone));
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        // 1. 삭제 대상 IntakeRecord(MISSED) ID 목록 조회
        java.util.List<Long> recordIdsToDelete = intakeRecordRepository.findIdsByScheduleIdAndPlannedAtRange(scheduleId, start, end);

        // 2. 연관 알림 로그 선삭제
        if (!recordIdsToDelete.isEmpty()) {
            notificationDeliveryLogRepository.deleteByIntakeRecordIdIn(recordIdsToDelete);
            log.debug("[Sync] Deleted notification logs for intake records in syncOnDelete: {}", recordIdsToDelete);
        }

        // 3. 섭취 기록 삭제
        intakeRecordRepository.deleteMissedRecordByScheduleIdAndPlannedAtRange(scheduleId, start, end);
    }

    /**
     * 새로운 '미섭취(MISSED)' 상태의 기록을 저장합니다.
     *
     * @param schedule  연결할 일정
     * @param plannedAt 계획된 시간
     */
    private void saveNewMissedRecord(IntakeSchedule schedule, LocalDateTime plannedAt) {
        intakeRecordRepository.save(IntakeRecord.builder()
                .schedule(schedule)
                .plannedAt(plannedAt)
                .status(IntakeStatus.MISSED)
                .actionAt(null)
                .build());
    }
}
