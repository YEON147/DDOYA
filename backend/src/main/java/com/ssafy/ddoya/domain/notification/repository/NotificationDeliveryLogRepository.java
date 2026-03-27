package com.ssafy.ddoya.domain.notification.repository;

import com.ssafy.ddoya.domain.notification.entity.NotificationDeliveryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 알림 발송 기록(NotificationDeliveryLog) 엔티티에 대한 데이터 액세스 처리를 담당하는 레포지토리 인터페이스입니다.
 */
@Repository
public interface NotificationDeliveryLogRepository extends JpaRepository<NotificationDeliveryLog, Long> {

    /**
     * 특정 사용자의 삭제되지 않은 알림 목록을 최신순으로 페이징 조회합니다.
     */
    Page<NotificationDeliveryLog> findByUser_UserIdAndIsDeletedFalseOrderBySentAtDesc(Long userId, Pageable pageable);

    /**
     * 특정 사용자의 모든 알림 내역을 삭제 처리(Soft Delete) 합니다.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE NotificationDeliveryLog n SET n.isDeleted = true WHERE n.user.userId = :userId AND n.isDeleted = false")
    void deleteAllByUser_UserId(@Param("userId") Long userId);

    /**
     * 특정 섭취 기록(IntakeRecord)에 대해 가장 최근에 발송된 로그를 조회합니다.
     */
    @Query("SELECT n FROM NotificationDeliveryLog n WHERE n.intakeRecord.intakeRecordId = :intakeRecordId")
    Optional<NotificationDeliveryLog> findTopByIntakeRecord_IntakeRecordIdOrderBySentAtDesc(@Param("intakeRecordId") Long intakeRecordId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM NotificationDeliveryLog n WHERE n.schedule.scheduleId IN :scheduleIds")
    void deleteByScheduleIdIn(@Param("scheduleIds") List<Long> scheduleIds);
}
