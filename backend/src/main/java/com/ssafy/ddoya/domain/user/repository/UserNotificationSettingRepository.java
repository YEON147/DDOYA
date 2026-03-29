package com.ssafy.ddoya.domain.user.repository;

import com.ssafy.ddoya.domain.user.entity.UserNotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 사용자의 알림 수신 설정(UserNotificationSetting) 엔티티에 대한 데이터 액세스 처리를 담당하는 레포지토리 인터페이스입니다.
 */
@Repository
public interface UserNotificationSettingRepository extends JpaRepository<UserNotificationSetting, Long> {
    
    /**
     * 특정 사용자 ID를 기반으로 알림 설정 정보를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 알림 설정 정보 (Optional)
     */
    Optional<UserNotificationSetting> findByUserId(Long userId);
}
