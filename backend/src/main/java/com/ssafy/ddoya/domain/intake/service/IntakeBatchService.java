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
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 섭취 기록을 배치 방식으로 생성하고 관리하는 서비스 클래스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IntakeBatchService {

    private final IntakeScheduleRepository intakeScheduleRepository;
    private final IntakeRecordRepository intakeRecordRepository;

    /**
     * 지정된 날짜의 기본 섭취 기록(IntakeRecord)을 자동 생성합니다. (기본값 MISSED)
     */
    @Transactional
    public void createDailyIntakeRecords(LocalDate targetDate) {
        log.info("[BATCH] Starting intake record creation for date: {}", targetDate);

        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        // INTAKE 타입의 활성 스케줄만 조회
        List<IntakeSchedule> schedules =
                intakeScheduleRepository.findAllByScheduleTypeAndIsActiveTrue(ScheduleType.INTAKE);

        // 해당 날짜에 이미 record가 존재하는 활성 scheduleId 목록 조회
        Set<Long> existingScheduleIds = intakeRecordRepository
                .findExistingActiveScheduleIdsByPlannedAtBetween(start, end)
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

    /**
     * 복용 시각 20분 경과 후에도 MISSED 상태인 기록을 SKIPPED로 자동 전환합니다.
     * 관리 우선순위(확정 이력 > 활성 스케줄) 정책을 준수합니다.
     * 
     * @param now 현재 시각
     */
    @Transactional
    public void processAutoSkip(LocalDateTime now) {
        LocalDateTime threshold = now.minusMinutes(20);
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = now.toLocalDate().plusDays(1).atStartOfDay();

        // 1. 20분 경과한 MISSED 후보들 전체 조회
        List<IntakeRecord> candidates = intakeRecordRepository.findAutoSkipCandidates(threshold, startOfDay);
        if (candidates.isEmpty()) {
            return;
        }

        log.debug("[BATCH] Found {} candidates for auto-skipped", candidates.size());

        // 2. 관리 정책 적용 (유저별/영양제별 그룹화)
        // userId -> userSupplementId -> list of records
        Map<Long, Map<Long, List<IntakeRecord>>> grouped = candidates.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getSchedule().getUser().getUserId(),
                        Collectors.groupingBy(r -> r.getSchedule().getSupplement().getUserSupplementId())
                ));

        int updatedCount = 0;

        for (Map.Entry<Long, Map<Long, List<IntakeRecord>>> userEntry : grouped.entrySet()) {
            for (Map.Entry<Long, List<IntakeRecord>> supplementEntry : userEntry.getValue().entrySet()) {
                Long supplementId = supplementEntry.getKey();
                List<IntakeRecord> recordsInGroup = supplementEntry.getValue();

                // 2-1. 오늘 이미 TAKEN 또는 SKIPPED 인 확정 결과가 있는지 확인 (기존 Repository 검색 활용)
                boolean alreadyFinalized = intakeRecordRepository.existsTakenOrSkippedBySupplementIdAndPlannedAtBetween(supplementId, startOfDay, endOfDay);
                
                if (alreadyFinalized) {
                    // 이미 확정 이력이 있으면, 남은 MISSED는 건드리지 않음 (필터링 우선순위 정책)
                    continue;
                }

                // 2-2. 확정 이력이 없다면, isActive=true 인 스케줄에 연결된 MISSED만 SKIPPED로 전환
                for (IntakeRecord record : recordsInGroup) {
                    if (record.getSchedule().getIsActive()) {
                        record.updateStatusByManual(IntakeStatus.SKIPPED); // 수동 조작 메서드 재사용 (배치성 자동 변경)
                        updatedCount++;
                    }
                }
            }
        }

        if (updatedCount > 0) {
            log.info("[BATCH] Auto-skipped {} intake records at {}", updatedCount, now);
        }
    }
}
