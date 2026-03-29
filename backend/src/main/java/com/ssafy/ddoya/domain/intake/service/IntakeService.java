package com.ssafy.ddoya.domain.intake.service;

import com.ssafy.ddoya.domain.intake.dto.IntakeScheduleResponse;
import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.repository.IntakeRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 사용자의 영양제 섭취 관련 일반 업무를 담당하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class IntakeService {
    private final IntakeRecordRepository intakeRecordRepository;

    /**
     * 특정 사용자의 특정 날짜에 해당하는 일일 섭취 일정 목록을 조회합니다.
     * 결과는 시간대별로 그룹화되어 반환됩니다.
     *
     * @param userId     사용자 ID
     * @param targetDate 조회할 대상 날짜
     * @return 시간대별로 그룹화된 섭취 일정 응답 DTO
     */
    public IntakeScheduleResponse getDailySchedules(Long userId, LocalDate targetDate) {
        // 조회 범위: [start, end)
        // ex) 2026-03-20 00:00 ~ 2026-03-21 00:00 (다음날 00시는 포함 안됨)
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        log.debug("[INTAKE] Query intake records - userId={}, start={}, end={}", userId, start, end);

        // 해당 날짜의 intake_record 조회
        List<IntakeRecord> records = intakeRecordRepository
                .findByScheduleUserUserIdAndPlannedAtBetween(userId, start, end);

        // 조회된 record plannedAt 로그
        records.forEach(record ->
                log.debug("[INTAKE] Found record - intakeRecordId={}, plannedAt={}",
                        record.getIntakeRecordId(),
                        record.getPlannedAt())
        );

        // record 기준으로 item 생성
        List<IntakeScheduleResponse.IntakeItemDto> items = records.stream()
                .map(record -> {
                    IntakeSchedule schedule = record.getSchedule();

                    return IntakeScheduleResponse.IntakeItemDto.builder()
                            .scheduleId(schedule.getScheduleId())
                            .userSupplementId(schedule.getSupplement().getUserSupplementId())
                            .alias(schedule.getSupplement().getAlias())
                            .bodyPartId(schedule.getSupplement().getBodyPart() != null ? schedule.getSupplement().getBodyPart().getBodyPartId() : null)
                            .dosePerIntake(schedule.getDosePerIntake())
                            .intakeRecordId(record.getIntakeRecordId())
                            .status(record.getStatus().name())
                            .actionAt(record.getActionAt())
                            .plannedAt(record.getPlannedAt())
                            .rawIntakeTime(schedule.getIntakeTime())
                            .build();
                })
                .toList();

        // [DEDUP] 같은 영양제(userSupplementId)에 대해 대표 1개만 선정 (우선순위: 확정이력 > 활성스케줄)
        Map<Long, List<IntakeScheduleResponse.IntakeItemDto>> groupedBySupplement = items.stream()
                .collect(Collectors.groupingBy(IntakeScheduleResponse.IntakeItemDto::getUserSupplementId));

        List<IntakeScheduleResponse.IntakeItemDto> dedupedItems = groupedBySupplement.values().stream()
                .map(group -> {
                    // 동일 영양제 그룹 중 대표 1개 선택
                    // 1. TAKEN 또는 SKIPPED 상태(확정 이력)인 것을 우선 검색
                    Optional<IntakeScheduleResponse.IntakeItemDto> finalizedItem = group.stream()
                            .filter(i -> "TAKEN".equals(i.getStatus()) || "SKIPPED".equals(i.getStatus()))
                            .findFirst();

                    if (finalizedItem.isPresent()) {
                        return finalizedItem.get();
                    }

                    // 2. 확정 이력이 없으면, 현재 활성화(isActive=true)된 스케줄 항목 선택
                    // (isActive 정보가 DTO에는 없으므로, records에서 다시 확인하거나 우선순위상 나머지에 대해 유연하게 선택)
                    // 현재는 isActive=true 인 레코드들이 쿼리로 걸러져서 오고, TAKEN/SKIPPED가 아닌 것은 활성 스케줄임이 전제됨
                    return group.get(0);
                })
                .toList();

        // 시간대별 그룹핑 및 정렬 (중복 제거된 항목 기준)
        Map<LocalTime, List<IntakeScheduleResponse.IntakeItemDto>> groupedByTime = dedupedItems.stream()
                .collect(Collectors.groupingBy(IntakeScheduleResponse.IntakeItemDto::getRawIntakeTime));

        // 시간 오름차순 정렬
        List<IntakeScheduleResponse.TimeSlotDto> timeSlots = groupedByTime.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // 시간 오름차순 정렬
                .map(entry -> {
                    // 해당 시간 그룹의 대표 plannedAt
                    // (같은 시간대는 동일한 plannedAt을 가지므로 첫 번째 값 사용)
                    LocalDateTime actualPlannedAt = entry.getValue().get(0).getPlannedAt();

                    return IntakeScheduleResponse.TimeSlotDto.builder()
                            .intakeTime(entry.getKey().format(DateTimeFormatter.ofPattern("HH:mm")))
                            .plannedAt(actualPlannedAt)
                            .items(entry.getValue())    // 해당 시간대의 섭취 목록
                            .build();
                })
                .toList();

        return IntakeScheduleResponse.builder()
                .targetDate(targetDate)
                .timeSlots(timeSlots)
                .build();
    }
}
