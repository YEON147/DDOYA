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

@Repository
public interface IntakeRecordRepository extends JpaRepository<IntakeRecord, Long> {

    List<IntakeRecord> findByScheduleUserUserIdAndPlannedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    Optional<IntakeRecord> findByScheduleScheduleIdAndPlannedAtBetween(@Param("scheduleId") Long scheduleId, LocalDateTime start, LocalDateTime end);

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
