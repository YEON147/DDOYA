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

@Slf4j
@Service
@RequiredArgsConstructor
public class IntakeRecordSyncService {

    private final IntakeRecordRepository intakeRecordRepository;

    @Value("${app.timezone:Asia/Seoul}")
    private String appTimezone;

    /**
     * 스케줄 등록 또는 수정(시간 변경) 시 오늘의 섭취 기록을 동기화합니다.
     * 이미 기록이 있고 상태가 MISSED 가 아니면 기존 기록을 보존합니다.
     */
    @Transactional
    public void syncOnUpsert(IntakeSchedule schedule) {

        if (schedule.getScheduleType() != ScheduleType.INTAKE) return;

        LocalDate targetDate = LocalDate.now(ZoneId.of(appTimezone));

        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        LocalDateTime newPlannedAt = LocalDateTime.of(targetDate, schedule.getIntakeTime());

        Optional<IntakeRecord> existingRecord = intakeRecordRepository.findByScheduleScheduleIdAndPlannedAtBetween(schedule.getScheduleId(), start, end);

        if (existingRecord.isEmpty()) {
            saveNewMissedRecord(schedule, newPlannedAt);
            return;
        }

        IntakeRecord record = existingRecord.get();

        // 기본 상태인 경우에만 스케줄 시간 변경을 반영
        if (record.getStatus() == IntakeStatus.MISSED){
            record.reschedule(newPlannedAt);
        }
    }

    /**
     * 스케줄 삭제 시 오늘 날짜의 미수정 기본 기록(MISSED)만 삭제하고, 이미 사용자가 행동한 기록은 보존한다.
     */
    @Transactional
    public void syncOnDelete(Long scheduleId) {
        LocalDate targetDate = LocalDate.now(ZoneId.of(appTimezone));
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        intakeRecordRepository.deleteMissedRecordByScheduleIdAndPlannedAtRange(scheduleId, start, end);
    }

    private void saveNewMissedRecord(IntakeSchedule schedule, LocalDateTime plannedAt) {
        intakeRecordRepository.save(IntakeRecord.builder()
                .schedule(schedule)
                .plannedAt(plannedAt)
                .status(IntakeStatus.MISSED)
                .actionAt(null)
                .build());
    }
}
