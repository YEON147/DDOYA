package com.ssafy.ddoya.domain.report.entity;

import com.ssafy.ddoya.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "needs_refresh", nullable = false)
    private Boolean needsRefresh;

    @Builder
    private Report(User user, Boolean needsRefresh) {
        this.user = user;
        this.needsRefresh = needsRefresh != null ? needsRefresh : false;
    }

    /**
     * 리포트 갱신 완료 시 needsRefresh 플래그를 초기화(false)합니다.
     */
    public void clearNeedsRefresh() {
        this.needsRefresh = false;
    }

    /**
     * 리포트가 새로 생성/갱신되었을 때 프론트에 갱신이 필요함을 알립니다.
     * DB 저장 성공 후 호출하여 needs_refresh = true 로 세팅합니다.
     */
    public void markNeedsRefresh() {
        this.needsRefresh = true;
    }
}
