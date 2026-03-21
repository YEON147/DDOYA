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

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "intake_schedule")
public class IntakeSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_supplement_id")
    private Supplement supplement;

    @Column(name = "intake_time", nullable = false)
    private LocalTime intakeTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false)
    private ScheduleType scheduleType;

    @Column(name = "dose_per_intake")
    private Integer dosePerIntake;

    @Builder
    private IntakeSchedule(User user, Supplement supplement, LocalTime intakeTime,
            ScheduleType scheduleType, Integer dosePerIntake) {
        this.user = user;
        this.supplement = supplement;
        this.intakeTime = intakeTime;
        this.scheduleType = scheduleType;
        this.dosePerIntake = dosePerIntake;
    }

    // 섭취 시각 수정
    public void updateIntakeTime(LocalTime intakeTime) {
        this.intakeTime = intakeTime;
    }
}
