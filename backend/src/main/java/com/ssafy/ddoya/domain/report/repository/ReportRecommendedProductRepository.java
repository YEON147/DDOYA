package com.ssafy.ddoya.domain.report.repository;

import com.ssafy.ddoya.domain.report.entity.ReportRecommendedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRecommendedProductRepository extends JpaRepository<ReportRecommendedProduct, Long> {

    @Modifying
    @Query("DELETE FROM ReportRecommendedProduct r WHERE r.report.reportId = :reportId")
    void deleteAllByReportId(@Param("reportId") Long reportId);
}
