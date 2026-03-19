package com.ssafy.ddoya.domain.intake.repository;

import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntakeScheduleRepository extends JpaRepository<IntakeSchedule, Long> {

    // 특정 영양제에 연결된 스케줄 목록 조회
    @Query("SELECT s FROM IntakeSchedule s WHERE s.supplement.userSupplementId = :supplementId ORDER BY s.intakeTime ASC")
    List<IntakeSchedule> findBySupplementId(@Param("supplementId") Long supplementId);
}
