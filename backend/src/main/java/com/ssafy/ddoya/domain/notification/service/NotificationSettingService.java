package com.ssafy.ddoya.domain.notification.service;

import com.ssafy.ddoya.domain.intake.entity.IntakeSchedule;
import com.ssafy.ddoya.domain.intake.entity.ScheduleType;
import com.ssafy.ddoya.domain.intake.repository.IntakeScheduleRepository;
import com.ssafy.ddoya.domain.notification.dto.*;
import com.ssafy.ddoya.domain.user.entity.User;
import com.ssafy.ddoya.domain.user.entity.UserNotificationSetting;
import com.ssafy.ddoya.domain.user.repository.UserNotificationSettingRepository;
import com.ssafy.ddoya.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

/**
 * 사용자의 알림 수신 여부 설정 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationSettingService {

    private final UserNotificationSettingRepository userNotificationSettingRepository;
    private final IntakeScheduleRepository intakeScheduleRepository;

    /**
     * 특정 사용자의 알림 수신 여부 설정을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 알림 설정 응답 DTO
     * @throws CustomException 알림 설정 정보를 찾을 수 없을 때 발생
     */
    public NotificationSettingResponse getNotificationSettings(Long userId) {
        UserNotificationSetting setting = getSettingByUserId(userId);
        return NotificationSettingResponse.from(setting);
    }

    /** 섭취 알림 설정 수정 */
    @Transactional
    public NotificationSettingResponse updateIntakeNotificationSetting(Long userId, boolean enabled) {
        UserNotificationSetting setting = getSettingByUserId(userId);
        setting.updateIntakeNotificationEnabled(enabled);
        return NotificationSettingResponse.from(setting);
    }

    /** 휴대 알림 설정 수정 */
    @Transactional
    public NotificationSettingResponse updateCarryNotificationSetting(Long userId, boolean enabled) {
        UserNotificationSetting setting = getSettingByUserId(userId);
        setting.updateCarryNotificationEnabled(enabled);
        return NotificationSettingResponse.from(setting);
    }

    /** 재고 알림 설정 수정 */
    @Transactional
    public NotificationSettingResponse updateStockNotificationSetting(Long userId, boolean enabled) {
        UserNotificationSetting setting = getSettingByUserId(userId);
        setting.updateStockNotificationEnabled(enabled);
        return NotificationSettingResponse.from(setting);
    }

    private UserNotificationSetting getSettingByUserId(Long userId) {
        return userNotificationSettingRepository.findByUserId(userId)
                .orElseThrow(() -> CustomException.notFound("알림 설정 정보를 찾을 수 없습니다."));
    }

    /** 챙김 알림 시각 수정 */
    @Transactional
    public CarryNotificationTimeUpdateResponse updateCarryNotificationTime(Long userId, String carryNotificationTime) {
        LocalTime time = LocalTime.parse(carryNotificationTime);
        
        IntakeSchedule carrySchedule = intakeScheduleRepository.findByUser_UserIdAndScheduleTypeAndIsActiveTrue(userId, ScheduleType.CARRY)
                .orElseThrow(() -> CustomException.notFound("약 챙김 알림 스케줄을 찾을 수 없습니다."));

        carrySchedule.updateIntakeTime(time);
        
        return new CarryNotificationTimeUpdateResponse(carrySchedule.getIntakeTime().toString().substring(0, 5));
    }

    /** 챙김 알림 시각 조회 */
    public CarryNotificationTimeUpdateResponse getCarryNotificationTime(Long userId) {
        IntakeSchedule carrySchedule = intakeScheduleRepository.findByUser_UserIdAndScheduleTypeAndIsActiveTrue(userId, ScheduleType.CARRY)
                .orElseThrow(() -> CustomException.notFound("약 챙김 알림 스케줄을 찾을 수 없습니다."));

        return new CarryNotificationTimeUpdateResponse(carrySchedule.getIntakeTime().toString().substring(0, 5));
    }

    /**
     * 회원가입 시 기본 알림 설정을 모두 허용(true) 상태로 생성합니다.
     *
     * @param user 대상 사용자 엔티티
     */
    @Transactional
    public void createDefaultNotificationSetting(User user) {
        UserNotificationSetting setting = UserNotificationSetting.builder()
                .user(user)
                .intakeNotificationEnabled(true)
                .carryNotificationEnabled(true)
                .stockNotificationEnabled(true)
                .build();
        
        userNotificationSettingRepository.save(setting);
    }

    /**
     * 회원가입 시 기본 약 챙김 알림 스케줄(CARRY)을 20:00 시각으로 생성합니다.
     *
     * @param user 대상 사용자 엔티티
     */
    @Transactional
    public void createDefaultCarrySchedule(User user) {
        IntakeSchedule carrySchedule = IntakeSchedule.builder()
                .user(user)
                .supplement(null) // 챙김 알림은 영양제와 연결되지 않음
                .intakeTime(LocalTime.of(20, 0))
                .scheduleType(ScheduleType.CARRY)
                .dosePerIntake(null) // 챙김 알림이므로 섭취량은 null (schema nullable=true 선호)
                .build();
        
        intakeScheduleRepository.save(carrySchedule);
    }
}
