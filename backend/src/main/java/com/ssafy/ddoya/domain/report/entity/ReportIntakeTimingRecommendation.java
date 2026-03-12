package com.ssafy.ddoya.domain.report.entity;

import com.ssafy.ddoya.domain.supplement.entity.Supplement;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "report_intake_timing_recommendation")
public class ReportIntakeTimingRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "timing_recommendation_id")
    private Long timingRecommendationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_supplement_id", nullable = false)
    private Supplement supplement;

    @Enumerated(EnumType.STRING)
    @Column(name = "intake_timing", nullable = false)
    private IntakeTiming intakeTiming;

    @Builder
    private ReportIntakeTimingRecommendation(
            Report report,
            Supplement supplement,
            IntakeTiming intakeTiming
    ) {
        this.report = report;
        this.supplement = supplement;
        this.intakeTiming = intakeTiming;
    }
}
