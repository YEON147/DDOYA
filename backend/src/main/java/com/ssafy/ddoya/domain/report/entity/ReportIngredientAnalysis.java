package com.ssafy.ddoya.domain.report.entity;

import com.ssafy.ddoya.domain.common.entity.IngredientMaster;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "report_ingredient_analysis")
public class ReportIngredientAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_ingredient_analysis_id")
    private Long reportIngredientAnalysisId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private IngredientMaster ingredient;

    @Column(name = "recommended_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal recommendedAmount;

    @Column(name = "current_amount", precision = 10, scale = 2)
    private BigDecimal currentAmount;

    @Column(name = "excess_ratio", precision = 10, scale = 2)
    private BigDecimal excessRatio;

    @Column(name = "excess_amount", precision = 10, scale = 2)
    private BigDecimal excessAmount;

    @Column(name = "deficiency_ratio", precision = 10, scale = 2)
    private BigDecimal deficiencyRatio;

    @Column(name = "deficiency_amount", precision = 10, scale = 2)
    private BigDecimal deficiencyAmount;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_type")
    private AnalysisType analysisType;

    @Builder
    private ReportIngredientAnalysis(Report report, IngredientMaster ingredient,
            BigDecimal recommendedAmount, BigDecimal currentAmount,
            BigDecimal excessRatio, BigDecimal excessAmount,
            BigDecimal deficiencyRatio, BigDecimal deficiencyAmount,
            String unit, AnalysisType analysisType) {
        this.report = report;
        this.ingredient = ingredient;
        this.recommendedAmount = recommendedAmount;
        this.currentAmount = currentAmount;
        this.excessRatio = excessRatio;
        this.excessAmount = excessAmount;
        this.deficiencyRatio = deficiencyRatio;
        this.deficiencyAmount = deficiencyAmount;
        this.unit = unit;
        this.analysisType = analysisType;
    }
}
