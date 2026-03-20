package com.ssafy.ddoya.domain.intake.repository;

import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntakeScheduleRepository extends JpaRepository<IntakeSchedule, Long> {

    @Query("SELECT s FROM IntakeSchedule s WHERE s.supplement.userSupplementId = :supplementId")
    List<IntakeSchedule> findBySupplementId(@Param("supplementId") Long supplementId);

    // 영양제 삭제 시 연관 스케줄 일괄 삭제
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM IntakeSchedule s WHERE s.supplement.userSupplementId = :supplementId")
    void deleteBySupplementId(@Param("supplementId") Long supplementId);

    // 영양제 수정 API용: supplementId + userId + scheduleType = INTAKE 기준 조회
    @Query("SELECT s FROM IntakeSchedule s " +
            "WHERE s.supplement.userSupplementId = :supplementId " +
            "AND s.user.userId = :userId " +
            "AND s.scheduleType = :scheduleType " +
            "ORDER BY s.intakeTime ASC")
    List<IntakeSchedule> findBySupplementIdAndUserIdAndScheduleType(
            @Param("supplementId") Long supplementId,
            @Param("userId") Long userId,
            @Param("scheduleType") ScheduleType scheduleType);

    List<IntakeSchedule> findAllByScheduleType(ScheduleType scheduleType);
}
