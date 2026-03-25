package com.ssafy.ddoya.domain.intake.repository;

import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * 섭취 일정(IntakeSchedule) 엔티티에 대한 데이터 액세스 처리를 담당하는 레포지토리 인터페이스입니다.
 */
@Repository
public interface IntakeScheduleRepository extends JpaRepository<IntakeSchedule, Long> {

        /**
         * 특정 영양제와 연관된 모든 섭취 일정을 조회합니다.
         *
         * @param supplementId 영양제 ID
         * @return 섭취 일정 리스트
         */
        @Query("SELECT s FROM IntakeSchedule s WHERE s.supplement.userSupplementId = :supplementId")
        List<IntakeSchedule> findBySupplementId(@Param("supplementId") Long supplementId);

        /**
         * 영양제 삭제 시 연관된 모든 섭취 일정을 일괄 삭제합니다.
         *
         * @param supplementId 영양제 ID
         */
        // 영양제 삭제 시 연관 스케줄 일괄 삭제
        @Modifying(clearAutomatically = true)
        @Query("DELETE FROM IntakeSchedule s WHERE s.supplement.userSupplementId = :supplementId")
        void deleteBySupplementId(@Param("supplementId") Long supplementId);

        /**
         * 특정 사용자, 특정 영양제, 특정 일정 유형에 해당하는 일정을 시간 순으로 조회합니다.
         *
         * @param supplementId 영양제 ID
         * @param userId       사용자 ID
         * @param scheduleType 일정 유형
         * @return 정렬된 섭취 일정 리스트
         */
        // 영양제 수정 API용: supplementId + userId + scheduleType = INTAKE 기준 조회
        @Query("SELECT s FROM IntakeSchedule s " +
                        "WHERE s.supplement.userSupplementId = :supplementId " +
                        "AND s.user.userId = :userId " +
                        "AND s.scheduleType = :scheduleType " +
                        "ORDER BY s.intakeTime ASC")
        List<IntakeSchedule> findBySupplementIdAndUserIdAndScheduleType(
                        @Param("supplementId") Long supplementId,
                        @Param("userId") Long userId,
                        @Param("scheduleType") ScheduleType scheduleType);

        /**
         * 특정 일정 유형을 가진 모든 일정을 조회합니다.
         *
         * @param scheduleType 일정 유형
         * @return 섭취 일정 리스트
         */
        List<IntakeSchedule> findAllByScheduleType(ScheduleType scheduleType);

        /**
         * 특정 사용자에게 할당된 특정 일정 유형의 스케줄을 조회합니다.
         * 약 챙김 알림(CARRY)조회 시 사용됩니다.
         *
         * @param userId       사용자 ID
         * @param scheduleType 일정 유형
         * @return 조회된 섭취 일정 (Optional)
         */
        Optional<IntakeSchedule> findByUser_UserIdAndScheduleType(Long userId, ScheduleType scheduleType);

        /**
         * 특정 시간 및 일치하는 일정 유형을 가진 스케줄 중,
         * 사용자의 챙김 알림 설정이 활성화된 건들을 조회합니다.
         *
         * @param scheduleType 일정 유형
         * @param intakeTime   조회할 시간 (시:분)
         * @return 챙김 알림 대상 일정 리스트
         */
        @Query("SELECT s FROM IntakeSchedule s " +
                        "JOIN FETCH s.user u " +
                        "JOIN FETCH u.notificationSetting ns " +
                        "WHERE s.scheduleType = :scheduleType " +
                        "AND s.intakeTime = :intakeTime " +
                        "AND ns.carryNotificationEnabled = true")
        List<IntakeSchedule> findAllByScheduleTypeAndIntakeTimeAndCarryEnabled(
                        @Param("scheduleType") ScheduleType scheduleType,
                        @Param("intakeTime") LocalTime intakeTime);
}
