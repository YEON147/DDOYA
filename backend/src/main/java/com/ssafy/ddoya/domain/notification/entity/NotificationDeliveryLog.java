package com.ssafy.ddoya.domain.notification.entity;

import com.ssafy.ddoya.domain.intake.entity.IntakeRecord;
import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
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

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "notification_delivery_log")
public class NotificationDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_log_id")
    private Long deliveryLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private IntakeSchedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intake_record_id")
    private IntakeRecord intakeRecord;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "attempt_no", nullable = false)
    private Integer attemptNo;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    @Builder
    private NotificationDeliveryLog(IntakeSchedule schedule, IntakeRecord intakeRecord, LocalDateTime sentAt,
            Integer attemptNo, Boolean isDeleted) {
        this.schedule = schedule;
        this.intakeRecord = intakeRecord;
        this.sentAt = sentAt;
        this.attemptNo = attemptNo;
        this.isDeleted = isDeleted != null ? isDeleted : false;
    }
}
