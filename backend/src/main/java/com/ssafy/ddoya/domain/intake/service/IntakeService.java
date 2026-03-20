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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class IntakeService {
    private final IntakeRecordRepository intakeRecordRepository;

    public IntakeScheduleResponse getDailySchedules(Long userId, LocalDate targetDate) {
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        log.debug("[INTAKE] Query intake records - userId={}, start={}, end={}", userId, start, end);

        // 해당 날짜의 Record 조회
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
                            .dosePerIntake(schedule.getDosePerIntake())
                            .intakeRecordId(record.getIntakeRecordId())
                            .status(record.getStatus().name())
                            .actionAt(record.getActionAt())
                            .rawIntakeTime(schedule.getIntakeTime())
                            .build();
                })
                .toList();

        // 시간대별 그룹핑 및 정렬
        Map<LocalTime, List<IntakeScheduleResponse.IntakeItemDto>> groupedByTime = items.stream()
                .collect(Collectors.groupingBy(IntakeScheduleResponse.IntakeItemDto::getRawIntakeTime));

        List<IntakeScheduleResponse.TimeSlotDto> timeSlots = groupedByTime.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> IntakeScheduleResponse.TimeSlotDto.builder()
                        .intakeTime(entry.getKey().format(DateTimeFormatter.ofPattern("HH:mm")))
                        .plannedAt(LocalDateTime.of(targetDate, entry.getKey()))
                        .items(entry.getValue())
                        .build())
                .toList();

        return IntakeScheduleResponse.builder()
                .targetDate(targetDate)
                .timeSlots(timeSlots)
                .build();
    }
}
