package com.ssafy.ddoya.domain.notification.repository;

import com.ssafy.ddoya.domain.notification.entity.NotificationDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 알림 발송 기록(NotificationDeliveryLog) 엔티티에 대한 데이터 액세스 처리를 담당하는 레포지토리 인터페이스입니다.
 */
@Repository
public interface NotificationDeliveryLogRepository extends JpaRepository<NotificationDeliveryLog, Long> {

    /**
     * 특정 섭취 기록(IntakeRecord)에 대해 가장 최근에 발송된 로그를 조회합니다.
     * 
     * @param intakeRecordId 섭취 기록 ID
     * @return 가장 최신 발송 로그 (Optional)
     */
    Optional<NotificationDeliveryLog> findTopByIntakeRecord_IntakeRecordIdOrderBySentAtDesc(Long intakeRecordId);
}
