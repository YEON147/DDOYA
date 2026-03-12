package com.ssafy.ddoya.domain.intake.entity;

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

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "intake_record")
public class IntakeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "intake_status_id")
    private Long intakeStatusId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private IntakeSchedule schedule;

    @Column(name = "planned_at", nullable = false)
    private LocalDateTime plannedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private IntakeStatus status;

    @Column(name = "action_at")
    private LocalDateTime actionAt;

    @Builder
    private IntakeRecord(IntakeSchedule schedule, LocalDateTime plannedAt,
            IntakeStatus status, LocalDateTime actionAt) {
        this.schedule = schedule;
        this.plannedAt = plannedAt;
        this.status = status;
        this.actionAt = actionAt;
    }
}
