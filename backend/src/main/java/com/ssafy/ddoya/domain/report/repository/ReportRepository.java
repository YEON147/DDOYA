package com.ssafy.ddoya.domain.report.repository;

import com.ssafy.ddoya.domain.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * 특정 사용자의 리포트를 조회합니다. (사용자당 1개)
     */
    @Query("SELECT r FROM Report r WHERE r.user.userId = :userId")
    Optional<Report> findByUserId(@Param("userId") Long userId);
}
