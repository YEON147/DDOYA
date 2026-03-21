package com.ssafy.ddoya.domain.intake.service;

import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.IntakeStatus;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import com.ssafy.ddoya.domain.intake.repository.IntakeRecordRepository;
import com.ssafy.ddoya.domain.intake.repository.IntakeScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntakeBatchService {

    private final IntakeScheduleRepository intakeScheduleRepository;
    private final IntakeRecordRepository intakeRecordRepository;

    /**
     * 지정된 날짜의 기본 섭취 기록(IntakeRecord)을 자동 생성합니다. (기본값 MISSED)
     * 중복 생성을 방지하기 위해 해당 날짜의 기존 record를 한 번에 조회한 뒤
     * 메모리에서 scheduleId 기준으로 비교합니다.
     */
    @Transactional
    public void createDailyIntakeRecords(LocalDate targetDate) {
        log.info("[BATCH] Starting intake record creation for date: {}", targetDate);

        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        // INTAKE 타입의 모든 스케줄 조회
        List<IntakeSchedule> schedules =
                intakeScheduleRepository.findAllByScheduleType(ScheduleType.INTAKE);

        // 해당 날짜에 이미 record가 존재하는 scheduleId 목록 조회
        Set<Long> existingScheduleIds = intakeRecordRepository
                .findExistingScheduleIdsByPlannedAtBetween(start, end)
                .stream()
                .collect(Collectors.toSet());

        // 존재하지 않는 schedule만 record 생성
        List<IntakeRecord> newRecords = schedules.stream()
                .filter(schedule -> !existingScheduleIds.contains(schedule.getScheduleId()))
                .map(schedule -> {
                    LocalDateTime plannedAt = LocalDateTime.of(targetDate, schedule.getIntakeTime());
                    return IntakeRecord.builder()
                            .schedule(schedule)
                            .plannedAt(plannedAt)
                            .status(IntakeStatus.MISSED)
                            .actionAt(null)
                            .build();
                })
                .toList();

        if (!newRecords.isEmpty()) {
            intakeRecordRepository.saveAll(newRecords);
            log.info("[BATCH] Successfully created {} intake records for {}", newRecords.size(), targetDate);
        } else {
            log.info("[BATCH] All records already exist for {}. No creation needed.", targetDate);
        }
    }
}
