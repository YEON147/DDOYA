package com.ssafy.ddoya.domain.user.entity;

import com.ssafy.ddoya.domain.report.entity.IntakeTiming;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "user_intake_timing_setting", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_intake_timing", columnNames = { "user_id", "intake_timing" })
})
public class UserIntakeTimingSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_intake_timing_setting_id")
    private Long userIntakeTimingSettingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "intake_timing", nullable = false)
    private IntakeTiming intakeTiming;

    @Column(name = "intake_time", nullable = false)
    private LocalTime intakeTime;

    @Builder
    private UserIntakeTimingSetting(User user, IntakeTiming intakeTiming, LocalTime intakeTime) {
        this.user = user;
        this.intakeTiming = intakeTiming;
        this.intakeTime = intakeTime;
    }

    public void updateIntakeTime(LocalTime intakeTime) {
        this.intakeTime = intakeTime;
    }
}
