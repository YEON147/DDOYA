package com.ssafy.ddoya.domain.notification.entity;

import com.ssafy.ddoya.domain.notification.enums.DeviceType;
import com.ssafy.ddoya.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 사용자의 모바일 기기별 FCM 토큰을 저장하는 엔티티입니다.
 * 사용자(User) 1명이 N개의 기기 토큰을 가질 수 있는 다대일 구조로 설계되었습니다.
 */
@Entity
@Table(name = "device_token")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_token_id")
    private Long deviceTokenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "fcm_token", length = 512, nullable = false)
    private String fcmToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", length = 20)
    private DeviceType deviceType;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    private DeviceToken(User user, String fcmToken, DeviceType deviceType, boolean isActive) {
        this.user = user;
        this.fcmToken = fcmToken;
        this.deviceType = deviceType;
        this.isActive = isActive;
    }

    /**
     * 해당 토큰(기기)을 비활성화하여 푸시 발송 대상에서 제외합니다.
     */
    public void deactivate() {
        this.isActive = false;
    }

    /**
     * 만약 다른 사용자가 쓰던 기기이거나 토큰이 부활하는 경우 토큰 값을 갱신 및 활성화합니다.
     * 
     * @param user 새로운(또는 기존) 사용자 정보
     * @param deviceType 해당 기기의 최신 OS 유형
     */
    public void activateForUser(User user, DeviceType deviceType) {
        this.user = user;
        this.deviceType = deviceType;
        this.isActive = true;
    }
}
