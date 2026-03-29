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

/**
 * 섭취 기록 정보를 관리하는 엔티티 클래스입니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "intake_record")
public class IntakeRecord {

    /**
     * 섭취 기록 ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "intake_record_id")
    private Long intakeRecordId;

    /**
     * 연결된 섭취 일정
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private IntakeSchedule schedule;

    /**
     * 예정된 섭취 시간
     */
    @Column(name = "planned_at", nullable = false)
    private LocalDateTime plannedAt;

    /**
     * 섭취 상태 (섭취, 미섭취, 스킵 등)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private IntakeStatus status;

    /**
     * 실제 섭취(또는 처리) 완료 시간
     */
    @Column(name = "action_at")
    private LocalDateTime actionAt;

    /**
     * @param schedule  연결된 섭취 일정
     * @param plannedAt 예정된 섭취 시간
     * @param status    섭취 상태
     * @param actionAt  실제 처리 시간
     */
    @Builder
    private IntakeRecord(IntakeSchedule schedule, LocalDateTime plannedAt,
            IntakeStatus status, LocalDateTime actionAt) {
        this.schedule = schedule;
        this.plannedAt = plannedAt;
        this.status = status;
        this.actionAt = actionAt;
    }

    /**
     * 예정된 섭취 시간을 재설정합니다.
     *
     * @param plannedAt 다시 설정할 예정 시간
     */
    public void reschedule(LocalDateTime plannedAt) {
        this.plannedAt = plannedAt;
    }

    /**
     * AI 분석 결과에 따른 복용 승인 시 상태를 업데이트합니다.
     */
    public void updateStatusToTaken(LocalDateTime actionAt) {
        if (this.status != IntakeStatus.TAKEN) {
            this.status = IntakeStatus.TAKEN;
            this.actionAt = actionAt;
        }
    }

    /**
     * 사용자의 수동 조작에 의해 상태를 업데이트합니다. (MISSED, SKIPPED 로의 변경만 허용)
     * 이 때 actionAt 은 null 처리됩니다.
     *
     * @param newStatus 변경할 목표 상태
     */
    public void updateStatusByManual(IntakeStatus newStatus) {
        this.status.validateTransition(newStatus);
        this.status = newStatus;
        this.actionAt = null;
    }
}
