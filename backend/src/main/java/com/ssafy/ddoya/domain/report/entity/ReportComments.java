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

/**
 * 리포트의 요약 의견 및 코멘트를 관리하는 엔티티 클래스입니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "report_comments")
public class ReportComments {

    @Id
    private Long reportId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    /** 과잉 섭취 관련 코멘트 */
    @Lob
    @Column(name = "excess_comment", nullable = false, columnDefinition = "TEXT")
    private String excessComment;

    /** 부족 섭취 관련 코멘트 */
    @Lob
    @Column(name = "deficiency_comment", nullable = false, columnDefinition = "TEXT")
    private String deficiencyComment;

    /** 추천 제품 관련 코멘트 */
    @Lob
    @Column(name = "product_comment", nullable = false, columnDefinition = "TEXT")
    private String productComment;

    /** 섭취 일정/타이밍 관련 코멘트 */
    @Lob
    @Column(name = "schedule_comment", nullable = false, columnDefinition = "TEXT")
    private String scheduleComment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    private ReportComments(Report report, String excessComment, String deficiencyComment,
            String productComment, String scheduleComment,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.report = report;
        this.excessComment = excessComment;
        this.deficiencyComment = deficiencyComment;
        this.productComment = productComment;
        this.scheduleComment = scheduleComment;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }
}
