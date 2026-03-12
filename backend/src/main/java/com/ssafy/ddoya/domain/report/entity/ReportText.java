package com.ssafy.ddoya.domain.report.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "report_text")
public class ReportText {

    @Id
    private Long reportId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Lob
    @Column(name = "excess_summary_text", nullable = false)
    private String excessSummaryText;

    @Lob
    @Column(name = "deficiency_summary_text", nullable = false)
    private String deficiencySummaryText;

    @Lob
    @Column(name = "product_recommendation_text", nullable = false)
    private String productRecommendationText;

    @Lob
    @Column(name = "intake_timing_summary_text", nullable = false)
    private String intakeTimingSummaryText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    private ReportText(Report report, String excessSummaryText, String deficiencySummaryText,
            String productRecommendationText, String intakeTimingSummaryText,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.report = report;
        this.excessSummaryText = excessSummaryText;
        this.deficiencySummaryText = deficiencySummaryText;
        this.productRecommendationText = productRecommendationText;
        this.intakeTimingSummaryText = intakeTimingSummaryText;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }
}
