package com.ssafy.ddoya.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "user_notification_setting")
public class UserNotificationSetting {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "intake_notification_enabled", nullable = false)
    private boolean intakeNotificationEnabled = true;

    @Column(name = "carry_notification_enabled", nullable = false)
    private boolean carryNotificationEnabled = true;

    @Column(name = "stock_notification_enabled", nullable = false)
    private boolean stockNotificationEnabled = true;

    @Builder
    private UserNotificationSetting(User user, Boolean intakeNotificationEnabled,
                                    Boolean carryNotificationEnabled, Boolean stockNotificationEnabled) {
        this.user = user;
        this.intakeNotificationEnabled = intakeNotificationEnabled != null ? intakeNotificationEnabled : true;
        this.carryNotificationEnabled = carryNotificationEnabled != null ? carryNotificationEnabled : true;
        this.stockNotificationEnabled = stockNotificationEnabled != null ? stockNotificationEnabled : true;
    }
}
