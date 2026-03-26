package com.ssafy.ddoya.domain.report.repository;

import com.ssafy.ddoya.domain.report.entity.ReportComments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportCommentsRepository extends JpaRepository<ReportComments, Long> {

    Optional<ReportComments> findByReport_ReportId(Long reportId);
}
