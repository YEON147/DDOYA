package com.ssafy.ddoya.domain.intake.repository;

import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 섭취 기록(IntakeRecord) 엔티티에 대한 데이터 액세스 처리를 담당하는 레포지토리 인터페이스입니다.
 */
@Repository
public interface IntakeRecordRepository extends JpaRepository<IntakeRecord, Long> {

    /**
     * 특정 사용자의 특정 기간 내 섭취 기록 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @param start  조회 시작 일시
     * @param end    조회 종료 일시
     * @return 섭취 기록 리스트
     */
    List<IntakeRecord> findByScheduleUserUserIdAndPlannedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    /**
     * 특정 일정의 특정 기간 내 섭취 기록을 조회합니다.
     *
     * @param scheduleId 일정 ID
     * @param start      조회 시작 일시
     * @param end        조회 종료 일시
     * @return 섭취 기록 (Optional)
     */
    Optional<IntakeRecord> findByScheduleScheduleIdAndPlannedAtBetween(@Param("scheduleId") Long scheduleId, LocalDateTime start, LocalDateTime end);

    /**
     * 특정 일정의 특정 기간 내에 있으며 상태가 'MISSED'인 기록을 삭제합니다.
     *
     * @param scheduleId 일정 ID
     * @param start      시작 일시
     * @param end        종료 일시
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
    DELETE FROM IntakeRecord r
    WHERE r.schedule.scheduleId = :scheduleId
      AND r.plannedAt >= :start
      AND r.plannedAt < :end
      AND r.status = com.ssafy.ddoya.domain.intake.entity.IntakeStatus.MISSED
""")
    void deleteMissedRecordByScheduleIdAndPlannedAtRange(
            @Param("scheduleId") Long scheduleId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * 특정 기간 내에 계획된 섭취 기록이 있는 일정 ID 목록을 조회합니다.
     *
     * @param start 시작 일시
     * @param end   종료 일시
     * @return 일정 ID 리스트
     */
    @Query("""
        select ir.schedule.scheduleId
        from IntakeRecord ir
        where ir.plannedAt >= :start and ir.plannedAt < :end
    """)
    List<Long> findExistingScheduleIdsByPlannedAtBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
