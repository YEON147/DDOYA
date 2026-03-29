package com.ssafy.ddoya.domain.notification.entity;

import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.notification.enums.NotificationType;
import com.ssafy.ddoya.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDateTime;

/**
 * 프로젝트 내의 알림 발송 이력 및 사용자 알림 목록 정보를 저장하는 엔티티입니다.
 * 발송 성공 시에만 데이터를 저장하여 알림함 조회용으로 활용합니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "notification_delivery_log")
public class NotificationDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_log_id")
    private Long deliveryLogId;

    /** 수신 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 알림 타입 */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    /** 알림 제목 */
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    /** 알림 본문 */
    @Column(name = "body", nullable = false)
    private String body;

    /**
     * 화면 이동을 위한 관련 도메인 ID
     * 섭취 알림 기록 - scheduleId
     * 재구매 알림 기록 - userSupplementId
     */
    @Column(name = "related_id")
    private Long relatedId;

    /** 관련 일정 (nullable로 변경 - REPURCHASE 등 일정 없는 알림 대응) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private IntakeSchedule schedule;

    /** 관련 섭취 기록 (선택 사항) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intake_record_id")
    private IntakeRecord intakeRecord;

    /** 실제 발송 성공 시각 */
    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    /** 재전송 시도 회차 (최초: 1) */
    @Column(name = "attempt_no", nullable = false)
    private Integer attemptNo;

    /** 사용자에 의한 삭제 여부 (Soft Delete) */
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    /** 데이터 생성 시각 */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private NotificationDeliveryLog(User user, NotificationType type, String title, String body,
            Long relatedId, IntakeSchedule schedule, IntakeRecord intakeRecord,
            LocalDateTime sentAt, Integer attemptNo, Boolean isDeleted) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.body = body;
        this.relatedId = relatedId;
        this.schedule = schedule;
        this.intakeRecord = intakeRecord;
        this.sentAt = sentAt;
        this.attemptNo = attemptNo;
        this.isDeleted = isDeleted != null ? isDeleted : false;
    }
}
