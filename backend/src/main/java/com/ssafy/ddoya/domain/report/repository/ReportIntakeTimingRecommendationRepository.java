package com.ssafy.ddoya.domain.report.repository;

import com.ssafy.ddoya.domain.report.entity.ReportIntakeTimingRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportIntakeTimingRecommendationRepository extends JpaRepository<ReportIntakeTimingRecommendation, Long> {

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM ReportIntakeTimingRecommendation r WHERE r.report.reportId = :reportId")
    void deleteAllByReportId(@Param("reportId") Long reportId);

    @Query("SELECT ritr FROM ReportIntakeTimingRecommendation ritr " +
           "LEFT JOIN FETCH ritr.supplement " +
           "WHERE ritr.report.reportId = :reportId")
    List<ReportIntakeTimingRecommendation> findAllByReport_ReportId(@Param("reportId") Long reportId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM ReportIntakeTimingRecommendation r WHERE r.supplement.userSupplementId = :userSupplementId")
    void deleteByUserSupplementId(@Param("userSupplementId") Long userSupplementId);
}
