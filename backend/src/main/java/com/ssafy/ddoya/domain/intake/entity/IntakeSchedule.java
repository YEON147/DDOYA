package com.ssafy.ddoya.domain.intake.entity;

import com.ssafy.ddoya.domain.supplement.entity.Supplement;
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

import java.time.LocalTime;

/**
 * 사용자의 영양제 섭취 일정을 관리하는 엔티티 클래스입니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "intake_schedule")
public class IntakeSchedule {

    /**
     * 일정 ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    /**
     * 일정을 소유한 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 대상 영양제 (CARRY 타입인 경우 null일 수 있음)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_supplement_id")
    private Supplement supplement;

    /**
     * 섭취 시간
     */
    @Column(name = "intake_time", nullable = false)
    private LocalTime intakeTime;

    /**
     * 일정 유형 (영양제 섭취, 챙김 알림 등)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false)
    private ScheduleType scheduleType;

    /**
     * 1회 섭취 분량
     */
    @Column(name = "dose_per_intake")
    private Integer dosePerIntake;

    /**
     * @param user          일정을 소유한 사용자
     * @param supplement    대상 영양제
     * @param intakeTime    섭취 시간
     * @param scheduleType  일정 유형
     * @param dosePerIntake 1회 섭취량
     */
    @Builder
    private IntakeSchedule(User user, Supplement supplement, LocalTime intakeTime,
            ScheduleType scheduleType, Integer dosePerIntake) {
        this.user = user;
        this.supplement = supplement;
        this.intakeTime = intakeTime;
        this.scheduleType = scheduleType;
        this.dosePerIntake = dosePerIntake;
    }

    /**
     * 섭취 시각을 수정합니다.
     *
     * @param intakeTime 변경할 섭취 시각
     */
    public void updateIntakeTime(LocalTime intakeTime) {
        this.intakeTime = intakeTime;
    }
}
