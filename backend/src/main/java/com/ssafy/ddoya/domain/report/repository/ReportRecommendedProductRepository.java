package com.ssafy.ddoya.domain.report.repository;

import com.ssafy.ddoya.domain.report.entity.ReportRecommendedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRecommendedProductRepository extends JpaRepository<ReportRecommendedProduct, Long> {

    @Modifying
    @Query("DELETE FROM ReportRecommendedProduct r WHERE r.report.reportId = :reportId")
    void deleteAllByReportId(@Param("reportId") Long reportId);

    @Query("SELECT rrp FROM ReportRecommendedProduct rrp " +
           "LEFT JOIN FETCH rrp.product " +
           "LEFT JOIN FETCH rrp.ingredient " +
           "WHERE rrp.report.reportId = :reportId")
    List<ReportRecommendedProduct> findAllByReport_ReportId(@Param("reportId") Long reportId);
}
