package com.ssafy.ddoya.domain.report.repository;

import com.ssafy.ddoya.domain.report.entity.ReportIngredientAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportIngredientAnalysisRepository extends JpaRepository<ReportIngredientAnalysis, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ReportIngredientAnalysis r WHERE r.report.reportId = :reportId")
    void deleteAllByReportId(@Param("reportId") Long reportId);

    List<ReportIngredientAnalysis> findAllByReport_ReportIdOrderByIngredient_IngredientIdAsc(Long reportId);
}
