package com.ssafy.ddoya.domain.report.repository;

import com.ssafy.ddoya.domain.report.entity.ReportIntakeTimingRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportIntakeTimingRecommendationRepository extends JpaRepository<ReportIntakeTimingRecommendation, Long> {

    @Modifying
    @Query("DELETE FROM ReportIntakeTimingRecommendation r WHERE r.report.reportId = :reportId")
    void deleteAllByReportId(@Param("reportId") Long reportId);
}
