package com.ssafy.ddoya.domain.notification.repository;

import com.ssafy.ddoya.domain.notification.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * FCM 기기 토큰 데이터를 DB에서 다루기 위한 리포지토리입니다.
 */
@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    /**
     * 특정 사용자에게 등록되어 있고 현재 활성화된(푸시 수신 동의 상태인) 토큰 목록을 반환합니다.
     */
    List<DeviceToken> findAllByUser_UserIdAndIsActiveTrue(Long userId);

    /**
     * 입력받은 고유 FCM 토큰을 가진 기기 정보를 찾습니다. (가입/갱신 시 중복 체크용)
     */
    Optional<DeviceToken> findByFcmToken(String fcmToken);
}
