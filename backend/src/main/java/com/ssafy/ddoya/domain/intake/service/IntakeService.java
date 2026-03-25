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

        // 시간대별 그룹핑 및 정렬
        Map<LocalTime, List<IntakeScheduleResponse.IntakeItemDto>> groupedByTime = items.stream()
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
