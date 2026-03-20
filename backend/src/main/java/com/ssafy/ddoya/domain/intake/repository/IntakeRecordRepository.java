package com.ssafy.ddoya.domain.intake.repository;

import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IntakeRecordRepository extends JpaRepository<IntakeRecord, Long> {

    List<IntakeRecord> findByScheduleUserUserIdAndPlannedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

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
